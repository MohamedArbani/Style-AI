import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { db, wardrobeItemsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const router: IRouter = Router();

async function getUserPreferences(userId: string) {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return user || null;
  } catch {
    return null;
  }
}

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this clothing item image and return a JSON object with these fields:
- name: short descriptive name (e.g. "White Linen Shirt", "Slim Fit Jeans")
- category: one of ["Tops & T-shirts", "Shirts", "Jackets & Coats", "Bottoms", "Dresses", "Shoes", "Accessories", "Sportswear", "Outerwear"]
- color: primary color name (e.g. "White", "Navy Blue", "Beige")
- season: one of ["Spring", "Summer", "Autumn", "Winter", "All Season"]
- tags: array of 2-4 descriptive tags (e.g. ["Casual", "Cotton", "Classic"])
${styleContext}

Return ONLY valid JSON, nothing else.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    res.json(parsed);
  } catch (err) {
    console.error("Error scanning clothing:", err);
    res.status(500).json({ error: "Failed to scan clothing" });
  }
});

router.post("/outfits/recommend", async (req, res) => {
  try {
    const { userId, occasion, weather } = req.body;

    const items = userId
      ? await db.select().from(wardrobeItemsTable).where(eq(wardrobeItemsTable.userId, userId))
      : [];

    if (items.length === 0) {
      res.json([]);
      return;
    }

    const userPrefs = userId ? await getUserPreferences(userId) : null;
    const itemsList = items
      .map(item => `- ${item.name} (${item.category}, ${item.color}, ${item.season || "All Season"})`)
      .join("\n");

    const styleContext = userPrefs?.stylePreferences?.length
      ? `User's style preferences: ${userPrefs.stylePreferences.join(", ")}`
      : "";
    const genderContext = userPrefs?.gender ? `User gender: ${userPrefs.gender}` : "";
    const ageContext = userPrefs?.ageRange ? `Age range: ${userPrefs.ageRange}` : "";

    const prompt = `You are a professional fashion stylist. Based on the user's wardrobe, create 3 outfit recommendations.

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

Choose items that go well together. matchScore is 0-100. Return ONLY valid JSON array.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const outfits = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const result = outfits.map((outfit: { id: string; name: string; description: string; itemNames: string[]; occasion: string; matchScore: number; tags: string[] }) => ({
      ...outfit,
      items: outfit.itemNames?.map((name: string) => {
        const found = items.find(i =>
          i.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(i.name.toLowerCase())
        );
        return found ? { ...found, createdAt: found.createdAt.toISOString() } : null;
      }).filter(Boolean) || [],
    }));

    res.json(result);
  } catch (err) {
    console.error("Error recommending outfits:", err);
    res.status(500).json({ error: "Failed to recommend outfits" });
  }
});

router.post("/ai/try-on", async (req, res) => {
  try {
    const { userPhotoBase64, selectedItemIds, userId } = req.body;
    if (!userPhotoBase64 || !selectedItemIds?.length) {
      res.status(400).json({ error: "userPhotoBase64 and selectedItemIds are required" });
      return;
    }

    const items = userId
      ? await db.select().from(wardrobeItemsTable).where(eq(wardrobeItemsTable.userId, userId))
      : [];

    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    const itemDescriptions = selectedItems.length > 0
      ? selectedItems.map(item => `${item.name} (${item.color} ${item.category})`).join(", ")
      : "stylish modern outfit";

    const userPrefs = userId ? await getUserPreferences(userId) : null;
    const styleContext = userPrefs?.stylePreferences?.length
      ? ` with a ${userPrefs.stylePreferences.join(" and ")} aesthetic`
      : "";

    const prompt = `Create a realistic fashion photo of a stylish person wearing: ${itemDescriptions}${styleContext}.
Full-body fashion photograph, professional studio lighting, clean neutral background.
All clothing items clearly visible, well-coordinated. Fashion magazine quality. Photorealistic.
No text, letters, numbers, or watermarks anywhere in the image.`;

    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const imageBase64 = imageResponse.data?.[0]?.b64_json;
    if (!imageBase64) {
      res.status(500).json({ error: "Failed to generate image" });
      return;
    }

    res.json({
      imageBase64,
      description: `AI-generated outfit: ${itemDescriptions}`,
    });
  } catch (err) {
    console.error("Error generating try-on:", err);
    res.status(500).json({ error: "Failed to generate try-on image" });
  }
});

export default router;
