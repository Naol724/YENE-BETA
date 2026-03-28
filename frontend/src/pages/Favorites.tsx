import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import api from '../utils/api';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (houseId: string) => {
    try {
      await api.delete(`/favorites/${houseId}`);
      setFavorites(favorites.filter(f => f.house._id !== houseId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Saved Properties</h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(n => <div key={n} className="h-64 bg-white rounded-xl animate-pulse"></div>)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-300 rounded-xl bg-surface">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-textPrimary mb-2">No saved properties yet</h3>
          <p className="text-textSecondary mb-6">Start exploring to find your dream home</p>
          <Link to="/search" className="btn-primary">Explore Houses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const house = fav.house;
            if(!house) return null;
            return (
              <div key={fav._id} className="card-container p-0 overflow-hidden border border-border group relative">
                <Link to={`/house/${house._id}`}>
                  <div className="h-48 overflow-hidden bg-gray-200">
                    <img 
                      src={house.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} 
                      alt={house.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-4 bg-white">
                    <h4 className="font-semibold text-lg line-clamp-1">{house.title}</h4>
                    <div className="flex items-center text-textSecondary text-sm mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{house.location?.area}, {house.location?.city}</span>
                    </div>
                    <p className="text-primary font-bold text-lg">KES {house.pricing?.pricePerMonth.toLocaleString()} <span className="text-sm font-normal text-textSecondary">/mo</span></p>
                  </div>
                </Link>
                <button onClick={() => removeFavorite(house._id)} className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-error rounded-full shadow-sm transition-colors">
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
