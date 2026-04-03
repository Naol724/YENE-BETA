/** Visual + copy for Popular cities on Home (images are representative stock photos). */
export type PopularCityCard = {
  name: string;
  param: string;
  image: string;
  tagline: string;
  areas: string;
  sampleFrom: string;
  highlight: string;
};

export const POPULAR_CITY_CARDS: PopularCityCard[] = [
  {
    name: 'Addis Ababa',
    param: 'Addis Ababa',
    image:
      'https://images.unsplash.com/photo-1578895101408-1a36b834cbd7?auto=format&fit=crop&w=900&q=80',
    tagline: 'Capital & business hub',
    areas: 'Bole · Kazanchis · Sarbet',
    sampleFrom: 'Studios from ~22,000 ETB/mo',
    highlight: 'Strong demand near Bole airport and international schools.',
  },
  {
    name: 'Dire Dawa',
    param: 'Dire Dawa',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
    tagline: 'Eastern trade corridor',
    areas: 'Kezira · Dil Chora',
    sampleFrom: 'Family homes from ~35,000 ETB/mo',
    highlight: 'Affordable villas and growing suburbs toward the railway.',
  },
  {
    name: 'Hawassa',
    param: 'Hawassa',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    tagline: 'Lakeside living',
    areas: 'Tabor · Haik',
    sampleFrom: '3BR houses from ~30,000 ETB/mo',
    highlight: 'Popular with professionals; weekend lake access.',
  },
  {
    name: 'Bahir Dar',
    param: 'Bahir Dar',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    tagline: 'Tana & relaxed pace',
    areas: 'Abay Mado · Bezawit',
    sampleFrom: 'Lake-view units from ~28,000 ETB/mo',
    highlight: 'Mid-range rentals with views toward the lake.',
  },
  {
    name: 'Mekelle',
    param: 'Mekelle',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
    tagline: 'Northern regional center',
    areas: 'Ayder · Quiha',
    sampleFrom: '1BR near campus from ~15,000 ETB/mo',
    highlight: 'Student & NGO demand around colleges and hospitals.',
  },
  {
    name: 'Adama',
    param: 'Adama',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
    tagline: 'Rift industry corridor',
    areas: 'Bole Sub-city · Wonji',
    sampleFrom: 'Compact flats from ~12,000 ETB/mo',
    highlight: 'Budget-friendly options between Addis and the Rift Valley.',
  },
];
