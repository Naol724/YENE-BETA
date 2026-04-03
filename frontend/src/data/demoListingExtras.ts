/** Rich copy for demo listing modal (ids match DEMO_LISTINGS). */
export type DemoListingExtra = {
  description: string;
  amenities: string[];
  ownerLabel: string;
};

export const DEMO_LISTING_EXTRAS: Record<string, DemoListingExtra> = {
  'demo-addis-bole-1': {
    description:
      'Bright corner unit with floor-to-ceiling windows, open kitchen, and backup generator in the building. Walking distance to Bole airport corridor and cafes.',
    amenities: ['Generator', 'Elevator', 'Parking', 'Security 24/7', 'Balcony'],
    ownerLabel: 'Listed by Alemayehu · responds within a few hours',
  },
  'demo-addis-kazanchis-1': {
    description:
      'Compact furnished studio ideal for diplomats or solo professionals. Includes Wi‑Fi-ready wiring and water tank.',
    amenities: ['Furnished', 'Water tank', 'Shared laundry'],
    ownerLabel: 'Listed by Mimi · verified host',
  },
  'demo-addis-sarbet-1': {
    description:
      'Quiet 3BR family apartment near schools and embassies. Large living room and maid’s room.',
    amenities: ['Maid’s room', 'Storage', 'Two baths', 'Garden view'],
    ownerLabel: 'Listed by Daniel · Superhost',
  },
  'demo-addis-piassa-1': {
    description:
      'Character apartment in Piassa with high ceilings. Great for creatives who want central Addis access.',
    amenities: ['High ceilings', 'City views', 'Renovated kitchen'],
    ownerLabel: 'Listed by Sara',
  },
  'demo-hawassa-1': {
    description:
      'Standalone house with small garden, ideal for families. Short drive to Hawassa lake recreation.',
    amenities: ['Garden', 'Parking x2', 'Outdoor kitchen'],
    ownerLabel: 'Listed by Sara H.',
  },
  'demo-hawassa-2': {
    description:
      'Newer 2BR apartment block near Haik road with lake breezes and quiet nights.',
    amenities: ['Balcony', 'Elevator', 'Kids play area nearby'],
    ownerLabel: 'Listed by Tewodros',
  },
  'demo-dire-1': {
    description:
      'Large villa-style home with compound wall and gate. Suited for extended family or home office.',
    amenities: ['Compound', 'Gate', '4 parking', 'Mature trees'],
    ownerLabel: 'Listed by Omar',
  },
  'demo-dire-2': {
    description:
      'Modern 2BR flat near Kezira market — easy shopping and transport links.',
    amenities: ['Balcony', 'Security', 'Water tank'],
    ownerLabel: 'Listed by Fatuma',
  },
  'demo-bahir-1': {
    description:
      'Condo with partial lake orientation. Building has shared generator and rooftop access.',
    amenities: ['Lake breeze', 'Rooftop', 'Generator'],
    ownerLabel: 'Listed by Yonas',
  },
  'demo-bahir-2': {
    description:
      'Budget 1BR starter home a bit inland — still quick access to lake road.',
    amenities: ['Water tank', 'Fence', 'Quiet street'],
    ownerLabel: 'Listed by Meron',
  },
  'demo-mekelle-1': {
    description:
      'Walkable to campus areas; compact and easy to maintain for students or young professionals.',
    amenities: ['Study nook', 'Shared water', 'Bike storage'],
    ownerLabel: 'Listed by Petros',
  },
  'demo-mekelle-2': {
    description:
      'Spacious 2BR near Ayder referral — good for healthcare staff or small families.',
    amenities: ['Parking', 'Generator hookup', 'Large kitchen'],
    ownerLabel: 'Listed by Hiwot',
  },
  'demo-adama-1': {
    description:
      'Practical flat for commuters to Addis or local industry parks. Bright natural light.',
    amenities: ['Near highway', 'Quiet block', 'Metal shutters'],
    ownerLabel: 'Listed by Bereket',
  },
  'demo-adama-2': {
    description:
      'Shared-compound house with yard space — great value for roommates splitting rent.',
    amenities: ['Yard', 'Outdoor seating', 'Shared gate'],
    ownerLabel: 'Listed by Chaltu',
  },
};
