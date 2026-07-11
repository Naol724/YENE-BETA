import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { MapPin, Bed, Bath, Maximize2, Heart, MessageCircle } from 'lucide-react';
import type { RootState } from '../store';
import { addFavorite, removeFavorite } from '../services/favoriteService';
import { formatPublished } from '../utils/formatPublished';
import { isDemoListingId } from '../data/demoListings';
import { CONTACT_OWNER_AUTH_STATE } from '../utils/authRedirectState';
import { MediaImage } from './MediaImage';

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
  favoriteHouseIds?: string[];
  onFavoriteToggle?: (houseId: string, nowSaved: boolean) => void;
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

  const isDemo = useMemo(() => isDemoListingId(house._id), [house._id]);
  const controlled = favoriteHouseIds != null;
  const saved = controlled ? favoriteHouseIds.includes(house._id) : localLiked;
  const img = house.images?.[0]?.url;
  const areaLabel = house.squareFootage ? `${house.squareFootage} m²` : '—';

  const openDetail = () => {
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

    if (isDemo) {
      toast('Demonstration listing — save works on real properties from your database.', {
        icon: 'ℹ️',
      });
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
    if (isDemo) {
      toast('Demonstration listing — messaging works on real properties.', { icon: 'ℹ️' });
      navigate('/inquiries');
      return;
    }
    navigate('/inquiries');
  };

  return (
    <article
      className={`bg-white dark:bg-darksurface rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-border/80 dark:border-slate-600 w-full flex flex-col h-full min-w-0 ${
        variant === 'grid' ? 'max-w-none' : 'max-w-3xl mx-auto'
      }`}
    >
      <div
        className="relative cursor-pointer aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-800"
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
        <MediaImage src={img} alt={house.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-brandTeal shadow-sm">
          {badge}
        </span>

        <button
          type="button"
          onClick={handleFavorite}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          aria-label={saved ? 'Remove from favorites' : 'Save listing'}
        >
          <Heart className={`h-3.5 w-3.5 ${saved ? 'fill-white text-white' : ''}`} />
        </button>

        <p className="absolute bottom-2 left-2.5 right-10 text-white font-bold text-base sm:text-lg drop-shadow-md truncate">
          ETB {house.pricing.pricePerMonth.toLocaleString()}
          <span className="text-[11px] sm:text-xs font-normal text-white/90"> /mo</span>
        </p>
      </div>

      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <div className="px-3 sm:px-4 pt-3 pb-2 cursor-pointer" onClick={openDetail}>
          <h3 className="font-bold text-brandNavy dark:text-slate-100 text-sm sm:text-base leading-snug line-clamp-2">
            {house.title}
          </h3>
          <div className="flex items-center gap-1 text-textSecondary dark:text-slate-400 text-xs mt-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {house.location.city}, {house.location.area}
            </span>
          </div>
        </div>

        <div className="px-3 sm:px-4 py-2 flex items-center gap-3 sm:gap-4 text-textSecondary dark:text-slate-400 text-xs border-t border-border/70 dark:border-slate-700">
          <span className="inline-flex items-center gap-1 shrink-0">
            <Bed className="h-3.5 w-3.5 opacity-80" />
            {house.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <Bath className="h-3.5 w-3.5 opacity-80" />
            {house.bathrooms}
          </span>
          <span className="inline-flex items-center gap-1 min-w-0 truncate ml-auto">
            <Maximize2 className="h-3.5 w-3.5 opacity-80 shrink-0" />
            {areaLabel}
          </span>
        </div>

        <p className="px-3 sm:px-4 py-1.5 text-[11px] text-textSecondary dark:text-slate-500 bg-surface/80 dark:bg-slate-800/40 border-t border-border/70 dark:border-slate-700">
          {formatPublished(house.createdAt)}
        </p>
      </div>

      <div
        className="mt-auto px-2.5 sm:px-3 py-2 sm:py-2.5 border-t border-border dark:border-slate-600 grid grid-cols-2 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn-primary !h-10 text-xs sm:text-sm px-2 w-full justify-center"
          onClick={openDetail}
        >
          View details
        </button>
        <button
          type="button"
          className="btn-secondary !h-10 text-xs sm:text-sm px-2 w-full inline-flex items-center justify-center gap-1.5"
          onClick={handleContactOwner}
        >
          <MessageCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Contact</span>
        </button>
      </div>
    </article>
  );
};

export default PropertyListingCard;
