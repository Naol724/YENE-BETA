import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize2, Heart, ArrowLeftRight } from 'lucide-react';
import { formatPublished } from '../utils/formatPublished';

export type HouseCardModel = {
  _id: string;
  title: string;
  images?: { url?: string }[];
  location: { city: string; area: string };
  pricing: { pricePerMonth: number };
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  isPremium?: boolean;
  createdAt?: string;
};

type BadgeKind = 'For Rent' | 'For Sale' | 'Featured';

interface PropertyListingCardProps {
  house: HouseCardModel;
  badge: BadgeKind;
}

const PropertyListingCard: React.FC<PropertyListingCardProps> = ({ house, badge }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const img =
    house.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa';

  const areaLabel = house.squareFootage
    ? `${house.squareFootage} Square Meter`
    : '—';

  const openDetail = () => navigate(`/house/${house._id}`);

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-border/70 max-w-3xl mx-auto w-full">
      <div
        className="relative cursor-pointer aspect-[16/10] sm:aspect-[21/9] overflow-hidden"
        onClick={openDetail}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDetail();
          }
        }}
        role="link"
        tabIndex={0}
        aria-label={`View ${house.title}`}
      >
        <img src={img} alt={house.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-brandTeal shadow-sm">
          {badge}
        </span>

        <div className="absolute top-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLiked((v) => !v);
            }}
            className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            aria-label={liked ? 'Remove from favorites' : 'Save listing'}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-white text-white' : ''}`} />
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            aria-label="Compare"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        <p className="absolute bottom-3 left-4 text-white font-bold text-xl sm:text-2xl drop-shadow-md">
          KES {house.pricing.pricePerMonth.toLocaleString()}
          <span className="text-sm font-normal text-white/90"> /mo</span>
        </p>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-3 cursor-pointer" onClick={openDetail}>
        <h3 className="font-bold text-brandNavy text-lg leading-snug line-clamp-2">{house.title}</h3>
        <div className="flex items-center gap-1.5 text-textSecondary text-sm mt-2">
          <MapPin className="h-4 w-4 shrink-0 text-textSecondary" />
          <span>
            {house.location.city}, {house.location.area}
          </span>
        </div>
      </div>

      <hr className="border-border mx-4 sm:mx-5" />

      <div className="px-4 sm:px-5 py-4 flex justify-between text-textSecondary text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Bed className="h-4 w-4 shrink-0 opacity-80" />
          <span>{house.bedrooms}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Bath className="h-4 w-4 shrink-0 opacity-80" />
          <span>{house.bathrooms}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <Maximize2 className="h-4 w-4 shrink-0 opacity-80" />
          <span className="truncate">{areaLabel}</span>
        </div>
      </div>

      <div className="bg-surface px-4 sm:px-5 py-2.5 border-t border-border">
        <p className="text-xs text-textSecondary">{formatPublished(house.createdAt)}</p>
      </div>
    </article>
  );
};

export default PropertyListingCard;
