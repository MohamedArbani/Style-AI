import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getApiBase } from "@/utils/api";

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

export type OutfitRecommendation = {
  id: string;
  name: string;
  description: string;
  items: WardrobeItem[];
  occasion?: string;
  matchScore: number;
  tags?: string[];
};

export const wardrobeKeys = {
  all: ["wardrobe"] as const,
  items: () => [...wardrobeKeys.all, "items"] as const,
  item: (id: string) => [...wardrobeKeys.all, "items", id] as const,
};

async function fetchWardrobeItems(userId: string): Promise<WardrobeItem[]> {
  const params = new URLSearchParams({ userId });
  const res = await fetch(`${getApiBase()}/api/wardrobe/items?${params}`);
  if (!res.ok) throw new Error("Failed to fetch wardrobe items");
  return res.json();
}

export function useWardrobeItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: wardrobeKeys.items(),
    queryFn: () => fetchWardrobeItems(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes — won't refetch on tab switches
  });
}

export function useAddItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      item: Omit<WardrobeItem, "id" | "userId" | "createdAt">,
    ) => {
      if (!user) throw new Error("Not authenticated");
      const res = await fetch(`${getApiBase()}/api/wardrobe/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, userId: user.id }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json() as Promise<WardrobeItem>;
    },
    onSuccess: (created) => {
      // Optimistically prepend to the cached list, then revalidate from server
      queryClient.setQueryData<WardrobeItem[]>(wardrobeKeys.items(), (old) =>
        old ? [created, ...old] : [created],
      );
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.items() });
    },
  });
}

export function useRemoveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${getApiBase()}/api/wardrobe/items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove item");
      return id;
    },
    onMutate: async (id) => {
      // Cancel in-flight fetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: wardrobeKeys.items() });
      const previous = queryClient.getQueryData<WardrobeItem[]>(
        wardrobeKeys.items(),
      );
      queryClient.setQueryData<WardrobeItem[]>(wardrobeKeys.items(), (old) =>
        old ? old.filter((item) => item.id !== id) : [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      // Rollback on failure
      if (context?.previous) {
        queryClient.setQueryData(wardrobeKeys.items(), context.previous);
      }
    },
    onSuccess: () => {
      // Confirm server state after optimistic removal
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.items() });
    },
  });
}

export function useInvalidateWardrobe() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: wardrobeKeys.items() });
}
