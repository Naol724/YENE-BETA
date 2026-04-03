import api from '../utils/api';

export type FavoriteRow = {
  _id: string;
  house: { _id: string; title?: string; images?: { url?: string }[]; location?: unknown; pricing?: unknown };
};

export async function getFavoriteHouseIds(): Promise<string[]> {
  const res = await api.get<{ data: FavoriteRow[] }>('/favorites');
  const rows = res.data.data || [];
  return rows
    .map((f) => (f.house && typeof f.house === 'object' && '_id' in f.house ? String(f.house._id) : ''))
    .filter(Boolean);
}

export async function addFavorite(houseId: string) {
  return api.post(`/favorites/${houseId}`);
}

export async function removeFavorite(houseId: string) {
  return api.delete(`/favorites/${houseId}`);
}
