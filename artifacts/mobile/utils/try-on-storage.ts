import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "smart_wardrobe_try_on_results";

export type TryOnResult = {
  id: string;
  imageBase64: string;
  description: string;
  createdAt: string;
};

export async function saveTryOnResult(
  result: Omit<TryOnResult, "id">,
): Promise<TryOnResult> {
  const existing = await getTryOnResults();
  const entry: TryOnResult = { ...result, id: `tryon_${Date.now()}` };
  const updated = [entry, ...existing].slice(0, 50);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return entry;
}

export async function getTryOnResults(): Promise<TryOnResult[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as TryOnResult[];
}

export async function deleteTryOnResult(id: string): Promise<void> {
  const existing = await getTryOnResults();
  const updated = existing.filter((r) => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
