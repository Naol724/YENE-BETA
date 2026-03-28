import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, SlidersHorizontal, Map, Grid, Heart } from 'lucide-react';
import api from '../utils/api';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [beds, setBeds] = useState(0);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let query = `/houses?`;
      if (searchTerm) query += `&location.city=${searchTerm}`;
      if (priceRange.min > 0) query += `&minPrice=${priceRange.min}`;
      if (priceRange.max < 200000) query += `&maxPrice=${priceRange.max}`;
      if (beds > 0) query += `&bedrooms=${beds}`;
      
      const res = await api.get(query);
      setHouses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [beds, priceRange.max]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      setSearchParams({ city: searchTerm });
    } else {
      setSearchParams({});
    }
    fetchProperties();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden pb-16 md:pb-0">
      {/* Top Search Bar */}
      <div className="bg-white p-4 border-b border-border shadow-sm z-10 flex gap-2 w-full">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 group">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city, area or neighborhood..." 
            className="input-field pl-12 h-12 w-full bg-surface hover:bg-white transition-colors"
          />
        </form>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 w-12 rounded-lg flex justify-center items-center border transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-border text-textSecondary hover:bg-surface'}`}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Filter Drawer (Slide out on mobile, relative on desktop if needed) */}
        <div className={`absolute inset-0 bg-white z-20 md:w-80 md:border-r border-border md:static transform transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full md:hidden'} overflow-y-auto p-6 shadow-xl md:shadow-none`}>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h3 className="font-bold text-lg">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-error">Close</button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="font-semibold block mb-3">Price Range (KES)</label>
              <input type="range" min="0" max="200000" step="1000" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              <div className="flex justify-between text-sm text-textSecondary mt-2">
                <span>0</span>
                <span>{priceRange.max.toLocaleString()}+</span>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-3">Bedrooms</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map(num => (
                  <button 
                    key={num}
                    onClick={() => setBeds(num)}
                    className={`flex-1 h-10 rounded-lg border transition-all ${beds === num ? 'bg-primary border-primary text-white' : 'border-border bg-white'}`}
                  >
                    {num === 0 ? 'Any' : `${num}+`}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => {fetchProperties(); setShowFilters(false);}} className="btn-primary w-full mt-4">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto bg-surface relative">
          
          {/* View Toggles */}
          <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-sm font-medium border border-border p-1 flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 ${viewMode === 'grid' ? 'bg-surface text-primary shadow-sm' : 'text-textSecondary'}`}
            >
              <Grid className="h-4 w-4" /> List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 ${viewMode === 'map' ? 'bg-surface text-primary shadow-sm' : 'text-textSecondary'}`}
            >
              <Map className="h-4 w-4" /> Map
            </button>
          </div>

          <div className="p-6 pt-16">
            <h2 className="text-xl font-bold mb-4">{houses.length} {houses.length === 1 ? 'Property' : 'Properties'} Found</h2>
            
            {loading ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {[1,2,3,4].map(n => (
                 <div key={n} className="animate-pulse bg-white rounded-xl h-48 border border-border"></div>
               ))}
             </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {houses.map(house => (
                  <Link to={`/house/${house._id}`} key={house._id} className="bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all flex flex-col sm:flex-row group block">
                    <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                      <img src={house.images[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={house.title} />
                      <div className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:text-secondary" onClick={(e) => e.preventDefault()}>
                        <Heart className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-lg line-clamp-1">{house.title}</h4>
                        <p className="text-textSecondary text-sm flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {house.location.area}, {house.location.city}</p>
                        <div className="flex gap-3 text-sm text-textSecondary mt-3 font-medium">
                          <span>{house.bedrooms} {house.bedrooms===1?'Bed':'Beds'}</span> &bull; 
                          <span>{house.bathrooms} Bath</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <p className="text-primary font-bold text-lg">KES {house.pricing.pricePerMonth.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
               <div className="w-full h-[600px] bg-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-border">
                  <p className="text-textSecondary font-medium flex items-center gap-2">
                    <Map className="h-6 w-6" /> Interactive Map View (Requires Leaflet Integration)
                  </p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
