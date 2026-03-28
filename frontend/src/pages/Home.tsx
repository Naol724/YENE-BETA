import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Search, Filter, User, HelpCircle, MapPin, Users, CloudUpload } from 'lucide-react';
import api from '../utils/api';
import PropertyListingCard, { type HouseCardModel } from '../components/PropertyListingCard';
import SiteFooter from '../components/SiteFooter';

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
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [listingTab, setListingTab] = useState<ListingTab>('all');
  const [houses, setHouses] = useState<HouseCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [adSlide, setAdSlide] = useState(0);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/houses?limit=12');
        setHouses(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
  }, []);

  const filteredListings = useMemo(() => {
    if (listingTab === 'sale') {
      const premium = houses.filter((h) => h.isPremium);
      return premium.length ? premium : houses.slice(0, 3);
    }
    if (listingTab === 'rent') {
      return houses.filter((h) => !h.isPremium);
    }
    return houses;
  }, [houses, listingTab]);

  const adImages = [
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
  ];

  return (
    <div className="animate-fade-in bg-white">
      <section className="relative min-h-[420px] md:min-h-[520px] flex items-center justify-center px-4 py-16 md:py-24 -mx-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-brandNavy/45" />
        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-6 py-8 md:px-10 md:py-10 border border-white/50">
            <h1 className="text-3xl md:text-4xl font-bold text-brandNavy text-center leading-tight">
              Find homes for rent in <span className="text-brandTeal">Kenya</span>
            </h1>
            <p className="mt-4 text-center text-textSecondary text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              Discover apartments, houses, and studios in Nairobi and beyond. Your next long-term rental is a
              few clicks away
              {isAuthenticated ? `, ${user?.fullName.split(' ')[0]}` : ''}.
            </p>
            <Link
              to="/search"
              className="mt-6 relative flex items-center rounded-full border border-border bg-white shadow-md hover:shadow-lg transition-shadow group"
            >
              <Search className="absolute left-4 h-5 w-5 text-textSecondary group-hover:text-brandTeal pointer-events-none" />
              <span className="block w-full py-3.5 pl-12 pr-14 text-textSecondary text-sm md:text-base">
                Search by location, price, or property type…
              </span>
              <span className="absolute right-2 p-2 rounded-full bg-surface group-hover:bg-brandTeal/10">
                <Filter className="h-4 w-4 text-brandTeal" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-10">
        <div className="flex justify-center">
          <Link
            to="/search"
            className="inline-flex items-center justify-center rounded-full bg-brandNavy text-white text-sm font-semibold px-8 py-2.5 hover:bg-black transition-colors"
          >
            View all
          </Link>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-brandNavy text-center">
            Explore properties in Nairobi
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-brandNavy rounded-full" />

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

          <div className="mt-10 space-y-8 pb-4">
            {loading ? (
              <>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="animate-pulse rounded-xl bg-surface h-80 max-w-3xl mx-auto border border-border"
                  />
                ))}
              </>
            ) : filteredListings.length === 0 ? (
              <p className="text-center text-textSecondary py-12">No listings match this filter yet.</p>
            ) : (
              filteredListings.map((house) => (
                <PropertyListingCard
                  key={house._id}
                  house={house}
                  badge={badgeForHouse(house, listingTab)}
                />
              ))
            )}
          </div>
        </section>

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
