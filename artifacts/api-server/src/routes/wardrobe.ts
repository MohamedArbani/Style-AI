import { Router, type IRouter } from "express";
import { db, wardrobeItemsTable, eq, and } from "@workspace/db";

const router: IRouter = Router();

router.get("/wardrobe/items", async (req, res) => {
  try {
    const { userId, category } = req.query as {
      userId?: string;
      category?: string;
    };
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    const conditions = [eq(wardrobeItemsTable.userId, userId)];
    if (category && category !== "All") {
      conditions.push(eq(wardrobeItemsTable.category, category));
    }
    const items = await db
      .select()
      .from(wardrobeItemsTable)
      .where(and(...conditions))
      .orderBy(wardrobeItemsTable.createdAt);
    res.json(
      items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error("Error getting wardrobe items:", err);
    res.status(500).json({ error: "Failed to get wardrobe items" });
  }
});

router.post("/wardrobe/items", async (req, res) => {
  try {
    const {
      userId,
      name,
      category,
      color,
      season,
      brand,
      notes,
      imageUrl,
      tags,
    } = req.body;
    if (!userId || !name || !category || !color) {
      res
        .status(400)
        .json({ error: "userId, name, category, and color are required" });
      return;
    }
    const [item] = await db
      .insert(wardrobeItemsTable)
      .values({
        userId,
        name,
        category,
        color,
        season,
        brand,
        notes,
        imageUrl,
        tags: tags || [],
      })
      .returning();
    res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
  } catch (err) {
    console.error("Error creating wardrobe item:", err);
    res.status(500).json({ error: "Failed to create wardrobe item" });
  }
});

router.delete("/wardrobe/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(wardrobeItemsTable).where(eq(wardrobeItemsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting wardrobe item:", err);
    res.status(500).json({ error: "Failed to delete wardrobe item" });
  }
});

export default router;
