import type { HouseCardModel } from '../components/PropertyListingCard';

/** Shown when the API returns no listings (database empty). IDs start with `demo-` — cards won’t open fake detail routes. */
export const DEMO_LISTINGS: HouseCardModel[] = [
  {
    _id: 'demo-addis-bole-1',
    title: 'Modern 2BR apartment in Bole',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Addis Ababa', area: 'Bole' },
    pricing: { pricePerMonth: 48000 },
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 98,
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-addis-sarbet-1',
    title: 'Family 3BR near embassies — Sarbet',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Addis Ababa', area: 'Sarbet' },
    pricing: { pricePerMonth: 62000 },
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 145,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-addis-piassa-1',
    title: 'Heritage 2BR in Piassa',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Addis Ababa', area: 'Piassa' },
    pricing: { pricePerMonth: 38000 },
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 88,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-addis-kazanchis-1',
    title: 'Furnished studio near EU compound',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Addis Ababa', area: 'Kazanchis' },
    pricing: { pricePerMonth: 22000 },
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 42,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-hawassa-1',
    title: 'Family house with garden — Hawassa',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Hawassa', area: 'Tabor' },
    pricing: { pricePerMonth: 35000 },
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 140,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-hawassa-2',
    title: 'New 2BR apartment — Haik road',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Hawassa', area: 'Haik' },
    pricing: { pricePerMonth: 28000 },
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 95,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-dire-1',
    title: 'Spacious 3BR villa — Dire Dawa',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Dire Dawa', area: 'Kezira' },
    pricing: { pricePerMonth: 52000 },
    bedrooms: 3,
    bathrooms: 3,
    squareFootage: 180,
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-dire-2',
    title: '2BR flat near Kezira market',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600566753082-9f6d8b5d0b0b?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Dire Dawa', area: 'Kezira' },
    pricing: { pricePerMonth: 24000 },
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 85,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-bahir-1',
    title: 'Lake view condo in Bahir Dar',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Bahir Dar', area: 'Abay Mado' },
    pricing: { pricePerMonth: 41000 },
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 110,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-bahir-2',
    title: 'Affordable 1BR starter — inland',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Bahir Dar', area: 'Atse Tewodros' },
    pricing: { pricePerMonth: 15000 },
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 48,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-mekelle-1',
    title: 'Quiet 1BR near Mekelle University',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Mekelle', area: 'Ayder' },
    pricing: { pricePerMonth: 18000 },
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 55,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-mekelle-2',
    title: '2BR near Ayder hospital',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600573472556-e636d51b6d6d?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Mekelle', area: 'Ayder' },
    pricing: { pricePerMonth: 26000 },
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 92,
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-adama-1',
    title: 'Bright 2BR flat near Adama industrial zone',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Adama', area: 'Bole Sub-city' },
    pricing: { pricePerMonth: 14500 },
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 72,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-adama-2',
    title: 'Shared compound house with yard',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585152917-df2098678205?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    location: { city: 'Adama', area: 'Wonji' },
    pricing: { pricePerMonth: 11000 },
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 120,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
];

export function isDemoListingId(id: string): boolean {
  return id.startsWith('demo-');
}
