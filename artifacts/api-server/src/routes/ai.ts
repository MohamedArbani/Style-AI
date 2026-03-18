import { Router, type IRouter } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const router: IRouter = Router();

router.post("/wardrobe/scan", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
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
    const { userId, occasion, weather, stylePreferences } = req.body;

    const { db, wardrobeItemsTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    const items = await db.select().from(wardrobeItemsTable).where(eq(wardrobeItemsTable.userId, userId));

    if (items.length === 0) {
      res.json([]);
      return;
    }

    const itemsList = items.map(item => `- ${item.name} (${item.category}, ${item.color}, ${item.season || "All Season"})`).join("\n");

    const prompt = `You are a professional fashion stylist. Based on the user's wardrobe, create 3 outfit recommendations.

User's wardrobe:
${itemsList}

${occasion ? `Occasion: ${occasion}` : ""}
${weather ? `Weather: ${weather}` : ""}
${stylePreferences?.length ? `Style preferences: ${stylePreferences.join(", ")}` : ""}

Return a JSON array of exactly 3 outfit objects with this structure:
[
  {
    "id": "outfit1",
    "name": "outfit name",
    "description": "brief style description",
    "itemNames": ["item name 1", "item name 2", ...],
    "occasion": "suitable occasion",
    "matchScore": 95,
    "tags": ["tag1", "tag2"]
  }
]

Choose items that go well together. matchScore is 0-100. Return ONLY valid JSON array.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const outfits = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const result = outfits.map((outfit: { id: string; name: string; description: string; itemNames: string[]; occasion: string; matchScore: number; tags: string[] }) => ({
      ...outfit,
      items: outfit.itemNames?.map((name: string) => {
        const found = items.find(i => i.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(i.name.toLowerCase()));
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

    const { db, wardrobeItemsTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    const items = await db.select().from(wardrobeItemsTable).where(eq(wardrobeItemsTable.userId, userId));
    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    const itemDescriptions = selectedItems.map(item => `${item.name} (${item.color} ${item.category})`).join(", ");

    const prompt = `Create a realistic fashion photo of a stylish person wearing the following outfit: ${itemDescriptions}. 
The image should be a full-body or 3/4 length fashion photograph, professional studio lighting, clean white or neutral background. 
The outfit items should be clearly visible and well-coordinated. Fashion magazine quality. Photorealistic style.
Absolutely no text, letters, numbers, or watermarks visible anywhere.`;

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
