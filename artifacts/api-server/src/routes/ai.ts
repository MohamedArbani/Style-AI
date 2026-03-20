import { Router, type IRouter } from "express";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";
import { db, wardrobeItemsTable, usersTable, eq } from "@workspace/db";

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Free vision model for clothing scan
const VISION_MODEL = "google/gemma-3-27b-it:free";
// Free text model for outfit recommendations
const TEXT_MODEL = "openrouter/free";
// Free image generation model via HuggingFace Inference API
const HF_IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell";

const router: IRouter = Router();

async function getUserPreferences(userId: string) {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    return user || null;
  } catch {
    return null;
  }
}

const scanSchema = z.object({
  name: z.string().describe('Short descriptive name, e.g. "White Linen Shirt"'),
  category: z.enum([
    "Tops & T-shirts",
    "Shirts",
    "Jackets & Coats",
    "Bottoms",
    "Dresses",
    "Shoes",
    "Accessories",
    "Sportswear",
    "Outerwear",
  ]),
  color: z.string().describe('Primary color name, e.g. "Navy Blue"'),
  season: z.enum(["Spring", "Summer", "Autumn", "Winter", "All Season"]),
  tags: z.array(z.string()).min(2).max(4).describe("2-4 descriptive tags"),
});

router.post("/wardrobe/scan", async (req, res) => {
  try {
    const { imageBase64, userId } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const userPrefs = userId ? await getUserPreferences(userId) : null;
    const styleContext = userPrefs?.stylePreferences?.length
      ? `The user's style preferences are: ${userPrefs.stylePreferences.join(", ")}.`
      : "";

    const result = await generateText({
      model: openrouter(VISION_MODEL),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this clothing item image.
${styleContext}
Return a JSON object with: name, category, color, season, tags.
Categories: "Tops & T-shirts", "Shirts", "Jackets & Coats", "Bottoms", "Dresses", "Shoes", "Accessories", "Sportswear", "Outerwear".
Seasons: "Spring", "Summer", "Autumn", "Winter", "All Season".
Return ONLY valid JSON, nothing else.`,
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
      maxOutputTokens: 1024,
    });

    const text = result.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    const parsed = scanSchema.safeParse(raw);
    res.json(parsed.success ? parsed.data : raw);
  } catch (err) {
    console.error("Error scanning clothing:", err);
    res.status(500).json({ error: "Failed to scan clothing" });
  }
});

router.post("/outfits/recommend", async (req, res) => {
  try {
    const { userId, occasion, weather } = req.body;

    const items = userId
      ? await db
          .select()
          .from(wardrobeItemsTable)
          .where(eq(wardrobeItemsTable.userId, userId))
      : [];

    if (items.length === 0) {
      res.json([]);
      return;
    }

    const userPrefs = userId ? await getUserPreferences(userId) : null;
    const itemsList = items
      .map(
        (item: {
          name: string;
          category: string;
          color: string;
          season: string | null;
        }) =>
          `- ${item.name} (${item.category}, ${item.color}, ${item.season || "All Season"})`,
      )
      .join("\n");

    const styleContext = userPrefs?.stylePreferences?.length
      ? `User's style preferences: ${userPrefs.stylePreferences.join(", ")}`
      : "";
    const genderContext = userPrefs?.gender
      ? `User gender: ${userPrefs.gender}`
      : "";
    const ageContext = userPrefs?.ageRange
      ? `Age range: ${userPrefs.ageRange}`
      : "";

    const result = await generateText({
      model: openrouter(TEXT_MODEL),
      maxOutputTokens: 2048,
      prompt: `You are a professional fashion stylist. Based on the user's wardrobe, create 3 outfit recommendations.

User's wardrobe:
${itemsList}

${occasion ? `Occasion: ${occasion}` : ""}
${weather ? `Weather: ${weather}` : ""}
${styleContext}
${genderContext}
${ageContext}

Return a JSON array of exactly 3 outfit objects:
[
  {
    "id": "outfit1",
    "name": "outfit name",
    "description": "brief style description tailored to the user's preferences",
    "itemNames": ["item name 1", "item name 2"],
    "occasion": "suitable occasion",
    "matchScore": 95,
    "tags": ["tag1", "tag2"]
  }
]

Choose items that go well together. matchScore is 0-100. Return ONLY valid JSON array.`,
    });

    const text = result.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const outfits: {
      id: string;
      name: string;
      description: string;
      itemNames: string[];
      occasion: string;
      matchScore: number;
      tags: string[];
    }[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const mapped = outfits.map((outfit) => ({
      ...outfit,
      items:
        outfit.itemNames
          ?.map((name) => {
            const found = items.find(
              (i: { name: string }) =>
                i.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(i.name.toLowerCase()),
            );
            return found
              ? {
                  ...found,
                  createdAt: (
                    found as { createdAt: Date }
                  ).createdAt.toISOString(),
                }
              : null;
          })
          .filter(Boolean) || [],
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Error recommending outfits:", err);
    res.status(500).json({ error: "Failed to recommend outfits" });
  }
});

router.post("/ai/try-on", async (req, res) => {
  try {
    const { userPhotoBase64, selectedItemIds, userId } = req.body;
    if (!userPhotoBase64 || !selectedItemIds?.length) {
      res
        .status(400)
        .json({ error: "userPhotoBase64 and selectedItemIds are required" });
      return;
    }

    const items = userId
      ? await db
          .select()
          .from(wardrobeItemsTable)
          .where(eq(wardrobeItemsTable.userId, userId))
      : [];

    const selectedItems = items.filter((item: { id: string }) =>
      selectedItemIds.includes(item.id),
    );
    const itemDescriptions =
      selectedItems.length > 0
        ? selectedItems
            .map(
              (item: { name: string; color: string; category: string }) =>
                `${item.name} (${item.color} ${item.category})`,
            )
            .join(", ")
        : "stylish modern outfit";

    const userPrefs = userId ? await getUserPreferences(userId) : null;
    const styleContext = userPrefs?.stylePreferences?.length
      ? ` with a ${userPrefs.stylePreferences.join(" and ")} aesthetic`
      : "";

    // Virtual try-on: generate an image using HuggingFace's free Inference API
    const prompt = `Full-body fashion photo of a person wearing: ${itemDescriptions}${styleContext}. Professional studio lighting, clean neutral background, fashion magazine quality. All clothing items clearly visible and well-coordinated. Photorealistic. No text, letters, numbers, or watermarks.`;

    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      res.status(500).json({ error: "HUGGINGFACE_API_KEY not configured" });
      return;
    }

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HF_IMAGE_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(
        "HuggingFace image generation error:",
        response.status,
        errBody,
      );
      res.status(500).json({ error: "Failed to generate try-on image" });
      return;
    }

    // HuggingFace Inference API returns raw image bytes
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const imageBase64 = imageBuffer.toString("base64");

    res.json({
      imageBase64,
      description: `AI-generated outfit: ${itemDescriptions}`,
    });
  } catch (err) {
    console.error("Error generating try-on:", err);
    res.status(500).json({ error: "Failed to generate try-on" });
  }
});

export default router;
