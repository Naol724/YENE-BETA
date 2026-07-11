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

function matchesCity(house: HouseCardModel, city: string): boolean {
  const c = city.trim().toLowerCase();
  if (!c) return true;
  const cityName = (house.location?.city || '').toLowerCase();
  const area = (house.location?.area || '').toLowerCase();
  const title = (house.title || '').toLowerCase();
  return (
    cityName.includes(c) ||
    c.includes(cityName) ||
    area.includes(c) ||
    `${cityName} ${area}`.includes(c) ||
    title.includes(c)
  );
}

function filterListings(
  list: HouseCardModel[],
  city: string,
  minPrice: number,
  maxPrice: number,
  beds: number,
  propertyType: string
): HouseCardModel[] {
  return list.filter((h) => {
    const cityOk = matchesCity(h, city);
    const price = h.pricing.pricePerMonth;
    const priceOk = price >= minPrice && (maxPrice >= 200000 || price <= maxPrice);
    const bedsOk = beds <= 0 || h.bedrooms >= beds;
    let typeOk = true;
    const t = propertyType.toLowerCase();
    if (t) {
      const title = h.title.toLowerCase();
      const pt = ((h as HouseCardModel & { propertyType?: string }).propertyType || '').toLowerCase();
      if (t === 'apartment') typeOk = /apartment|condo|flat/.test(title) || pt.includes('apartment');
      else if (t === 'house') typeOk = /house|villa|home/.test(title) || pt.includes('house');
      else if (t === 'studio') typeOk = /studio/.test(title) || pt.includes('studio');
      else if (t === 'condo') typeOk = /condo/.test(title) || pt.includes('condo');
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
  const [appliedPrice, setAppliedPrice] = useState({ min: 0, max: 200000 });
  const [appliedBeds, setAppliedBeds] = useState(0);
  const [appliedType, setAppliedType] = useState('');

  // Keep input in sync when city comes from URL (popular cities, home search, etc.)
  useEffect(() => {
    const fromUrl = searchParams.get('city') || '';
    setSearchTerm((prev) => (prev === fromUrl ? prev : fromUrl));
    setPage(1);
  }, [searchParams]);

  // As the user types a city, update the URL (debounced) so the API refetches
  useEffect(() => {
    const trimmed = searchTerm.trim();
    const current = (searchParams.get('city') || '').trim();
    if (trimmed === current) return;

    const timer = window.setTimeout(() => {
      if (trimmed) {
        setSearchParams({ city: trimmed }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  // Instant client filter while typing; API uses the (debounced) URL city
  const cityQuery = searchTerm.trim();
  const cityParam = searchParams.get('city') || '';

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const sort = sortToApi(sortKey);
      const res = await fetchHouses({
        city: cityParam || undefined,
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
      setHouses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [cityParam, appliedPrice.min, appliedPrice.max, appliedBeds, appliedType, page, sortKey]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredLive = useMemo(
    () => filterListings(houses, cityQuery, appliedPrice.min, appliedPrice.max, appliedBeds, appliedType),
    [houses, cityQuery, appliedPrice.min, appliedPrice.max, appliedBeds, appliedType]
  );

  const demoPool = useMemo(
    () =>
      filterListings(DEMO_LISTINGS, cityQuery, appliedPrice.min, appliedPrice.max, appliedBeds, appliedType),
    [cityQuery, appliedPrice.min, appliedPrice.max, appliedBeds, appliedType]
  );

  const listingSource = useMemo(() => {
    if (filteredLive.length > 0) return filteredLive;
    if (!loading) return demoPool;
    return [];
  }, [filteredLive, demoPool, loading]);

  const showingDemos = !loading && filteredLive.length === 0 && demoPool.length > 0;

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
    if (showingDemos) {
      const start = (page - 1) * PAGE_SIZE;
      return filteredByTab.slice(start, start + PAGE_SIZE);
    }
    // Live API already returns the current page
    return filteredByTab;
  }, [showingDemos, filteredByTab, page]);

  const totalPages = showingDemos
    ? Math.max(1, Math.ceil(filteredByTab.length / PAGE_SIZE))
    : Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      setSearchParams({ city: trimmed });
    } else {
      setSearchParams({});
    }
    setPage(1);
  };

  const clearCity = () => {
    setSearchTerm('');
    setSearchParams({});
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

  const resultCount = showingDemos
    ? filteredByTab.length
    : cityQuery
      ? filteredByTab.length
      : total || filteredByTab.length;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-6.25rem)] bg-surface dark:bg-darkbg transition-colors overflow-x-hidden">
      {/* Page header — NOT sticky (avoids overlap with listings) */}
      <div className="bg-white dark:bg-darksurface border-b border-border dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 pb-3 sm:pb-4">
          <div className="mb-3 sm:mb-4">
            <BackNavButton fallbackTo="/" />
          </div>

          {showingDemos && (
            <div className="mb-3 sm:mb-4">
              <DemoBanner>
                {loadFailed
                  ? 'Cannot reach the API or the server returned an error. Sample listings are shown below — fix VITE_API_URL / MongoDB to load live data.'
                  : cityQuery
                    ? `Showing sample listings in ${cityQuery}. Publish real homes from the owner dashboard to replace demo data.`
                    : undefined}
              </DemoBanner>
            </div>
          )}

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-brandNavy dark:text-white text-center leading-tight">
            {cityQuery ? `Listings in ${cityQuery}` : 'Listings in Ethiopia'}
          </h1>
          <div className="mx-auto mt-2 sm:mt-3 h-1 w-12 sm:w-16 bg-brandNavy dark:bg-brandTeal rounded-full" />

          {cityQuery && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={clearCity}
                className="inline-flex items-center gap-2 rounded-full border border-brandTeal/40 bg-brandTeal/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-brandTeal hover:bg-brandTeal/20 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                {cityQuery}
                <span className="text-brandTeal/80" aria-hidden>
                  ×
                </span>
                <span className="sr-only">Clear city filter</span>
              </button>
            </div>
          )}

          <div className="mt-4 sm:mt-5 border-b border-border dark:border-slate-700 -mx-3 sm:mx-0 px-3 sm:px-0">
            <div className="flex justify-center gap-3 sm:gap-6 md:gap-10 overflow-x-auto hide-scrollbar">
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
                  onClick={() => {
                    setListingTab(id);
                    setPage(1);
                  }}
                  className={`pb-2.5 sm:pb-3 text-[11px] sm:text-sm font-semibold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    listingTab === id
                      ? 'text-brandTeal border-brandTeal'
                      : 'text-textSecondary dark:text-slate-400 border-transparent hover:text-brandNavy dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compact sticky search toolbar only */}
      <div className="sticky top-14 md:top-[100px] z-30 bg-white/95 dark:bg-darksurface/95 backdrop-blur-md border-b border-border dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="City, area or neighborhood…"
              className="input-field !pl-10 sm:!pl-12 !h-10 sm:!h-11 w-full rounded-xl text-sm"
            />
          </form>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            <select
              value={sortKey}
              onChange={(e) => {
                setSortKey(e.target.value as SortKey);
                setPage(1);
              }}
              className="input-field !h-10 sm:!h-11 rounded-xl text-sm flex-1 sm:flex-none sm:min-w-[148px]"
              aria-label="Sort listings"
            >
              <option value="newest">Newest first</option>
              <option value="price_low">Price: low to high</option>
              <option value="price_high">Price: high to low</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl flex justify-center items-center gap-1.5 border border-border dark:border-slate-600 bg-white dark:bg-slate-800 text-brandNavy dark:text-slate-100 hover:border-brandTeal lg:hidden shrink-0 text-sm font-medium"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <button
          type="button"
          aria-label="Close filters"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
        <aside
          className={[
            'bg-white dark:bg-darksurface border border-border dark:border-slate-600 rounded-2xl shadow-sm',
            'flex flex-col min-h-0 overflow-hidden',
            'lg:sticky lg:top-[calc(100px+3.25rem+0.75rem)] lg:self-start lg:max-h-[calc(100dvh-9rem)]',
            showFilters
              ? 'fixed inset-x-0 bottom-0 top-14 z-50 rounded-t-2xl lg:static lg:inset-auto lg:z-auto lg:rounded-2xl lg:top-auto'
              : 'hidden lg:flex',
          ].join(' ')}
        >
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-5 pb-2 lg:pt-4">
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
          <div className="shrink-0 border-t border-border dark:border-slate-600 bg-white dark:bg-darksurface px-4 py-3 safe-pb">
            <button
              type="button"
              onClick={applyFilters}
              className="btn-teal w-full justify-center !h-11 text-sm shadow-sm"
            >
              Apply filters
            </button>
          </div>
        </aside>

        <div className="min-w-0 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-textSecondary dark:text-slate-400">
              {loading
                ? 'Loading…'
                : `${resultCount} ${resultCount === 1 ? 'property' : 'properties'}`}
            </p>
            <div className="bg-white dark:bg-darksurface rounded-lg border border-border dark:border-slate-600 p-0.5 flex">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs sm:text-sm ${
                  viewMode === 'grid'
                    ? 'bg-surface dark:bg-slate-700 text-brandTeal shadow-sm'
                    : 'text-textSecondary dark:text-slate-400'
                }`}
              >
                <Grid className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs sm:text-sm ${
                  viewMode === 'map'
                    ? 'bg-surface dark:bg-slate-700 text-brandTeal shadow-sm'
                    : 'text-textSecondary dark:text-slate-400'
                }`}
              >
                <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Map
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              {[1, 2, 3, 4].map((n) => (
                <PropertyCardSkeleton key={n} />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 items-stretch">
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
                  <p className="text-center text-textSecondary dark:text-slate-400 py-12 sm:py-16 col-span-full text-sm">
                    No properties match your filters.
                  </p>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 sm:gap-4 pt-6 pb-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-lg border border-border dark:border-slate-600 disabled:opacity-40 hover:bg-white dark:hover:bg-darksurface text-brandNavy dark:text-slate-100"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-textSecondary dark:text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-lg border border-border dark:border-slate-600 disabled:opacity-40 hover:bg-white dark:hover:bg-darksurface text-brandNavy dark:text-slate-100"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-[280px] sm:h-[420px] md:h-[560px] bg-gray-200 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-border dark:border-slate-600">
              <p className="text-textSecondary dark:text-slate-400 font-medium flex items-center gap-2 text-sm px-4 text-center">
                <Map className="h-5 w-5 shrink-0" /> Map view — connect Leaflet to enable
              </p>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Search;
