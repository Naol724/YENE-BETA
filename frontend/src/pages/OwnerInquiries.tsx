import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import api from '../utils/api';
import { formatTimeAgo } from '../utils/timeAgo';

interface Inquiry {
  _id: string;
  message: string;
  status: string;
  createdAt: string;
  renter?: { fullName?: string };
  property?: { _id?: string; title?: string };
}

interface House {
  _id: string;
  title: string;
}

const OwnerInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [listings, setListings] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingFilter, setListingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [inqRes, housesRes] = await Promise.all([
          api.get('/inquiries/received'),
          api.get('/houses/my-listings'),
        ]);
        setInquiries(inqRes.data.data ?? []);
        setListings(housesRes.data.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...inquiries];
    if (listingFilter !== 'all') {
      list = list.filter((i) => {
        const p = i.property as { _id?: string } | string | undefined;
        const pid = typeof p === 'object' && p && '_id' in p ? p._id : String(p ?? '');
        return pid === listingFilter;
      });
    }
    if (statusFilter !== 'all') {
      list = list.filter((i) => i.status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          (i.renter?.fullName ?? '').toLowerCase().includes(q) ||
          (i.property?.title ?? '').toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q)
      );
    }
    return list;
  }, [inquiries, listingFilter, statusFilter, search]);

  const unread = inquiries.filter((i) => i.status === 'Pending').length;

  const badge = (status: string) => {
    const map: Record<string, string> = {
      Pending: 'bg-error/15 text-error',
      Read: 'bg-warning/25 text-textPrimary',
      Responded: 'bg-success/15 text-success',
    };
    return map[status] ?? 'bg-surface text-textSecondary';
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold">Inquiries</h1>
          {unread > 0 && (
            <p className="text-sm text-textSecondary mt-1">
              <span className="inline-flex items-center justify-center min-w-[22px] h-6 px-2 rounded-full bg-error text-white text-xs font-bold mr-2">
                {unread}
              </span>
              unread
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textSecondary" aria-hidden />
          <input
            type="search"
            className="input-field pl-11"
            placeholder="Search by renter or message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search inquiries"
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Filter className="h-5 w-5 text-textSecondary hidden sm:block" aria-hidden />
          <label className="sr-only" htmlFor="listing-filter">
            Filter by listing
          </label>
          <select
            id="listing-filter"
            className="input-field max-w-[200px]"
            value={listingFilter}
            onChange={(e) => setListingFilter(e.target.value)}
          >
            <option value="all">All listings</option>
            {listings.map((h) => (
              <option key={h._id} value={h._id}>
                {h.title}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="status-filter">
            Filter by status
          </label>
          <select
            id="status-filter"
            className="input-field max-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Pending">New</option>
            <option value="Read">Read</option>
            <option value="Responded">Responded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-surface">
          <p className="text-textPrimary font-medium mb-1">No inquiries yet</p>
          <p className="text-textSecondary text-sm">When renters contact you, they&apos;ll appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((inq) => (
            <li key={inq._id}>
              <Link
                to={`/owner/inquiries/${inq._id}`}
                className="block p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-textSecondary shrink-0">
                    {(inq.renter?.fullName ?? '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-textPrimary">{inq.renter?.fullName ?? 'Renter'}</p>
                      <span className="text-xs text-textSecondary shrink-0">{formatTimeAgo(inq.createdAt)}</span>
                    </div>
                    <p className="text-sm text-primary font-medium truncate">{inq.property?.title ?? 'Property'}</p>
                    <p className="text-sm text-textSecondary line-clamp-2 mt-1">{inq.message.slice(0, 80)}…</p>
                    <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${badge(inq.status)}`}>
                      {inq.status === 'Pending' ? 'New' : inq.status}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OwnerInquiries;
