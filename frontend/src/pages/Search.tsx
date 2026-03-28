import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, SlidersHorizontal, Map, Grid } from 'lucide-react';
import api from '../utils/api';
import PropertyListingCard, { type HouseCardModel } from '../components/PropertyListingCard';
import SiteFooter from '../components/SiteFooter';

type ListingTab = 'all' | 'rent' | 'sale';

function badgeForHouse(house: HouseCardModel, tab: ListingTab): 'For Rent' | 'For Sale' | 'Featured' {
  if (tab === 'sale') return 'For Sale';
  if (house.isPremium) return 'Featured';
  return 'For Rent';
}

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [houses, setHouses] = useState<HouseCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [listingTab, setListingTab] = useState<ListingTab>('all');

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [beds, setBeds] = useState(0);

  useEffect(() => {
    setSearchTerm(searchParams.get('city') || '');
  }, [searchParams]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const city = searchParams.get('city') || '';
      let query = `/houses?limit=50`;
      if (city) query += `&location.city=${encodeURIComponent(city)}`;
      if (priceRange.min > 0) query += `&minPrice=${priceRange.min}`;
      if (priceRange.max < 200000) query += `&maxPrice=${priceRange.max}`;
      if (beds > 0) query += `&bedrooms=${beds}`;

      const res = await api.get(query);
      setHouses(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, priceRange.min, priceRange.max, beds]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredByTab = useMemo(() => {
    if (listingTab === 'sale') {
      const premium = houses.filter((h) => h.isPremium);
      return premium.length ? premium : houses.slice(0, 6);
    }
    if (listingTab === 'rent') {
      return houses.filter((h) => !h.isPremium);
    }
    return houses;
  }, [houses, listingTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ city: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-7rem)] md:min-h-[calc(100dvh-6.25rem)] bg-white pb-8">
      <div className="sticky top-14 md:top-[100px] z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 md:py-5">
          <h1 className="text-2xl md:text-3xl font-bold text-brandNavy text-center">
            Explore properties in Nairobi
          </h1>
          <div className="mx-auto mt-3 h-1 w-16 bg-brandNavy rounded-full" />

          <div className="mt-6 border-b border-border">
            <div className="flex justify-center gap-6 md:gap-10">
              {(
                [
                  { id: 'all' as const, label: 'All properties' },
                  { id: 'rent' as const, label: 'For rent' },
                  { id: 'sale' as const, label: 'Featured' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setListingTab(id)}
                  className={`pb-3 text-xs md:text-sm font-semibold uppercase tracking-wide border-b-2 transition-colors ${
                    listingTab === id
                      ? 'text-brandTeal border-brandTeal'
                      : 'text-textSecondary border-transparent hover:text-brandNavy'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 pb-3 max-w-6xl mx-auto flex gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brandTeal transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="City, area or neighborhood…"
              className="input-field pl-12 h-12 w-full bg-surface hover:bg-white transition-colors rounded-xl border-border"
            />
          </form>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-12 w-12 rounded-xl flex justify-center items-center border transition-all shrink-0 ${
              showFilters ? 'bg-brandTeal text-white border-brandTeal' : 'bg-white border-border text-textSecondary hover:bg-surface'
            }`}
            aria-expanded={showFilters}
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative max-w-6xl mx-auto w-full">
        <div
          className={`absolute inset-0 bg-white z-20 md:w-80 md:border-r border-border md:static transform transition-transform duration-300 ${
            showFilters ? 'translate-x-0' : '-translate-x-full md:hidden'
          } overflow-y-auto p-6 shadow-xl md:shadow-none`}
        >
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h3 className="font-bold text-lg text-brandNavy">Filters</h3>
            <button type="button" onClick={() => setShowFilters(false)} className="text-error text-sm font-medium">
              Close
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="font-semibold block mb-3 text-brandNavy">Price range (KES / mo)</label>
              <input
                type="range"
                min="0"
                max="200000"
                step="1000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brandTeal"
              />
              <div className="flex justify-between text-sm text-textSecondary mt-2">
                <span>0</span>
                <span>{priceRange.max.toLocaleString()}+</span>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-3 text-brandNavy">Bedrooms</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBeds(num)}
                    className={`flex-1 h-10 rounded-lg border transition-all text-sm font-medium ${
                      beds === num ? 'bg-brandTeal border-brandTeal text-white' : 'border-border bg-white text-brandNavy'
                    }`}
                  >
                    {num === 0 ? 'Any' : `${num}+`}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                fetchProperties();
                setShowFilters(false);
              }}
              className="btn-teal w-full justify-center"
            >
              Apply filters
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-surface/50 relative min-h-[50vh]">
          <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-sm font-medium border border-border p-1 flex">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm ${
                viewMode === 'grid' ? 'bg-surface text-brandTeal shadow-sm' : 'text-textSecondary'
              }`}
            >
              <Grid className="h-4 w-4" /> List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm ${
                viewMode === 'map' ? 'bg-surface text-brandTeal shadow-sm' : 'text-textSecondary'
              }`}
            >
              <Map className="h-4 w-4" /> Map
            </button>
          </div>

          <div className="p-4 md:p-8 pt-16 max-w-3xl mx-auto">
            <p className="text-sm text-textSecondary mb-6">
              {loading ? 'Loading…' : `${filteredByTab.length} ${filteredByTab.length === 1 ? 'property' : 'properties'} found`}
            </p>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="animate-pulse rounded-xl bg-white h-80 border border-border shadow-sm" />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="space-y-8">
                {filteredByTab.map((house) => (
                  <PropertyListingCard
                    key={house._id}
                    house={house}
                    badge={badgeForHouse(house, listingTab)}
                  />
                ))}
                {filteredByTab.length === 0 && (
                  <p className="text-center text-textSecondary py-16">No properties match your filters.</p>
                )}
              </div>
            ) : (
              <div className="w-full h-[560px] bg-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-border">
                <p className="text-textSecondary font-medium flex items-center gap-2">
                  <Map className="h-6 w-6" /> Map view — connect Leaflet to enable
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Search;
