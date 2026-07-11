import { DEMO_LISTINGS, isDemoListingId } from './demoListings';
import { DEMO_LISTING_EXTRAS } from './demoListingExtras';

/** Full house shape for the PropertyDetails page (demo listings). */
export function getDemoHouseById(id: string) {
  if (!isDemoListingId(id)) return null;
  const base = DEMO_LISTINGS.find((h) => h._id === id);
  if (!base) return null;
  const extra = DEMO_LISTING_EXTRAS[id] ?? {
    description:
      'Sample property for exploring the app. Publish real listings from your dashboard to replace demo data.',
    amenities: ['Demo'],
    ownerLabel: 'Demo host',
  };
  const ownerName = extra.ownerLabel.replace(/^Listed by\s+/i, '').split('·')[0].trim() || 'Demo Host';

  return {
    _id: base._id,
    title: base.title,
    propertyType: base.bedrooms <= 1 ? 'Studio' : base.bedrooms >= 3 ? 'House' : 'Apartment',
    bedrooms: base.bedrooms,
    bathrooms: base.bathrooms,
    squareFootage: base.squareFootage,
    location: {
      city: base.location.city,
      area: base.location.area,
      address: `${base.location.area}, ${base.location.city}`,
    },
    pricing: {
      pricePerMonth: base.pricing.pricePerMonth,
      securityDeposit: Math.round(base.pricing.pricePerMonth * 0.5),
    },
    description: extra.description,
    amenities: extra.amenities,
    images: base.images?.map((img, i) => ({ url: img.url, isMain: i === 0 })) ?? [],
    owner: {
      _id: `demo-owner-${base._id}`,
      fullName: ownerName,
    },
    isPremium: base.isPremium,
    createdAt: base.createdAt,
    isDemo: true as const,
  };
}

export { isDemoListingId };
