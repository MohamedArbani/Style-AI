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

const CATEGORY_OPTIONS = [
  "Tops & T-shirts",
  "Shirts",
  "Jackets & Coats",
  "Bottoms",
  "Dresses",
  "Shoes",
  "Accessories",
  "Sportswear",
  "Outerwear",
] as const;

const SEASON_OPTIONS = [
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
  "All Season",
] as const;

const CATEGORY_ALIASES: Record<string, string[]> = {
  "Tops & T-shirts": ["top", "tops", "t-shirt", "tee", "tshirt"],
  Shirts: ["shirt", "button down", "button-up", "button up", "blouse"],
  "Jackets & Coats": ["jacket", "coat", "blazer", "trench", "parka"],
  Bottoms: [
    "bottom",
    "bottoms",
    "pants",
    "trousers",
    "jeans",
    "shorts",
    "skirt",
  ],
  Dresses: ["dress", "gown"],
  Shoes: ["shoe", "shoes", "sneaker", "heel", "boots", "loafer", "sandals"],
  Accessories: [
    "accessory",
    "accessories",
    "bag",
    "belt",
    "hat",
    "scarf",
    "jewelry",
  ],
  Sportswear: ["sportswear", "activewear", "gym wear", "athletic"],
  Outerwear: ["outerwear", "hoodie", "cardigan", "sweater", "pullover"],
};

const SEASON_ALIASES: Record<string, string[]> = {
  Spring: ["spring"],
  Summer: ["summer"],
  Autumn: ["autumn", "fall"],
  Winter: ["winter"],
  "All Season": [
    "all season",
    "all seasons",
    "year round",
    "year-round",
    "any season",
  ],
};

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
  name: z
    .string()
    .min(1)
    .describe('Short descriptive name, e.g. "White Linen Shirt"'),
  category: z.string().min(1),
  color: z
    .string()
    .min(1)
    .describe('Primary color name or hex value, e.g. "Navy Blue" or "#1B2CC1"'),
  season: z.string().min(1).optional(),
  brand: z.string().trim().min(1).max(60).optional(),
  notes: z.string().trim().min(1).max(220).optional(),
  tags: z
    .array(z.string().trim().min(1))
    .min(2)
    .max(4)
    .describe("2-4 descriptive tags"),
});

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

function normalizeChoice(
  value: string | undefined,
  options: readonly string[],
  aliases: Record<string, string[]>,
) {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeText(value);
  const directMatch = options.find(
    (option) => normalizeText(option) === normalized,
  );
  if (directMatch) {
    return directMatch;
  }

  for (const option of options) {
    const candidates = [option, ...(aliases[option] ?? [])].map(normalizeText);
    if (candidates.includes(normalized)) {
      return option;
    }
  }

  for (const option of options) {
    const candidates = [option, ...(aliases[option] ?? [])].map(normalizeText);
    if (candidates.some((candidate) => normalized.includes(candidate))) {
      return option;
    }
  }

  return undefined;
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
Return a JSON object with: name, category, color, season, brand, notes, tags.
Categories must map to one of: ${CATEGORY_OPTIONS.map((option) => `"${option}"`).join(", ")}.
Seasons must map to one of: ${SEASON_OPTIONS.map((option) => `"${option}"`).join(", ")}.
For brand, return the visible brand name if present, otherwise an empty string.
For notes, return one short sentence with useful item details like fabric, pattern, fit, or finish.
For color, prefer a plain color name when obvious; otherwise return the closest useful color description.
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

    if (!parsed.success) {
      res.json(raw);
      return;
    }

    const normalizedCategory = normalizeChoice(
      parsed.data.category,
      CATEGORY_OPTIONS,
      CATEGORY_ALIASES,
    );
    const normalizedSeason = normalizeChoice(
      parsed.data.season,
      SEASON_OPTIONS,
      SEASON_ALIASES,
    );

    res.json({
      name: parsed.data.name.trim(),
      category: normalizedCategory ?? parsed.data.category.trim(),
      color: parsed.data.color.trim(),
      season: normalizedSeason ?? parsed.data.season?.trim(),
      brand: parsed.data.brand?.trim() || undefined,
      notes: parsed.data.notes?.trim() || undefined,
      tags: parsed.data.tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 4),
    });
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
      res.status(500).json({
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
