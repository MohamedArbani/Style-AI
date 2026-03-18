import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type WardrobeItem = {
  id: string;
  userId: string;
  name: string;
  category: string;
  color: string;
  season?: string;
  brand?: string;
  notes?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
};

type WardrobeContextType = {
  items: WardrobeItem[];
  isLoading: boolean;
  fetchItems: (category?: string) => Promise<void>;
  addItem: (item: Omit<WardrobeItem, "id" | "userId" | "createdAt">) => Promise<WardrobeItem>;
  removeItem: (id: string) => Promise<void>;
  scanItem: (imageBase64: string) => Promise<Partial<WardrobeItem>>;
  recommendOutfits: (params?: { occasion?: string; weather?: string; stylePreferences?: string[] }) => Promise<OutfitRecommendation[]>;
  generateTryOn: (userPhotoBase64: string, selectedItemIds: string[]) => Promise<{ imageBase64: string; description: string }>;
};

export type OutfitRecommendation = {
  id: string;
  name: string;
  description: string;
  items: WardrobeItem[];
  occasion?: string;
  matchScore: number;
  tags?: string[];
};

const WardrobeContext = createContext<WardrobeContextType | null>(null);

const getBaseUrl = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
};

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(async (category?: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ userId: user.id });
      if (category && category !== "All") params.set("category", category);
      const res = await fetch(`${getBaseUrl()}/api/wardrobe/items?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addItem = useCallback(async (item: Omit<WardrobeItem, "id" | "userId" | "createdAt">) => {
    if (!user) throw new Error("Not authenticated");
    const res = await fetch(`${getBaseUrl()}/api/wardrobe/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, userId: user.id }),
    });
    if (!res.ok) throw new Error("Failed to add item");
    const created: WardrobeItem = await res.json();
    setItems(prev => [created, ...prev]);
    return created;
  }, [user]);

  const removeItem = useCallback(async (id: string) => {
    await fetch(`${getBaseUrl()}/api/wardrobe/items/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const scanItem = useCallback(async (imageBase64: string) => {
    const res = await fetch(`${getBaseUrl()}/api/wardrobe/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
    });
    if (!res.ok) throw new Error("Failed to scan item");
    return res.json();
  }, []);

  const recommendOutfits = useCallback(async (params?: { occasion?: string; weather?: string; stylePreferences?: string[] }) => {
    if (!user) return [];
    const res = await fetch(`${getBaseUrl()}/api/outfits/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ...params }),
    });
    if (!res.ok) throw new Error("Failed to recommend outfits");
    return res.json();
  }, [user]);

  const generateTryOn = useCallback(async (userPhotoBase64: string, selectedItemIds: string[]) => {
    if (!user) throw new Error("Not authenticated");
    const res = await fetch(`${getBaseUrl()}/api/ai/try-on`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPhotoBase64, selectedItemIds, userId: user.id }),
    });
    if (!res.ok) throw new Error("Failed to generate try-on");
    return res.json();
  }, [user]);

  return (
    <WardrobeContext.Provider value={{ items, isLoading, fetchItems, addItem, removeItem, scanItem, recommendOutfits, generateTryOn }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error("useWardrobe must be used within WardrobeProvider");
  return ctx;
}
