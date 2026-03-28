import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Search, MapPin, Bell, Filter, Heart } from 'lucide-react';
import api from '../utils/api';

const CATEGORIES = ['All', 'Apartment', 'House', 'Condo', 'Studio'];

const Home: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeCategory, setActiveCategory] = useState('All');
  const [, setFeatured] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        setLoading(true);
        // Fetch Premium properties for Featured
        const featuredRes = await api.get('/houses?isPremium=true&limit=5');
        setFeatured(featuredRes.data.data);
        
        // Fetch Recent properties based on category
        let recentUrl = '/houses?limit=8';
        if (activeCategory !== 'All') {
          recentUrl += `&propertyType=${activeCategory}`;
        }
        const recentRes = await api.get(recentUrl);
        setRecent(recentRes.data.data);
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
  }, [activeCategory]);

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary">
            {isAuthenticated ? `Good ${getGreeting()}, ${user?.fullName.split(' ')[0]} 👋` : 'Find Your Dream Home 🏠'}
          </h2>
          <div className="flex items-center text-textSecondary mt-1 text-sm">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            <span>Nairobi, Kenya</span>
          </div>
        </div>
        <div className="relative cursor-pointer hover:bg-surface p-2 rounded-full transition">
          <Bell className="h-6 w-6 text-textSecondary" />
          <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white"></span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group cursor-pointer shadow-sm active:scale-95 transition-transform duration-200">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search by location, price..." 
          className="input-field pl-12 pr-12 rounded-full shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
          readOnly
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <div className="p-2 bg-surface rounded-full">
            <Filter className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map(category => (
          <button 
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === category 
                ? 'bg-primary text-white shadow-md transform scale-105' 
                : 'bg-surface text-textSecondary hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Recommended / Recent */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold">Recommended for you</h3>
          <span className="text-primary text-sm font-semibold cursor-pointer">See All</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(n => (
              <div key={n} className="animate-pulse card-container bg-surface h-72"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recent.map((house: any) => (
              <div key={house._id} className="card-container p-0 overflow-hidden group cursor-pointer">
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img 
                    src={house.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} 
                    alt={house.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:text-secondary transition-colors">
                    <Heart className="h-5 w-5" />
                  </div>
                  {house.isPremium && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-warning text-xs font-bold rounded shadow-sm text-black flex items-center gap-1">
                      ⭐ Premium
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-lg line-clamp-1">{house.title}</h4>
                  </div>
                  <div className="flex items-center text-textSecondary text-sm mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{house.location.area}, {house.location.city}</span>
                  </div>
                  <p className="text-primary font-bold text-lg">KES {house.pricing.pricePerMonth.toLocaleString()} <span className="text-sm text-textSecondary font-normal">/mo</span></p>
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <div className="col-span-full py-10 text-center text-textSecondary">
                No properties found for {activeCategory}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

export default Home;
