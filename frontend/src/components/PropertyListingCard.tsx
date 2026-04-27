import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { MapPin, Bed, Bath, Maximize2, Heart, ArrowLeftRight, MessageCircle } from 'lucide-react';
import type { RootState } from '../store';
import { addFavorite, removeFavorite } from '../services/favoriteService';
import { formatPublished } from '../utils/formatPublished';
import DemoListingModal from './DemoListingModal';
import { DEMO_LISTING_EXTRAS } from '../data/demoListingExtras';
import { CONTACT_OWNER_AUTH_STATE } from '../utils/authRedirectState';

export type HouseCardModel = {
  _id: string;
  title: string;
  images?: { url?: string }[];
  location: { city: string; area: string; address?: string };
  pricing: { pricePerMonth: number; securityDeposit?: number };
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  isPremium?: boolean;
  createdAt?: string;
  propertyType?: string;
  description?: string;
  amenities?: string[];
  rules?: {
    petFriendly?: boolean;
    smokingAllowed?: boolean;
    eventsAllowed?: boolean;
  };
};

type BadgeKind = 'For Rent' | 'For Sale' | 'Featured';

interface PropertyListingCardProps {
  house: HouseCardModel;
  badge: BadgeKind;
  /** When provided (e.g. from useRenterFavoriteIds), heart syncs with API */
  favoriteHouseIds?: string[];
  onFavoriteToggle?: (houseId: string, nowSaved: boolean) => void;
  /** Use `grid` on multi-column home/search layouts (removes max-width centering). */
  variant?: 'page' | 'grid';
}

const PropertyListingCard: React.FC<PropertyListingCardProps> = ({
  house,
  badge,
  favoriteHouseIds,
  onFavoriteToggle,
  variant = 'page',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const [localLiked, setLocalLiked] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const demoExtra = useMemo(() => {
    if (!house._id.startsWith('demo-')) return null;
    return (
      DEMO_LISTING_EXTRAS[house._id] ?? {
        description: 'Sample property for exploring the app. Publish real listings from your dashboard to replace demo data.',
        amenities: ['Demo'],
        ownerLabel: 'Demo host — messages work on real listings',
      }
    );
  }, [house._id]);

  const controlled = favoriteHouseIds != null;
  const saved = controlled ? favoriteHouseIds.includes(house._id) : localLiked;

  const img =
    house.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa';

  const areaLabel = house.squareFootage
    ? `${house.squareFootage} m²`
    : '—';

  const openDetail = () => {
    if (house._id.startsWith('demo-')) {
      setDemoModalOpen(true);
      return;
    }
    navigate(`/house/${house._id}`);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Sign in to save listings');
      navigate('/login', { state: { from: { pathname: `/house/${house._id}` } } });
      return;
    }
    if (user?.role === 'OWNER') {
      toast.error('Switch to a renter account to save favorites');
      return;
    }
    if (user?.role !== 'RENTER') return;

    if (house._id.startsWith('demo-')) {
      toast('Demonstration listing — save works on real properties from your database.', { icon: 'ℹ️' });
      return;
    }

    if (!controlled) {
      setLocalLiked((v) => !v);
      toast('Create an account as a renter to sync saved homes across devices.', { icon: 'ℹ️' });
      return;
    }

    try {
      if (saved) {
        await removeFavorite(house._id);
        onFavoriteToggle?.(house._id, false);
        toast.success('Removed from saved');
      } else {
        await addFavorite(house._id);
        onFavoriteToggle?.(house._id, true);
        toast.success('Saved to favorites');
      }
    } catch {
      toast.error('Could not update saved list');
    }
  };

  const handleContactOwner = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.success('Create a free account to message owners');
      navigate('/register', { state: CONTACT_OWNER_AUTH_STATE });
      return;
    }
    if (user?.role === 'OWNER') {
      toast.error('Switch to a renter account to message property owners.');
      return;
    }
    if (user?.role !== 'RENTER') {
      toast.error('Sign in as a renter to send messages.');
      return;
    }
    navigate('/inquiries');
  };

  return (
    <article
      className={`bg-white dark:bg-darksurface rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-border/70 dark:border-slate-600 w-full flex flex-col h-full ${
        variant === 'grid' ? 'max-w-none' : 'max-w-3xl mx-auto'
      }`}
    >
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
            onClick={handleFavorite}
            className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            aria-label={saved ? 'Remove from favorites' : 'Save listing'}
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-white text-white' : ''}`} />
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
          ETB {house.pricing.pricePerMonth.toLocaleString()}
          <span className="text-sm font-normal text-white/90"> /mo</span>
        </p>
      </div>

      <div className={variant === 'grid' ? 'flex flex-col flex-1 min-h-0' : undefined}>
        <div className="px-4 sm:px-5 pt-4 pb-3 cursor-pointer" onClick={openDetail}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-brandNavy dark:text-slate-100 text-lg leading-snug line-clamp-2 flex-1">
              {house.title}
            </h3>
            {house.propertyType && (
              <span className="text-xs font-semibold text-brandTeal bg-brandTeal/10 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                {house.propertyType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-textSecondary dark:text-darkmuted text-sm mt-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {house.location.city}, {house.location.area}
            </span>
          </div>
          {house.description && (
            <p className="text-xs text-textSecondary dark:text-darkmuted mt-2 line-clamp-2">
              {house.description}
            </p>
          )}
        </div>

        <hr className="border-border dark:border-slate-600 mx-4 sm:mx-5" />

        <div className="px-4 sm:px-5 py-4 flex justify-between text-textSecondary dark:text-darkmuted text-sm">
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

        {house.amenities && house.amenities.length > 0 && (
          <div className="px-4 sm:px-5 py-3 border-t border-border dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex flex-wrap gap-1">
              {house.amenities.slice(0, 3).map((amenity, i) => (
                <span key={i} className="text-xs bg-slate-200 dark:bg-slate-700 text-textPrimary dark:text-slate-200 px-2 py-1 rounded-full">
                  {amenity}
                </span>
              ))}
              {house.amenities.length > 3 && (
                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-textPrimary dark:text-slate-200 px-2 py-1 rounded-full">
                  +{house.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="bg-surface dark:bg-slate-800/50 px-4 sm:px-5 py-2.5 border-t border-border dark:border-slate-600">
          <p className="text-xs text-textSecondary dark:text-darkmuted">{formatPublished(house.createdAt)}</p>
        </div>
      </div>

      <div
        className={`px-3 sm:px-5 py-3 border-t border-border dark:border-slate-600 flex flex-row gap-1.5 sm:gap-2 ${
          variant === 'grid' ? 'mt-auto' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {demoExtra ? (
          <>
            <button
              type="button"
              className="btn-primary flex-1 min-w-0 !h-11 sm:!h-12 text-[10px] sm:text-xs md:text-sm px-2 sm:px-4 py-2 sm:py-2.5"
              onClick={() => setDemoModalOpen(true)}
            >
              View details
            </button>
            <button
              type="button"
              className="btn-secondary flex-1 min-w-0 !h-11 sm:!h-12 text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 py-2 sm:py-2.5 inline-flex items-center justify-center gap-1 sm:gap-2"
              onClick={handleContactOwner}
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Contact owner</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn-primary flex-1 min-w-0 !h-11 sm:!h-12 text-[10px] sm:text-xs md:text-sm px-2 sm:px-4 py-2 sm:py-2.5"
              onClick={() => navigate(`/house/${house._id}`)}
            >
              View details
            </button>
            <button
              type="button"
              className="btn-secondary flex-1 min-w-0 !h-11 sm:!h-12 text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 py-2 sm:py-2.5 inline-flex items-center justify-center gap-1 sm:gap-2"
              onClick={handleContactOwner}
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Contact owner</span>
            </button>
          </>
        )}
      </div>

      {demoModalOpen && demoExtra && (
        <DemoListingModal house={house} extra={demoExtra} onClose={() => setDemoModalOpen(false)} />
      )}
    </article>
  );
};

export default PropertyListingCard;
