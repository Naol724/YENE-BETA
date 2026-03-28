import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import axios from 'axios';
import {
  MapPin,
  Heart,
  Share2,
  Bed,
  Bath,
  Layout,
  Home,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import api from '../utils/api';

function ownerIdString(owner: unknown): string {
  if (!owner) return '';
  if (typeof owner === 'string') return owner;
  if (typeof owner === 'object' && owner !== null && '_id' in owner) {
    return String((owner as { _id: string })._id);
  }
  return '';
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [house, setHouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const [shareCopied, setShareCopied] = useState(false);

  const houseId = house?._id ? String(house._id) : '';
  const ownerId = house ? ownerIdString(house.owner) : '';
  const isOwnListing =
    isAuthenticated && user && ownerId && String(user.id) === ownerId;
  const isRenter = user?.role === 'RENTER';
  const isOwnerRole = user?.role === 'OWNER';

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/houses/${id}`);
      setHouse(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    if (!houseId || !isAuthenticated || !isRenter) {
      setIsFavorite(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/favorites');
        const list = res.data.data as Array<{ house?: { _id: string } | string }>;
        const ids = (list || []).map((f) => {
          const h = f.house;
          if (!h) return '';
          if (typeof h === 'string') return h;
          return String(h._id);
        });
        if (!cancelled) setIsFavorite(ids.includes(houseId));
      } catch {
        if (!cancelled) setIsFavorite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [houseId, isAuthenticated, isRenter]);

  const goLogin = () => {
    navigate('/login', { state: { from: { pathname: `/house/${id}` } } });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      setShareCopied(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated || !houseId) {
      goLogin();
      return;
    }
    if (!isRenter) return;
    if (isOwnListing) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${houseId}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${houseId}`);
        setIsFavorite(true);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        alert(String(err.response.data.message));
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const openContact = () => {
    if (!isAuthenticated) {
      goLogin();
      return;
    }
    if (!isRenter) return;
    if (isOwnListing) return;
    setInquiryError(null);
    setInquirySuccess(false);
    setInquiryMessage('');
    setInquiryOpen(true);
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);
    const trimmed = inquiryMessage.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      setInquiryError('Message must be between 10 and 500 characters.');
      return;
    }
    setInquirySubmitting(true);
    try {
      await api.post('/inquiries', { property: houseId, message: trimmed });
      setInquirySuccess(true);
      setInquiryMessage('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setInquiryError(String(err.response.data.message));
      } else {
        setInquiryError('Could not send message. Try again.');
      }
    } finally {
      setInquirySubmitting(false);
    }
  };

  const saveDisabledReason = (): string | null => {
    if (!isAuthenticated) return null;
    if (isOwnerRole) return 'Saving is available for renter accounts.';
    if (isOwnListing) return 'This is your listing.';
    return null;
  };

  const contactDisabledReason = (): string | null => {
    if (!isAuthenticated) return null;
    if (isOwnerRole) return 'Messaging owners is available for renter accounts.';
    if (isOwnListing) return 'You cannot message yourself about your own listing.';
    return null;
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading property details...</div>;
  if (!house) return <div className="p-8 text-center">Property not found</div>;

  const canUseRenterActions = isAuthenticated && isRenter && !isOwnListing;
  const favoriteHint = saveDisabledReason();
  const contactHint = contactDisabledReason();

  const heartFilled = isFavorite;
  const heartClass = heartFilled ? 'text-secondary fill-secondary' : 'text-textPrimary';

  return (
    <div className="pb-24 pt-4 px-0 md:px-8 max-w-6xl mx-auto md:pb-12 animate-fade-in relative">
      {inquiryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-title"
        >
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 id="inquiry-title" className="text-lg font-bold text-textPrimary">
                Message the host
              </h2>
              <button
                type="button"
                onClick={() => setInquiryOpen(false)}
                className="p-2 rounded-full hover:bg-surface text-textSecondary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              {inquirySuccess ? (
                <div className="space-y-4 text-center">
                  <p className="text-textPrimary">Your message was sent.</p>
                  <Link to="/inquiries" className="btn-primary inline-block text-center">
                    View messages
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryOpen(false);
                      setInquirySuccess(false);
                    }}
                    className="btn-secondary w-full"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={submitInquiry} className="space-y-4">
                  <p className="text-sm text-textSecondary">
                    Introduce yourself and ask about availability or details (10–500 characters).
                  </p>
                  {inquiryError && (
                    <div className="rounded-lg bg-red-50 border border-error/30 text-error text-sm px-4 py-3">
                      {inquiryError}
                    </div>
                  )}
                  <textarea
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="input-field min-h-[120px] resize-y"
                    placeholder="Hi, I'm interested in this property…"
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-textSecondary">{inquiryMessage.trim().length}/500</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInquiryOpen(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={inquirySubmitting} className="btn-primary flex-1 gap-2">
                      {inquirySubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 md:px-0 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{house.title}</h1>
          <p className="text-textSecondary flex items-center gap-1 font-medium">
            <MapPin className="h-4 w-4" /> {house.location.address}, {house.location.area},{' '}
            {house.location.city}
          </p>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 font-medium hover:text-primary transition underline underline-offset-4"
          >
            <Share2 className="h-4 w-4" /> {shareCopied ? 'Link copied' : 'Share'}
          </button>
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favoriteLoading || (!!isAuthenticated && !canUseRenterActions)}
            title={favoriteHint || undefined}
            className={`flex items-center gap-2 font-medium hover:text-secondary transition underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed ${heartClass}`}
          >
            {favoriteLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${heartFilled ? 'fill-current' : ''}`} />
            )}
            {isFavorite ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {favoriteHint && isAuthenticated && (
        <p className="px-4 md:px-0 text-sm text-textSecondary mb-2">{favoriteHint}</p>
      )}

      <div className="relative w-full h-[300px] md:h-[500px] md:rounded-2xl overflow-hidden bg-gray-100 group">
        <img
          src={house.images?.[currentImage]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
          alt={house.title}
          className="w-full h-full object-cover"
        />
        {house.images && house.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setCurrentImage((prev) => (prev === 0 ? house.images.length - 1 : prev - 1))
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/50 hover:bg-white backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentImage((prev) => (prev === house.images.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/50 hover:bg-white backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 backdrop-blur-md px-3 py-1 rounded-full bg-black/20">
              {house.images.map((_: any, i: number) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 px-4 md:px-0">
        <div className="md:col-span-2 space-y-8">
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Hosted by {house.owner?.fullName || 'Host'}</h2>
              <p className="text-textSecondary flex items-center gap-4 text-sm">
                <span>Property Owner</span>
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-sm">
              {house.owner?.fullName?.charAt(0) || 'H'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="p-4 border border-border rounded-xl flex items-center gap-3">
              <Home className="h-6 w-6 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-textPrimary">{house.propertyType}</p>
                <p className="text-textSecondary">Type</p>
              </div>
            </div>
            <div className="p-4 border border-border rounded-xl flex items-center gap-3">
              <Bed className="h-6 w-6 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-textPrimary">{house.bedrooms}</p>
                <p className="text-textSecondary">Bedrooms</p>
              </div>
            </div>
            <div className="p-4 border border-border rounded-xl flex items-center gap-3">
              <Bath className="h-6 w-6 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-textPrimary">{house.bathrooms}</p>
                <p className="text-textSecondary">Bathrooms</p>
              </div>
            </div>
            {house.squareFootage && (
              <div className="p-4 border border-border rounded-xl flex items-center gap-3">
                <Layout className="h-6 w-6 text-primary" />
                <div className="text-sm">
                  <p className="font-semibold text-textPrimary">{house.squareFootage}</p>
                  <p className="text-textSecondary">Sq Ft</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-bold mb-4">About this property</h3>
            <p className="text-textSecondary text-base leading-relaxed">{house.description}</p>
          </div>

          <div className="border-t border-border pt-6 pb-6">
            <h3 className="text-lg font-bold mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-y-4">
              {house.amenities?.map((amenity: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-textPrimary font-medium">
                  <div className="h-2 w-2 rounded-full bg-primary/50" />
                  {amenity}
                </div>
              ))}
              {(!house.amenities || house.amenities.length === 0) && (
                <p className="text-textSecondary col-span-2">No special amenities listed.</p>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-24 bg-white border border-border rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col gap-4">
            <div className="flex items-end gap-2 text-2xl font-bold">
              KES {house.pricing.pricePerMonth.toLocaleString()}{' '}
              <span className="text-base text-textSecondary font-normal pb-1">/ month</span>
            </div>
            {house.pricing.securityDeposit && (
              <div className="text-textSecondary text-sm mb-2">
                + KES {house.pricing.securityDeposit.toLocaleString()} security deposit
              </div>
            )}

            {contactHint && isAuthenticated && (
              <p className="text-sm text-textSecondary">{contactHint}</p>
            )}

            <div className="mt-2 space-y-3">
              <button
                type="button"
                onClick={openContact}
                disabled={!!(isAuthenticated && !canUseRenterActions)}
                title={contactHint || undefined}
                className="btn-primary w-full h-12 text-lg shadow-md hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="h-5 w-5 mr-2" /> Contact Host
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favoriteLoading || (!!isAuthenticated && !canUseRenterActions)}
                title={favoriteHint || undefined}
                className="w-full h-12 font-medium border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {favoriteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isFavorite ? 'Remove from saved' : 'Save for Later'}
              </button>
            </div>

            <div className="text-center text-sm text-textSecondary mt-2">You won&apos;t be charged yet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
