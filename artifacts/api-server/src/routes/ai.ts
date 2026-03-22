import { Router, type IRouter } from "express";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";
import { db, wardrobeItemsTable, usersTable, eq } from "@workspace/db";
import axios from "axios";
import FormData from "form-data";

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

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiHost =
      process.env.RAPIDAPI_HOST ?? "virtual-try-on7.p.rapidapi.com";
    if (!rapidApiKey) {
      res.status(500).json({ error: "RAPIDAPI_KEY not configured" });
      return;
    }

    // Fetch selected wardrobe items from DB
    const allItems = userId
      ? await db
          .select()
          .from(wardrobeItemsTable)
          .where(eq(wardrobeItemsTable.userId, userId))
      : [];

    const selectedItems = allItems.filter((item: { id: string }) =>
      selectedItemIds.includes(item.id),
    );

    if (selectedItems.length === 0) {
      res.status(400).json({ error: "No valid wardrobe items found" });
      return;
    }

    // Helper: fetch an image URL and return its buffer
    async function fetchImageBuffer(
      url: string,
    ): Promise<Buffer<ArrayBuffer> | null> {
      try {
        const resp = await axios.get<ArrayBuffer>(url, {
          responseType: "arraybuffer",
          timeout: 15000,
        });
        return Buffer.from(resp.data) as Buffer<ArrayBuffer>;
      } catch {
        return null;
      }
    }

    // Helper: run a single RapidAPI try-on call
    async function runTryOn(
      personBuf: Buffer<ArrayBuffer>,
      apparelBuf: Buffer<ArrayBuffer>,
    ): Promise<Buffer<ArrayBuffer>> {
      const form = new FormData();
      form.append("image", personBuf, {
        filename: "person.jpg",
        contentType: "image/jpeg",
      });
      form.append("image-apparel", apparelBuf, {
        filename: "apparel.jpg",
        contentType: "image/jpeg",
      });

      const response = await axios.post(
        `https://${rapidApiHost}/results`,
        form,
        {
          headers: {
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": rapidApiHost,
            ...form.getHeaders(),
          },
          timeout: 90000,
        },
      );

      const base64: string | undefined =
        response.data?.results?.[0]?.entities?.[0]?.image;
      if (!base64) throw new Error("Missing image in RapidAPI response");

      const clean = base64.startsWith("data:") ? base64.split(",")[1] : base64;
      return Buffer.from(clean!, "base64") as Buffer<ArrayBuffer>;
    }

    // Convert person photo base64 → buffer
    let currentPersonBuf: Buffer<ArrayBuffer> = Buffer.from(
      userPhotoBase64,
      "base64",
    ) as Buffer<ArrayBuffer>;

    const itemNames: string[] = [];

    // Chain try-ons: for each selected item, run the API sequentially
    // Output of one try-on becomes the person photo for the next
    for (const item of selectedItems) {
      const imgUrl = (item as { imageUrl?: string | null; name: string })
        .imageUrl;
      if (!imgUrl) continue; // skip items without an image

      let apparelBuf: Buffer<ArrayBuffer> | null = null;
      if (imgUrl.startsWith("data:")) {
        const b64part = imgUrl.split(",")[1];
        if (b64part)
          apparelBuf = Buffer.from(b64part, "base64") as Buffer<ArrayBuffer>;
      } else {
        apparelBuf = await fetchImageBuffer(imgUrl);
      }

      if (!apparelBuf) {
        console.warn(`Could not load image for item ${item.id}, skipping`);
        continue;
      }

      try {
        currentPersonBuf = await runTryOn(currentPersonBuf, apparelBuf);
        itemNames.push((item as { name: string }).name);
      } catch (err) {
        console.error(`Try-on failed for item ${item.id}:`, err);
        // Don't abort — continue with remaining items
      }
    }

    if (itemNames.length === 0) {
      res
        .status(500)
        .json({
          error: "Could not process any wardrobe items (missing images?)",
        });
      return;
    }

    const imageBase64 = currentPersonBuf.toString("base64");
    const description = `Virtual try-on: wearing ${itemNames.join(", ")}`;

    res.json({ imageBase64, description });
  } catch (err) {
    console.error("Error generating try-on:", err);
    res.status(500).json({ error: "Failed to generate try-on" });
  }
});

export default router;
