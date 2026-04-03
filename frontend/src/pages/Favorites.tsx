import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import { removeFavorite as removeFavoriteApi } from '../services/favoriteService';
import api from '../utils/api';
import EmptyState from '../components/ui/EmptyState';
import BackNavButton from '../components/BackNavButton';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';

type FavRow = {
  _id: string;
  house: {
    _id: string;
    title: string;
    images?: { url?: string }[];
    location?: { area?: string; city?: string };
    pricing?: { pricePerMonth?: number };
  };
};

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get<{ data: FavRow[] }>('/favorites');
      setFavorites(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load saved properties');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (houseId: string) => {
    try {
      await removeFavoriteApi(houseId);
      setFavorites((prev) => prev.filter((f) => f.house._id !== houseId));
      toast.success('Removed from saved');
    } catch (err) {
      console.error(err);
      toast.error('Could not remove');
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-4">
        <BackNavButton fallbackTo="/" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-brandNavy dark:text-white">Saved properties</h2>
      <p className="text-textSecondary dark:text-darkmuted text-sm mb-6">
        Homes you saved with the heart icon (renter accounts).
      </p>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((n) => (
            <PropertyCardSkeleton key={n} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Browse listings and tap the heart to save homes you like."
          action={
            <Link to="/listings" className="btn-primary inline-block">
              Browse listings
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {favorites.map((fav) => {
            const house = fav.house;
            if (!house) return null;
            return (
              <div
                key={fav._id}
                className="card-container p-0 overflow-hidden border border-border dark:border-slate-600 group relative dark:bg-darksurface"
              >
                <Link to={`/house/${house._id}`}>
                  <div className="h-48 overflow-hidden bg-gray-200 dark:bg-slate-700">
                    <img
                      src={
                        house.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
                      }
                      alt={house.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-darksurface">
                    <h4 className="font-semibold text-lg line-clamp-1 text-brandNavy dark:text-white">
                      {house.title}
                    </h4>
                    <div className="flex items-center text-textSecondary text-sm mb-3">
                      <MapPin className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">
                        {house.location?.area}, {house.location?.city}
                      </span>
                    </div>
                    <p className="text-primary font-bold text-lg">
                      ETB {house.pricing?.pricePerMonth?.toLocaleString() ?? '—'}{' '}
                      <span className="text-sm font-normal text-textSecondary">/mo</span>
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => removeFavorite(house._id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-darksurface/90 hover:bg-white text-error rounded-full shadow-sm transition-colors"
                  aria-label="Remove from saved"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
