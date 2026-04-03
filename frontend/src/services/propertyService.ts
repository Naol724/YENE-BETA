import api from '../utils/api';
import type { HouseCardModel } from '../components/PropertyListingCard';

export type HousesListResponse = {
  success: boolean;
  data: HouseCardModel[];
  pagination?: { total: number; page: number; limit: number };
};

export type HousesQuery = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  page?: number;
  limit?: number;
  /** e.g. "-createdAt" or "pricing.pricePerMonth" */
  sort?: string;
};

function buildQueryString(params: HousesQuery): string {
  const limit = params.limit ?? 12;
  let q = `/houses?limit=${limit}`;
  if (params.page && params.page > 1) q += `&page=${params.page}`;
  if (params.city) q += `&location.city=${encodeURIComponent(params.city)}`;
  if (params.minPrice != null && params.minPrice > 0) q += `&minPrice=${params.minPrice}`;
  if (params.maxPrice != null) q += `&maxPrice=${params.maxPrice}`;
  if (params.bedrooms != null && params.bedrooms > 0) q += `&bedrooms=${params.bedrooms}`;
  if (params.propertyType) q += `&propertyType=${encodeURIComponent(params.propertyType)}`;
  if (params.sort) q += `&sort=${encodeURIComponent(params.sort)}`;
  return q;
}

export async function fetchHouses(params: HousesQuery = {}) {
  const res = await api.get<HousesListResponse>(buildQueryString(params));
  return res.data;
}

export async function fetchHouseById(id: string) {
  const res = await api.get<{ success: boolean; data: unknown }>(`/houses/${id}`);
  return res.data;
}
