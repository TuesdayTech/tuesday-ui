import * as SecureStore from "expo-secure-store";
import type { RecentSearch } from "../../types/search";

const KEY = "tuesday-recent-searches";
const MAX = 5;

export async function getRecentSearches(): Promise<RecentSearch[]> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as RecentSearch[]) : [];
  } catch {
    return [];
  }
}

export async function addRecentSearch(
  item: Omit<RecentSearch, "timestamp">,
): Promise<RecentSearch[]> {
  const list = await getRecentSearches();
  const filtered = list.filter((s) => s.uid !== item.uid);
  const entry: RecentSearch = { ...item, timestamp: Date.now() };
  const next = [entry, ...filtered].slice(0, MAX);
  await SecureStore.setItemAsync(KEY, JSON.stringify(next));
  return next;
}

export async function removeRecentSearch(
  uid: string,
): Promise<RecentSearch[]> {
  const list = await getRecentSearches();
  const next = list.filter((s) => s.uid !== uid);
  await SecureStore.setItemAsync(KEY, JSON.stringify(next));
  return next;
}

export async function clearRecentSearches(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
