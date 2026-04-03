const KEY = 'houserental_recent';
const MAX = 8;

export type RecentItem = { id: string; title: string; image?: string; at: number };

export function getRecentlyViewed(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentItem, 'at'>) {
  const list = getRecentlyViewed().filter((x) => x.id !== item.id);
  list.unshift({ ...item, at: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}
