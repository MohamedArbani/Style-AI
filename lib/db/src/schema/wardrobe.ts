import { pgTable, text, timestamp, uuid, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wardrobeItemsTable = pgTable("wardrobe_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  color: text("color").notNull(),
  season: text("season"),
  brand: text("brand"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWardrobeItemSchema = createInsertSchema(wardrobeItemsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertWardrobeItem = z.infer<typeof insertWardrobeItemSchema>;
export type WardrobeItem = typeof wardrobeItemsTable.$inferSelect;
