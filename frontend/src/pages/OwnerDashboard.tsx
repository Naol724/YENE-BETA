import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  Home,
  MessageSquare,
  Eye,
  MessageCircle,
  Star,
  Plus,
  TrendingUp,
  Edit2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import api from '../utils/api';
import { formatTimeAgo } from '../utils/timeAgo';

interface PremiumData {
  isPremium: boolean;
  houseCount: number;
  canAddListing: boolean;
  limit: string | number;
  premiumExpiresAt?: string | null;
  freeListingsRemaining?: number | null;
}

interface House {
  _id: string;
  title: string;
  status: string;
  views?: number;
  pricing: { pricePerMonth: number };
  location: { city: string; area: string };
  images?: { url: string; isMain?: boolean }[];
}

interface Inquiry {
  _id: string;
  message: string;
  status: string;
  createdAt: string;
  renter?: { fullName?: string };
  property?: { title?: string };
}

const OwnerDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const [stats, setStats] = useState({
    totalListings: 0,
    totalInquiries: 0,
    viewsThisWeek: 0,
    responseRate: 0,
  });
  const [premiumStatus, setPremiumStatus] = useState<PremiumData | null>(null);
  const [listings, setListings] = useState<House[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [housesRes, inqRes, limitRes] = await Promise.all([
        api.get('/houses/my-listings'),
        api.get('/inquiries/received'),
        api.get('/premium/check-limit'),
      ]);

      const houses: House[] = housesRes.data.data ?? [];
      const inqs: Inquiry[] = inqRes.data.data ?? [];
      const prem: PremiumData = limitRes.data.data;

      setPremiumStatus(prem);
      setListings(houses);
      setInquiries(inqs);

      let totalViews = 0;
      houses.forEach((h) => {
        totalViews += h.views || 0;
      });

      const responded = inqs.filter((i) => i.status === 'Responded').length;
      const responseRate =
        inqs.length === 0 ? 100 : Math.round((responded / inqs.length) * 100);

      setStats({
        totalListings: houses.length,
        totalInquiries: inqs.length,
        viewsThisWeek: totalViews,
        responseRate,
      });
    } catch (err) {
      setLoadError('Could not load dashboard data. Check that the API is running and you are signed in.');
      if (import.meta.env.DEV) console.warn(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const newInquiryCount = inquiries.filter((i) => i.status === 'Pending').length;

  const inquiryBadge = (status: string) => {
    const map: Record<string, string> = {
      Pending: 'bg-error/15 text-error',
      Read: 'bg-warning/25 text-textPrimary',
      Responded: 'bg-success/15 text-success',
    };
    return map[status] ?? 'bg-surface text-textSecondary';
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/houses/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (house: House, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = house.status === 'Active' ? 'Paused' : 'Active';
    try {
      await api.put(`/houses/${house._id}`, { status: newStatus });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-error/40 bg-error/5 px-4 py-3 text-sm text-textPrimary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <span>{loadError}</span>
          <button type="button" onClick={() => load()} className="btn-primary !h-10 !px-4 shrink-0">
            Retry
          </button>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-textPrimary leading-tight">
            Welcome back, {firstName}{' '}
            <span aria-hidden className="inline-block">
              👋
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                user?.isApproved ? 'bg-success/15 text-success' : 'bg-warning/25 text-textPrimary'
              }`}
            >
              {user?.isApproved ? 'Approved' : 'Pending Approval'}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                premiumStatus?.isPremium
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-surface text-textSecondary border border-border'
              }`}
            >
              {premiumStatus?.isPremium && <Star className="h-3 w-3 fill-amber-500 text-amber-600" aria-hidden />}
              {premiumStatus?.isPremium ? 'Premium' : 'Free Plan'}
            </span>
            {premiumStatus?.isPremium && premiumStatus.premiumExpiresAt && (
              <span className="text-xs text-textSecondary w-full sm:w-auto">
                Renews {new Date(premiumStatus.premiumExpiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            to="/owner/profile"
            className="h-12 w-12 rounded-full border-2 border-border overflow-hidden shrink-0 bg-surface flex items-center justify-center text-textSecondary font-semibold self-end sm:self-auto"
            aria-label="Open profile"
          >
            {firstName[0]?.toUpperCase()}
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="card-container">
          <div className="flex items-center text-textSecondary text-sm mb-1">
            <Home className="h-4 w-4 mr-2 text-primary" aria-hidden />
            Total Listings
          </div>
          <p className="text-[32px] font-bold text-textPrimary leading-none">
            {loading ? '—' : stats.totalListings}
          </p>
          <p className="text-sm text-textSecondary mt-1">Active listings</p>
        </div>
        <div className="card-container relative">
          {newInquiryCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 flex items-center justify-center rounded-full bg-error text-white text-xs font-bold"
              aria-label={`${newInquiryCount} new inquiries`}
            >
              {newInquiryCount}
            </span>
          )}
          <div className="flex items-center text-textSecondary text-sm mb-1">
            <MessageSquare className="h-4 w-4 mr-2 text-primary" aria-hidden />
            Total Inquiries
          </div>
          <p className="text-[32px] font-bold text-textPrimary leading-none">
            {loading ? '—' : stats.totalInquiries}
          </p>
          <p className="text-sm text-textSecondary mt-1">Messages received</p>
        </div>
        <div className="card-container">
          <div className="flex items-center text-textSecondary text-sm mb-1">
            <Eye className="h-4 w-4 mr-2 text-primary" aria-hidden />
            Total views
          </div>
          <p className="text-[32px] font-bold text-textPrimary leading-none">
            {loading ? '—' : stats.viewsThisWeek}
          </p>
          <p className="text-sm text-textSecondary mt-1 flex items-center gap-1">
            Across all listings
            <TrendingUp className="h-3 w-3 text-success shrink-0" aria-hidden />
          </p>
        </div>
        <div className="card-container">
          <div className="flex items-center text-textSecondary text-sm mb-1">
            <MessageCircle className="h-4 w-4 mr-2 text-primary" aria-hidden />
            Response rate
          </div>
          <p className="text-[32px] font-bold text-textPrimary leading-none">
            {loading ? '—' : `${stats.responseRate}%`}
          </p>
          <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${stats.responseRate}%` }}
            />
          </div>
          <p className="text-sm text-textSecondary mt-1">Across all inquiries</p>
        </div>
      </div>

      {premiumStatus && !premiumStatus.isPremium && premiumStatus.freeListingsRemaining !== null && premiumStatus.freeListingsRemaining !== undefined && (
        <div className="mb-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <span className="font-semibold text-textPrimary">Free listings remaining: </span>
          <span className="text-primary font-bold">{premiumStatus.freeListingsRemaining}</span>
          {!premiumStatus.canAddListing && (
            <span className="block mt-2 text-warning text-xs font-medium">
              Limit reached — upgrade to add more properties.
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 mb-10">
        {premiumStatus && !premiumStatus.canAddListing ? (
          <Link
            to="/owner/premium"
            className="btn-primary w-full md:w-auto md:inline-flex text-center animate-bounce-subtle"
            aria-label="Upgrade to add more listings"
          >
            Upgrade to add another listing
          </Link>
        ) : (
          <Link
            to="/owner/listings/new"
            className="btn-primary w-full md:w-auto md:inline-flex animate-bounce-subtle"
            aria-label="Add new listing"
          >
            <Plus className="h-5 w-5 mr-2" aria-hidden />
            Add New Listing
          </Link>
        )}
        {!premiumStatus?.isPremium && (
          <Link
            to="/owner/premium"
            className="w-full md:w-auto md:inline-flex items-center justify-center h-12 px-6 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
          >
            Upgrade to Premium
          </Link>
        )}
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-textPrimary">Recent Listings</h2>
          <Link
            to="/owner/listings"
            className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
          >
            View All <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {listings.length === 0 && !loading ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
            <Home className="h-12 w-12 mx-auto text-textSecondary mb-3" aria-hidden />
            <p className="text-textPrimary font-medium mb-1">You haven&apos;t listed any properties yet</p>
            <p className="text-textSecondary text-sm mb-4">Your first listing is free — get started in minutes.</p>
            {premiumStatus && !premiumStatus.canAddListing ? (
              <Link to="/owner/premium" className="btn-primary inline-flex">
                Upgrade to list
              </Link>
            ) : (
              <Link to="/owner/listings/new" className="btn-primary inline-flex">
                Add Listing
              </Link>
            )}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 md:grid md:grid-cols-3 md:overflow-visible">
            {listings.slice(0, 3).map((house) => (
              <div
                key={house._id}
                className="min-w-[260px] md:min-w-0 flex gap-3 p-3 rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface shrink-0">
                  <img
                    src={house.images?.find((i) => i.isMain)?.url || house.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-textPrimary truncate">{house.title}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    KES {house.pricing?.pricePerMonth?.toLocaleString() ?? '—'}/mo
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-textSecondary">
                    <button
                      type="button"
                      onClick={(e) => toggleStatus(house, e)}
                      className="font-medium text-primary hover:underline"
                      aria-label={house.status === 'Active' ? 'Pause listing' : 'Activate listing'}
                    >
                      {house.status === 'Active' ? 'Active' : 'Paused'}
                    </button>
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" /> {house.views ?? 0}
                    </span>
                    <Link to={`/owner/listings/${house._id}/edit`} className="p-1 rounded hover:bg-surface" aria-label="Edit listing">
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(house._id, e)}
                      className="p-1 rounded hover:bg-error/10 text-error"
                      aria-label="Delete listing"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-textPrimary">Recent Inquiries</h2>
          <Link
            to="/owner/inquiries"
            className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
          >
            View All <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {inquiries.length === 0 && !loading ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-textSecondary mb-3" aria-hidden />
            <p className="text-textPrimary font-medium">No inquiries yet</p>
            <p className="text-textSecondary text-sm mt-1">When renters contact you, they&apos;ll appear here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {inquiries.slice(0, 5).map((inq) => (
              <li key={inq._id}>
                <Link
                  to={`/owner/inquiries/${inq._id}`}
                  className="flex gap-3 p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="h-11 w-11 rounded-full bg-surface border border-border flex items-center justify-center font-semibold text-textSecondary shrink-0">
                    {(inq.renter?.fullName ?? '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-textPrimary truncate">{inq.renter?.fullName ?? 'Renter'}</p>
                      <span className="text-xs text-textSecondary shrink-0">{formatTimeAgo(inq.createdAt)}</span>
                    </div>
                    <p className="text-xs text-textSecondary truncate">{inq.property?.title ?? 'Property'}</p>
                    <p className="text-sm text-textPrimary line-clamp-1 mt-1">{inq.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${inquiryBadge(inq.status)}`}>
                        {inq.status === 'Pending' ? 'New' : inq.status}
                      </span>
                      <span className="text-sm font-semibold text-primary">Quick reply</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default OwnerDashboard;
