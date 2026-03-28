import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Eye,
  MessageSquare,
  LayoutGrid,
  List,
  Search,
  Home,
  Bed,
  Bath,
  Crown,
} from 'lucide-react';
import api from '../utils/api';

type SortKey = 'newest' | 'priceAsc' | 'priceDesc' | 'views';

interface House {
  _id: string;
  title: string;
  status: string;
  createdAt?: string;
  views?: number;
  inquiryCount?: number;
  isPremium?: boolean;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  pricing: { pricePerMonth: number };
  location: { city: string; area: string };
  images?: { url: string; isMain?: boolean }[];
}

const PAGE_SIZE = 10;

const OwnerListings: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHouses = async () => {
    try {
      const res = await api.get('/houses/my-listings');
      setHouses(res.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const filtered = useMemo(() => {
    let list = [...houses];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.location.city.toLowerCase().includes(q) ||
          h.location.area.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case 'priceAsc':
          return (a.pricing?.pricePerMonth ?? 0) - (b.pricing?.pricePerMonth ?? 0);
        case 'priceDesc':
          return (b.pricing?.pricePerMonth ?? 0) - (a.pricing?.pricePerMonth ?? 0);
        case 'views':
          return (b.views ?? 0) - (a.views ?? 0);
        case 'newest':
        default: {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        }
      }
    });
    return list;
  }, [houses, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this listing?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/houses/${id}`);
      setHouses((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (house: House) => {
    const newStatus = house.status === 'Active' ? 'Paused' : 'Active';
    try {
      await api.put(`/houses/${house._id}`, { status: newStatus });
      fetchHouses();
    } catch (err) {
      console.error(err);
    }
  };

  const thumb = (h: House) =>
    h.images?.find((i) => i.isMain)?.url || h.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400';

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-[28px] font-bold text-textPrimary">My Listings</h1>
        <Link to="/owner/listings/new" className="btn-primary inline-flex justify-center sm:justify-start">
          <Plus className="h-5 w-5 mr-2" aria-hidden />
          Add Listing
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textSecondary" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, city, or area"
            className="input-field pl-11"
            aria-label="Filter listings by title or location"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <label className="sr-only" htmlFor="sort-listings">
            Sort listings
          </label>
          <select
            id="sort-listings"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input-field max-w-[200px]"
          >
            <option value="newest">Newest</option>
            <option value="priceAsc">Price (Low–High)</option>
            <option value="priceDesc">Price (High–Low)</option>
            <option value="views">Most viewed</option>
          </select>
          <div className="flex rounded-lg border border-border overflow-hidden" role="group" aria-label="View mode">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`p-2.5 ${view === 'grid' ? 'bg-primary text-white' : 'bg-white text-textSecondary'}`}
              aria-pressed={view === 'grid'}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-2.5 ${view === 'list' ? 'bg-primary text-white' : 'bg-white text-textSecondary'}`}
              aria-pressed={view === 'list'}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-surface rounded-xl animate-pulse border border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-border bg-surface">
          <Home className="h-16 w-16 mx-auto text-textSecondary mb-4" aria-hidden />
          <h2 className="text-xl font-bold text-textPrimary mb-2">No listings yet</h2>
          <p className="text-textSecondary mb-6 max-w-md mx-auto">
            Add your first property — it&apos;s free to list your first home and reach renters across Kenya.
          </p>
          <Link to="/owner/listings/new" className="btn-primary inline-flex">
            Add your first property
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {slice.map((house) => (
            <article
              key={house._id}
              className="rounded-xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-video bg-surface relative">
                <img src={thumb(house)} alt="" className="w-full h-full object-cover" />
                {house.isPremium && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-bold px-2 py-1 rounded">
                    <Crown className="h-3 w-3" /> Premium
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-textPrimary line-clamp-2 min-h-[3rem]">{house.title}</h3>
                <p className="text-sm text-textSecondary mt-1">
                  {house.location.area}, {house.location.city}
                </p>
                <p className="text-lg font-bold text-primary mt-2">
                  KES {house.pricing?.pricePerMonth?.toLocaleString()}/mo
                </p>
                <div className="flex items-center gap-3 text-sm text-textSecondary mt-2">
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" /> {house.bedrooms ?? '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" /> {house.bathrooms ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => toggleStatus(house)}
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      house.status === 'Active' ? 'bg-success/15 text-success' : 'bg-textSecondary/15 text-textSecondary'
                    }`}
                  >
                    {house.status === 'Active' ? 'Active' : 'Paused'}
                  </button>
                  <div className="flex gap-3 text-xs text-textSecondary">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3.5 w-3.5" /> {house.views ?? 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="h-3.5 w-3.5" /> {house.inquiryCount ?? 0}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/owner/listings/${house._id}/edit`}
                    className="flex-1 btn-primary !h-10 text-sm"
                  >
                    <Edit2 className="h-4 w-4 mr-1 inline" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleStatus(house)}
                    className="flex-1 h-10 px-3 rounded-lg border border-border font-medium text-sm flex items-center justify-center gap-1 hover:bg-surface"
                    aria-label={house.status === 'Active' ? 'Pause listing' : 'Activate listing'}
                  >
                    {house.status === 'Active' ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(house._id)}
                    disabled={deletingId === house._id}
                    className="h-10 px-3 rounded-lg border border-error/30 text-error hover:bg-error/5 disabled:opacity-50"
                    aria-label="Delete listing"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {slice.map((house) => (
            <li
              key={house._id}
              className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-white shadow-sm"
            >
              <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden bg-surface shrink-0">
                <img src={thumb(house)} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <h3 className="font-semibold text-textPrimary truncate">{house.title}</h3>
                  <button
                    type="button"
                    onClick={() => toggleStatus(house)}
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      house.status === 'Active' ? 'bg-success/15 text-success' : 'bg-textSecondary/15 text-textSecondary'
                    }`}
                  >
                    {house.status}
                  </button>
                </div>
                <p className="text-sm text-textSecondary">
                  {house.location.area}, {house.location.city}
                </p>
                <p className="font-bold text-primary mt-1">KES {house.pricing?.pricePerMonth?.toLocaleString()}/mo</p>
                <div className="flex gap-4 text-sm text-textSecondary mt-2">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {house.views ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> {house.inquiryCount ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 justify-end">
                <Link
                  to={`/owner/listings/${house._id}/edit`}
                  className="p-2 rounded-lg border border-border hover:bg-surface inline-flex justify-center"
                  aria-label="Edit"
                >
                  <Edit2 className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(house._id)}
                  disabled={deletingId === house._id}
                  className="p-2 rounded-lg border border-error/30 text-error hover:bg-error/5"
                  aria-label="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {filtered.length > PAGE_SIZE && (
        <nav className="flex flex-wrap items-center justify-center gap-2 mt-8" aria-label="Pagination">
          <button
            type="button"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-border disabled:opacity-40"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`min-w-[40px] py-2 rounded-lg border ${
                num === pageSafe ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-lg border border-border disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default OwnerListings;
