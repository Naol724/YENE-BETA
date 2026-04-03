import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, SlidersHorizontal, Map, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchHouses } from '../services/propertyService';
import { useRenterFavoriteIds } from '../hooks/useRenterFavoriteIds';
import PropertyListingCard, { type HouseCardModel } from '../components/PropertyListingCard';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';
import FilterSidebar from '../components/FilterSidebar';
import SiteFooter from '../components/SiteFooter';
import DemoBanner from '../components/DemoBanner';
import BackNavButton from '../components/BackNavButton';
import { DEMO_LISTINGS } from '../data/demoListings';

type ListingTab = 'all' | 'rent' | 'sale';

type SortKey = 'newest' | 'price_low' | 'price_high';

function sortToApi(s: SortKey): string | undefined {
  if (s === 'newest') return '-createdAt';
  if (s === 'price_low') return 'pricing.pricePerMonth';
  if (s === 'price_high') return '-pricing.pricePerMonth';
  return undefined;
}

function badgeForHouse(house: HouseCardModel, tab: ListingTab): 'For Rent' | 'For Sale' | 'Featured' {
  if (tab === 'sale') return 'For Sale';
  if (house.isPremium) return 'Featured';
  return 'For Rent';
}

function filterDemoListings(
  list: HouseCardModel[],
  city: string,
  minPrice: number,
  maxPrice: number,
  beds: number,
  propertyType: string
): HouseCardModel[] {
  const c = city.trim().toLowerCase();
  return list.filter((h) => {
    const loc = `${h.location.city} ${h.location.area}`.toLowerCase();
    const cityOk = !c || loc.includes(c) || h.location.city.toLowerCase().includes(c);
    const price = h.pricing.pricePerMonth;
    const priceOk = price >= minPrice && (maxPrice >= 200000 || price <= maxPrice);
    const bedsOk = beds <= 0 || h.bedrooms >= beds;
    let typeOk = true;
    const t = propertyType.toLowerCase();
    if (t) {
      const title = h.title.toLowerCase();
      if (t === 'apartment') typeOk = /apartment|condo|flat/.test(title);
      else if (t === 'house') typeOk = /house|villa|home/.test(title);
      else if (t === 'studio') typeOk = /studio/.test(title);
      else if (t === 'condo') typeOk = /condo/.test(title);
    }
    return cityOk && priceOk && bedsOk && typeOk;
  });
}

const PAGE_SIZE = 10;

const Search: React.FC = () => {
  const { favoriteIds, toggleFavoriteId, isRenter } = useRenterFavoriteIds();
  const [searchParams, setSearchParams] = useSearchParams();
  const [houses, setHouses] = useState<HouseCardModel[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [listingTab, setListingTab] = useState<ListingTab>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [beds, setBeds] = useState(0);
  const [propertyType, setPropertyType] = useState('');
  /** Values used for API (updated on Apply so sliders don’t refetch every move) */
  const [appliedPrice, setAppliedPrice] = useState({ min: 0, max: 200000 });
  const [appliedBeds, setAppliedBeds] = useState(0);
  const [appliedType, setAppliedType] = useState('');

  useEffect(() => {
    setSearchTerm(searchParams.get('city') || '');
    setPage(1);
  }, [searchParams]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const city = searchParams.get('city') || '';
      const sort = sortToApi(sortKey);
      const res = await fetchHouses({
        city: city || undefined,
        minPrice: appliedPrice.min > 0 ? appliedPrice.min : undefined,
        maxPrice: appliedPrice.max < 200000 ? appliedPrice.max : undefined,
        bedrooms: appliedBeds > 0 ? appliedBeds : undefined,
        propertyType: appliedType || undefined,
        page,
        limit: PAGE_SIZE,
        sort,
      });
      setLoadFailed(false);
      setHouses(res.data || []);
      setTotal(res.pagination?.total ?? res.data?.length ?? 0);
    } catch (err) {
      console.error(err);
      setLoadFailed(true);
      // Sample listings still show when the API fails — no error toast (avoids alarm when offline).
      setHouses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, appliedPrice.min, appliedPrice.max, appliedBeds, appliedType, page, sortKey]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const cityParam = searchParams.get('city') || '';

  /** True when we show client-side demo rows (no real data from API yet). */
  const useDemoListings = !loading && houses.length === 0;

  const demoPool = useMemo(
    () =>
      filterDemoListings(DEMO_LISTINGS, cityParam, appliedPrice.min, appliedPrice.max, appliedBeds, appliedType),
    [cityParam, appliedPrice.min, appliedPrice.max, appliedBeds, appliedType]
  );

  const listingSource = useMemo(() => {
    if (houses.length > 0) return houses;
    return demoPool;
  }, [houses, demoPool]);

  const filteredByTab = useMemo(() => {
    if (listingTab === 'sale') {
      const premium = listingSource.filter((h) => h.isPremium);
      return premium.length ? premium : listingSource.slice(0, 6);
    }
    if (listingTab === 'rent') {
      return listingSource.filter((h) => !h.isPremium);
    }
    return listingSource;
  }, [listingSource, listingTab]);

  const pagedListings = useMemo(() => {
    if (!useDemoListings) return filteredByTab;
    const start = (page - 1) * PAGE_SIZE;
    return filteredByTab.slice(start, start + PAGE_SIZE);
  }, [useDemoListings, filteredByTab, page]);

  const totalPages = useDemoListings
    ? Math.max(1, Math.ceil(filteredByTab.length / PAGE_SIZE))
    : Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ city: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
    setPage(1);
  };

  const applyFilters = () => {
    setAppliedPrice(priceRange);
    setAppliedBeds(beds);
    setAppliedType(propertyType);
    setPage(1);
    setShowFilters(false);
  };

  useEffect(() => {
    if (showFilters) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [showFilters]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-7rem)] md:min-h-[calc(100dvh-6.25rem)] bg-white dark:bg-darkbg pb-8 transition-colors">
      <div className="sticky top-14 md:top-[100px] z-20 bg-white dark:bg-darksurface border-b border-border dark:border-slate-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 md:py-5">
          <div className="flex justify-start mb-4">
            <BackNavButton fallbackTo="/" />
          </div>
          {useDemoListings && (
            <div className="mb-4">
              <DemoBanner>
                {loadFailed
                  ? 'Cannot reach the API or the server returned an error. Sample listings are shown below — fix VITE_API_URL / MongoDB to load live data.'
                  : undefined}
              </DemoBanner>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-brandNavy dark:text-white text-center">
            Listings in Ethiopia
          </h1>
          <div className="mx-auto mt-3 h-1 w-16 bg-brandNavy dark:bg-brandTeal rounded-full" />

          <div className="mt-6 border-b border-border dark:border-slate-700">
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
                      : 'text-textSecondary border-transparent hover:text-brandNavy dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 max-w-7xl mx-auto flex flex-col sm:flex-row gap-2 sm:items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0 group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brandTeal transition-colors pointer-events-none z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="City, area or neighborhood…"
              className="input-field pl-12 h-12 w-full bg-surface dark:bg-darksurface hover:bg-white dark:hover:bg-slate-800 transition-colors rounded-xl border-border"
            />
          </form>
          <div className="flex gap-2 shrink-0">
            <select
              value={sortKey}
              onChange={(e) => {
                setSortKey(e.target.value as SortKey);
                setPage(1);
              }}
              className="input-field h-12 rounded-xl text-sm min-w-0 flex-1 sm:min-w-[140px]"
              aria-label="Sort listings"
            >
              <option value="newest">Newest first</option>
              <option value="price_low">Price: low to high</option>
              <option value="price_high">Price: high to low</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 w-12 rounded-xl flex justify-center items-center border transition-all shrink-0 lg:hidden ${
                showFilters
                  ? 'bg-brandTeal text-white border-brandTeal'
                  : 'bg-white dark:bg-darksurface border-border dark:border-slate-600 text-textSecondary hover:bg-surface'
              }`}
              aria-expanded={showFilters}
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: backdrop when filter drawer open */}
      {showFilters && (
        <button
          type="button"
          aria-label="Close filters"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 pb-4 grid grid-cols-1 lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] gap-5 lg:gap-6 items-start lg:relative lg:z-0">
        {/* Filters: scrollable fields + sticky Apply footer so the button is never covered */}
        <aside
          className={[
            'bg-white dark:bg-darksurface border border-border dark:border-slate-600 rounded-2xl shadow-sm',
            'flex flex-col min-h-0 overflow-hidden',
            'lg:sticky lg:top-[calc(3.5rem+100px+1rem)] lg:z-20 lg:self-start lg:max-h-[calc(100dvh-11rem)] lg:w-full lg:max-w-[240px]',
            showFilters
              ? 'fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] rounded-none lg:static lg:inset-auto lg:z-20 lg:h-auto lg:max-h-[calc(100dvh-11rem)] lg:rounded-2xl'
              : 'hidden lg:flex',
          ].join(' ')}
        >
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-6 pb-2 lg:pt-4 lg:pb-2">
            <FilterSidebar
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              beds={beds}
              onBedsChange={setBeds}
              propertyType={propertyType}
              onPropertyTypeChange={setPropertyType}
              onApply={applyFilters}
              onClose={() => setShowFilters(false)}
              showClose
              showApplyButton={false}
              currencyLabel="ETB / mo"
            />
          </div>
          <div className="shrink-0 border-t border-border dark:border-slate-600 bg-white dark:bg-darksurface px-4 py-3 lg:py-3 lg:rounded-b-2xl">
            <button type="button" onClick={applyFilters} className="btn-teal w-full justify-center !h-11 lg:!h-10 text-sm shadow-sm">
              Apply filters
            </button>
          </div>
        </aside>

        <div className="min-w-0 relative z-0 bg-surface/50 dark:bg-darkbg/80 rounded-2xl border border-border/60 dark:border-slate-700/80 min-h-[50vh]">
          <div className="sticky top-[calc(3.5rem+6rem)] z-[5] sm:static sm:z-auto flex justify-end p-3 sm:p-4 pb-0 bg-surface/95 dark:bg-darkbg/95 sm:bg-transparent sm:dark:bg-transparent backdrop-blur-sm rounded-t-2xl border-b border-border/50 dark:border-slate-700/50 sm:border-0">
            <div className="bg-white dark:bg-darksurface rounded-lg shadow-sm font-medium border border-border dark:border-slate-600 p-1 flex">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm ${
                  viewMode === 'grid'
                    ? 'bg-surface dark:bg-slate-700 text-brandTeal shadow-sm'
                    : 'text-textSecondary'
                }`}
              >
                <Grid className="h-4 w-4" /> List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm ${
                  viewMode === 'map'
                    ? 'bg-surface dark:bg-slate-700 text-brandTeal shadow-sm'
                    : 'text-textSecondary'
                }`}
              >
                <Map className="h-4 w-4" /> Map
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 pt-3 sm:pt-4 max-w-[1600px] mx-auto w-full">
            <p className="text-sm text-textSecondary dark:text-darkmuted mb-6">
              {loading
                ? 'Loading…'
                : `${useDemoListings ? pagedListings.length : filteredByTab.length} ${(useDemoListings ? pagedListings.length : filteredByTab.length) === 1 ? 'property' : 'properties'} on this page`}
            </p>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <PropertyCardSkeleton key={n} />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                {pagedListings.map((house) => (
                  <PropertyListingCard
                    key={house._id}
                    variant="grid"
                    house={house}
                    badge={badgeForHouse(house, listingTab)}
                    favoriteHouseIds={isRenter ? favoriteIds : undefined}
                    onFavoriteToggle={toggleFavoriteId}
                  />
                ))}
                {filteredByTab.length === 0 && (
                  <p className="text-center text-textSecondary py-16 col-span-full">No properties match your filters.</p>
                )}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6 pb-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-lg border border-border dark:border-slate-600 disabled:opacity-40 hover:bg-surface dark:hover:bg-darksurface"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-textSecondary">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="p-2 rounded-lg border border-border dark:border-slate-600 disabled:opacity-40 hover:bg-surface dark:hover:bg-darksurface"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-[560px] bg-gray-200 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-border dark:border-slate-600">
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
