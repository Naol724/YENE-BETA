import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion } from 'framer-motion';
import type { RootState } from '../store';
import { useI18n } from '../context/I18nContext';
import { Search, User, HelpCircle, MapPin, Users, CloudUpload, Sparkles } from 'lucide-react';
import { fetchHouses } from '../services/propertyService';
import { useRenterFavoriteIds } from '../hooks/useRenterFavoriteIds';
import PropertyListingCard, { type HouseCardModel } from '../components/PropertyListingCard';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';
import SearchBar from '../components/SearchBar';
import SiteFooter from '../components/SiteFooter';
import DemoBanner from '../components/DemoBanner';
import { DEMO_LISTINGS } from '../data/demoListings';
import { POPULAR_CITY_CARDS } from '../data/popularCityCards';
import { getRecentlyViewed } from '../utils/recentlyViewed';

type ListingTab = 'all' | 'rent' | 'sale';

const HERO_BG =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80';

const FEATURES = [
  {
    icon: User,
    title: 'User friendly',
    text: 'Clean layouts and fast flows so you can browse listings, save favorites, and message owners without friction.',
  },
  {
    icon: HelpCircle,
    title: 'Free support',
    text: '24/7 help when you need it—questions about listings, owners, or your account.',
  },
  {
    icon: Search,
    title: 'Advanced search',
    text: 'Filter by location, price, and bedrooms to narrow down rentals that match your budget and lifestyle.',
  },
  {
    icon: MapPin,
    title: 'Maps ready',
    text: 'See where each property sits—perfect for planning commutes and neighborhood checks.',
  },
  {
    icon: Users,
    title: 'Trusted community',
    text: 'Owners and renters on one platform with clear roles and moderated listings.',
  },
  {
    icon: CloudUpload,
    title: 'List in minutes',
    text: 'Owners can post photos, pricing, and details from the dashboard in a few steps.',
  },
];

function badgeForHouse(house: HouseCardModel, tab: ListingTab): 'For Rent' | 'For Sale' | 'Featured' {
  if (tab === 'sale') return 'For Sale';
  if (house.isPremium) return 'Featured';
  return 'For Rent';
}

const Home: React.FC = () => {
  const { t, locale } = useI18n();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { favoriteIds, toggleFavoriteId, isRenter } = useRenterFavoriteIds();
  const [listingTab, setListingTab] = useState<ListingTab>('all');
  const [houses, setHouses] = useState<HouseCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [adSlide, setAdSlide] = useState(0);
  const [listingsError, setListingsError] = useState<'offline' | 'server' | null>(null);
  const [recent, setRecent] = useState(() => getRecentlyViewed());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setListingsError(null);
        const res = await fetchHouses({ limit: 12 });
        setHouses(res.data || []);
      } catch (error) {
        setHouses([]);
        const isServerResponse = axios.isAxiosError(error) && error.response != null;
        setListingsError(isServerResponse ? 'server' : 'offline');
        // No toast.error here: sample listings still render; avoids duplicate toasts (e.g. React Strict Mode).
        if (import.meta.env.DEV) {
          console.warn('[Home] listings fetch failed', error);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') setRecent(getRecentlyViewed());
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  /** When the API returns nothing (or fails), still show sample listings so the home page stays usable. */
  const listingSource = useMemo(() => {
    if (houses.length > 0) return houses;
    return DEMO_LISTINGS;
  }, [houses]);

  const showDemoListings = houses.length === 0;

  const filteredListings = useMemo(() => {
    if (listingTab === 'sale') {
      const premium = listingSource.filter((h) => h.isPremium);
      return premium.length ? premium : listingSource.slice(0, 3);
    }
    if (listingTab === 'rent') {
      return listingSource.filter((h) => !h.isPremium);
    }
    return listingSource;
  }, [listingSource, listingTab]);

  const adImages = [
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
  ];

  return (
    <div className="animate-fade-in bg-white dark:bg-darkbg transition-colors">
      <section className="relative min-h-[420px] md:min-h-[560px] flex items-center justify-center px-4 py-16 md:py-24 -mx-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 motion-safe:animate-[pulse_20s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-brandNavy/50 dark:bg-black/60" />
        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/95 dark:bg-darksurface/95 backdrop-blur-md rounded-2xl shadow-2xl px-6 py-8 md:px-10 md:py-10 border border-white/50 dark:border-slate-600"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-brandNavy dark:text-white text-center leading-tight">
              {locale === 'en' ? (
                <>
                  Find homes for rent in <span className="text-brandTeal">Ethiopia</span>
                </>
              ) : (
                t('hero.title')
              )}
            </h1>
            <p className="mt-4 text-center text-textSecondary dark:text-darkmuted text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              {t('hero.subtitle')}
              {isAuthenticated ? ` ${user?.fullName.split(' ')[0]},` : ''}
            </p>
            <div className="mt-6">
              <SearchBar />
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 rounded-full bg-brandTeal text-white text-sm font-semibold px-8 py-3 shadow-lg hover:bg-brandTealDark transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4" />
                {t('hero.cta')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10">
        <section className="mb-14">
          <h2 className="text-lg font-semibold text-brandNavy dark:text-white text-center">Popular cities</h2>
          <p className="text-center text-sm text-textSecondary dark:text-darkmuted mt-1">
            Browse rentals across Ethiopia
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {POPULAR_CITY_CARDS.map((c) => (
              <Link
                key={c.param}
                to={`/search?city=${encodeURIComponent(c.param)}`}
                className="px-4 py-2 rounded-full bg-surface dark:bg-darksurface border border-border dark:border-slate-600 text-sm font-medium text-brandNavy dark:text-slate-200 hover:border-brandTeal hover:text-brandTeal transition-colors shadow-sm"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {POPULAR_CITY_CARDS.map((c) => (
              <Link
                key={`card-${c.param}`}
                to={`/search?city=${encodeURIComponent(c.param)}`}
                className="group rounded-2xl border border-border dark:border-slate-600 bg-white dark:bg-darksurface overflow-hidden shadow-md hover:shadow-xl hover:border-brandTeal/50 transition-all text-left flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={c.image}
                    alt={`${c.name} — ${c.tagline}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-lg leading-tight drop-shadow-sm">{c.name}</p>
                    <p className="text-white/90 text-xs font-medium mt-0.5">{c.tagline}</p>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brandTeal">{c.areas}</p>
                  <p className="text-sm text-textSecondary dark:text-darkmuted mt-2 leading-relaxed flex-1">
                    {c.highlight}
                  </p>
                  <p className="text-sm font-semibold text-brandNavy dark:text-white mt-3">{c.sampleFrom}</p>
                  <span className="mt-3 inline-flex items-center text-sm font-semibold text-brandTeal group-hover:gap-1 transition-all">
                    Explore rentals
                    <span className="ml-1 group-hover:translate-x-0.5 transition-transform" aria-hidden>
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex justify-center">
          <Link
            to="/search"
            className="inline-flex items-center justify-center rounded-full bg-brandNavy dark:bg-slate-800 text-white text-sm font-semibold px-8 py-2.5 hover:bg-black dark:hover:bg-slate-700 transition-colors"
          >
            View all
          </Link>
        </div>

        <section className="mt-14">
          {showDemoListings && (
            <div className="mb-6 space-y-3">
              <DemoBanner>
                {listingsError === 'offline'
                  ? 'Cannot reach the API. Sample listings are shown below — start the backend (e.g. npm run api) or set VITE_API_URL in frontend/.env and restart Vite.'
                  : listingsError === 'server'
                    ? 'The API returned an error (often MongoDB or the backend). Sample listings are shown below while you fix MONGODB_URI and restart the API.'
                    : undefined}
              </DemoBanner>
              {listingsError && (
                <div
                  role="status"
                  className="rounded-xl border border-amber-200/80 dark:border-amber-700/50 bg-amber-50/90 dark:bg-amber-950/30 px-4 py-3 text-sm text-textPrimary dark:text-slate-100"
                >
                  <p className="font-medium">Fix live data (optional)</p>
                  <p className="mt-1 text-textSecondary dark:text-darkmuted text-xs leading-relaxed">
                    {listingsError === 'offline' ? (
                      <>
                        Run <code className="text-[11px] bg-white/90 dark:bg-slate-800 px-1 rounded">npm run api</code>{' '}
                        from the project root (port 5000). Match{' '}
                        <code className="text-[11px] bg-white/90 dark:bg-slate-800 px-1 rounded">VITE_API_URL</code> in{' '}
                        <code className="text-[11px] bg-white/90 dark:bg-slate-800 px-1 rounded">frontend/.env</code>.
                      </>
                    ) : (
                      <>
                        Check <code className="text-[11px] bg-white/90 dark:bg-slate-800 px-1 rounded">MONGODB_URI</code>{' '}
                        and Atlas network access for the API process.
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm font-medium text-brandTeal underline"
                  >
                    Retry loading live listings
                  </button>
                </div>
              )}
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-brandNavy dark:text-white text-center">
            Explore properties in Ethiopia
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-brandNavy dark:bg-brandTeal rounded-full" />

          <div className="mt-8 border-b border-border">
            <div className="flex justify-center gap-8 md:gap-12">
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
                  className={`pb-3 text-sm font-semibold uppercase tracking-wide border-b-2 transition-colors ${
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

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pb-4 items-stretch">
            {loading ? (
              <>
                {[1, 2, 3].map((n) => (
                  <PropertyCardSkeleton key={n} />
                ))}
              </>
            ) : filteredListings.length === 0 ? (
              <p className="text-center text-textSecondary dark:text-darkmuted py-12 col-span-full">
                No listings match this filter yet.
              </p>
            ) : (
              filteredListings.map((house) => (
                <PropertyListingCard
                  key={house._id}
                  variant="grid"
                  house={house}
                  badge={badgeForHouse(house, listingTab)}
                  favoriteHouseIds={isRenter ? favoriteIds : undefined}
                  onFavoriteToggle={toggleFavoriteId}
                />
              ))
            )}
          </div>
        </section>

        {recent.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-brandNavy dark:text-white text-center">Recently viewed</h2>
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2 hide-scrollbar max-w-4xl mx-auto">
              {recent.map((item) => (
                <Link
                  key={item.id}
                  to={`/house/${item.id}`}
                  className="flex-shrink-0 w-44 rounded-xl overflow-hidden border border-border dark:border-slate-600 bg-white dark:bg-darksurface shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="p-2 text-xs font-medium text-brandNavy dark:text-slate-100 line-clamp-2">{item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 pt-4">
          <h2 className="text-2xl font-bold text-brandNavy text-center">Ads</h2>
          <div className="mx-auto mt-3 h-1 w-12 bg-brandNavy rounded-full" />
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {adImages.map((src, i) => (
              <div
                key={src}
                className={`relative rounded-xl overflow-hidden shadow-md aspect-[4/3] group cursor-pointer border border-border/80 ${
                  adSlide !== i ? 'sm:opacity-90' : ''
                }`}
                onClick={() => setAdSlide(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setAdSlide(i);
                }}
                role="button"
                tabIndex={0}
              >
                <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brandNavy shadow">
                  <Search className="h-3.5 w-3.5" />
                  {120 + i * 35}
                </span>
                {i === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="btn-teal text-sm shadow-lg">View property</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {adImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAdSlide(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  adSlide === i ? 'bg-brandNavy' : 'bg-border ring-1 ring-brandNavy/20'
                }`}
                aria-label={`Ad slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="mt-20 pb-4">
          <div className="flex justify-center mb-10">
            <Link
              to="/search"
              className="rounded-full bg-brandNavy text-white text-sm font-semibold px-10 py-2.5 hover:bg-black transition-colors"
            >
              More ads
            </Link>
          </div>
          <h2 className="text-3xl font-bold text-brandNavy text-center">Features</h2>
          <div className="mx-auto mt-3 h-1 w-14 bg-brandNavy rounded-full" />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12 max-w-4xl mx-auto">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center sm:text-left">
                <div className="inline-flex p-3 rounded-full bg-brandNavy/5 text-brandNavy mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-brandNavy">{title}</h3>
                <p className="mt-2 text-sm text-textSecondary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-brandNavy text-center">Our partners</h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-brandNavy rounded-full" />
          <div className="mt-10 flex flex-wrap justify-center gap-10 md:gap-16 items-center opacity-90">
            <div className="h-16 px-8 rounded-lg border-2 border-emerald-600/40 bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold text-sm tracking-wide">
              Partner Realty
            </div>
            <div className="h-16 px-8 rounded-lg border-2 border-blue-600/40 bg-blue-50 flex items-center justify-center text-blue-900 font-bold text-sm tracking-wide">
              Metro Homes
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Home;
