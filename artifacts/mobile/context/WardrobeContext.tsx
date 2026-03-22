import React, { createContext, useContext, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getApiBase } from "@/utils/api";
import {
  useWardrobeItems,
  useAddItem,
  useRemoveItem,
  useInvalidateWardrobe,
} from "@/hooks/use-wardrobe-queries";

export type { WardrobeItem, OutfitRecommendation } from "@/hooks/use-wardrobe-queries";
import type { WardrobeItem, OutfitRecommendation } from "@/hooks/use-wardrobe-queries";

type WardrobeContextType = {
  items: WardrobeItem[];
  isLoading: boolean;
  fetchItems: (category?: string) => Promise<void>;
  addItem: (item: Omit<WardrobeItem, "id" | "userId" | "createdAt">) => Promise<WardrobeItem>;
  removeItem: (id: string) => Promise<void>;
  scanItem: (imageBase64: string) => Promise<Partial<WardrobeItem>>;
  recommendOutfits: (params?: { occasion?: string; weather?: string; stylePreferences?: string[] }) => Promise<OutfitRecommendation[]>;
  generateTryOn: (userPhotoBase64: string, selectedItemIds: string[]) => Promise<{ imageBase64: string; description: string }>;
  /** Force revalidate the wardrobe items cache */
  invalidate: () => void;
  /** Whether a background refetch is in progress */
  isRefetching: boolean;
  /** Trigger a refetch (useful for pull-to-refresh) */
  refetch: () => Promise<void>;
};

const WardrobeContext = createContext<WardrobeContextType | null>(null);

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // TanStack Query — cached, deduplicated, stale-while-revalidate
  const query = useWardrobeItems();
  const addMutation = useAddItem();
  const removeMutation = useRemoveItem();
  const invalidate = useInvalidateWardrobe();

  const items = query.data ?? [];
  const isLoading = query.isLoading;
  const isRefetching = query.isRefetching;

  // Legacy compat — screens that still call fetchItems() get a no-op
  // because TanStack Query handles the initial fetch automatically.
  // Calling invalidate() or refetch() is the correct way now.
  const fetchItems = useCallback(async () => {
    // no-op: TanStack Query manages fetching
  }, []);

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const addItem = useCallback(async (item: Omit<WardrobeItem, "id" | "userId" | "createdAt">) => {
    return addMutation.mutateAsync(item);
  }, [addMutation]);

  const removeItem = useCallback(async (id: string) => {
    await removeMutation.mutateAsync(id);
  }, [removeMutation]);

  const scanItem = useCallback(async (imageBase64: string) => {
    const res = await fetch(`${getApiBase()}/api/wardrobe/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, userId: user?.id }),
    });
    if (!res.ok) throw new Error("Failed to scan item");
    return res.json();
  }, [user]);

  const recommendOutfits = useCallback(async (params?: { occasion?: string; weather?: string; stylePreferences?: string[] }) => {
    if (!user) return [];
    const res = await fetch(`${getApiBase()}/api/outfits/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ...params }),
    });
    if (!res.ok) throw new Error("Failed to recommend outfits");
    return res.json();
  }, [user]);

  const generateTryOn = useCallback(async (userPhotoBase64: string, selectedItemIds: string[]) => {
    if (!user) throw new Error("Not authenticated");
    const res = await fetch(`${getApiBase()}/api/ai/try-on`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPhotoBase64, selectedItemIds, userId: user.id }),
    });
    if (!res.ok) throw new Error("Failed to generate try-on");
    return res.json();
  }, [user]);

  return (
    <WardrobeContext.Provider
      value={{
        items,
        isLoading,
        fetchItems,
        addItem,
        removeItem,
        scanItem,
        recommendOutfits,
        generateTryOn,
        invalidate,
        isRefetching,
        refetch,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error("useWardrobe must be used within WardrobeProvider");
  return ctx;
}
