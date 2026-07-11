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
import toast from 'react-hot-toast';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { MediaImage } from '../components/MediaImage';
import api from '../utils/api';
import { addRecentlyViewed } from '../utils/recentlyViewed';
import BackNavButton from '../components/BackNavButton';
import { CONTACT_OWNER_AUTH_STATE } from '../utils/authRedirectState';
import { getDemoHouseById, isDemoListingId } from '../data/getDemoHouse';

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
  const isDemo = Boolean(house?.isDemo) || (id ? isDemoListingId(id) : false);

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setCurrentImage(0);

    if (isDemoListingId(id)) {
      const demo = getDemoHouseById(id);
      setHouse(demo);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/houses/${id}`);
      setHouse(res.data.data);
    } catch (err) {
      console.error(err);
      setHouse(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    if (!house?._id || !house?.title) return;
    addRecentlyViewed({
      id: String(house._id),
      title: house.title,
      image: resolveMediaUrl(house.images?.[0]?.url),
    });
  }, [house?._id, house?.title, house?.images]);

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
    if (isDemo) {
      toast('Demonstration listing — save works on real properties.', { icon: 'ℹ️' });
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${houseId}`);
        setIsFavorite(false);
        toast.success('Removed from saved');
      } else {
        await api.post(`/favorites/${houseId}`);
        setIsFavorite(true);
        toast.success('Saved to favorites');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        toast.error(String(err.response.data.message));
      } else {
        toast.error('Could not update saved list');
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const openContact = () => {
    if (!isAuthenticated) {
      toast.success('Create a free account to message owners');
      navigate('/register', { state: CONTACT_OWNER_AUTH_STATE });
      return;
    }
    if (isOwnerRole) {
      toast.error('Switch to a renter account to message property owners.');
      return;
    }
    if (!isRenter) {
      toast.error('Sign in as a renter to send messages.');
      return;
    }
    if (isOwnListing) return;
    if (isDemo) {
      toast('Demonstration listing — messaging works on real properties.', { icon: 'ℹ️' });
      navigate('/inquiries');
      return;
    }
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
      toast.success('Message sent to the owner');
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
    <div className="pb-24 md:pb-4 pt-2 sm:pt-4 px-0 max-w-6xl mx-auto animate-fade-in relative">
      <div className="px-4 mb-3 sm:mb-4">
        <BackNavButton fallbackTo="/listings" />
      </div>

      {isDemo && (
        <div className="mx-4 md:mx-0 mb-4 rounded-xl border border-brandTeal/30 bg-brandTeal/10 px-4 py-3 text-sm text-brandNavy dark:text-slate-100">
          <p className="font-semibold">Demonstration listing</p>
          <p className="mt-0.5 text-textSecondary dark:text-slate-300 text-xs sm:text-sm">
            Sample data for browsing. Real listings open the same full details page after owners publish.
          </p>
        </div>
      )}

      {inquiryOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-title"
        >
          <div className="bg-white dark:bg-darksurface rounded-t-2xl md:rounded-2xl w-full max-w-lg shadow-xl max-h-[85dvh] overflow-y-auto border border-border dark:border-slate-600">
            <div className="flex items-center justify-between border-b border-border dark:border-slate-600 px-4 py-3 sticky top-0 bg-white dark:bg-darksurface z-10">
              <h2 id="inquiry-title" className="text-lg font-bold text-textPrimary dark:text-white">
                Message the host
              </h2>
              <button
                type="button"
                onClick={() => setInquiryOpen(false)}
                className="p-2 rounded-full hover:bg-surface dark:hover:bg-slate-700 text-textSecondary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              {inquirySuccess ? (
                <div className="space-y-4 text-center">
                  <p className="text-textPrimary dark:text-slate-100">Your message was sent.</p>
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
                  <p className="text-sm text-textSecondary dark:text-slate-300">
                    Introduce yourself and ask about availability or details (10–500 characters).
                  </p>
                  {inquiryError && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-error/30 text-error text-sm px-4 py-3">
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

      <div className="px-4 md:px-0 mb-4">
        <div className="mb-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 text-brandNavy dark:text-white">
            {house.title}
          </h1>
          <p className="text-textSecondary dark:text-slate-300 flex items-center gap-1 text-sm font-medium">
            <MapPin className="h-4 w-4 shrink-0" />
            {[house.location.address, house.location.area, house.location.city]
              .filter(Boolean)
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .join(', ')}
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-medium text-brandNavy dark:text-slate-100 hover:text-primary transition underline underline-offset-4"
          >
            <Share2 className="h-4 w-4" /> {shareCopied ? 'Link copied' : 'Share'}
          </button>
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favoriteLoading || (!!isAuthenticated && !canUseRenterActions && !isDemo)}
            title={favoriteHint || undefined}
            className={`flex items-center gap-1.5 text-sm font-medium hover:text-secondary transition underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed ${heartClass}`}
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

      <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] md:rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 isolate">
        <MediaImage
          src={house.images?.[currentImage]?.url}
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
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/80 hover:bg-white backdrop-blur rounded-full flex items-center justify-center shadow-md z-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentImage((prev) => (prev === house.images.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/80 hover:bg-white backdrop-blur rounded-full flex items-center justify-center shadow-md z-10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 backdrop-blur-md px-3 py-1 rounded-full bg-black/20 z-10">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 px-4 md:px-0 pb-4 md:pb-12">
        <div className="md:col-span-2 space-y-6 min-w-0">
          <div className="flex justify-between items-center border-b border-border dark:border-slate-600 pb-6 gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold mb-2 text-brandNavy dark:text-white truncate">
                Hosted by {house.owner?.fullName || 'Host'}
              </h2>
              <p className="text-textSecondary dark:text-slate-300 flex items-center gap-4 text-sm">
                <span>Property Owner</span>
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-sm shrink-0">
              {house.owner?.fullName?.charAt(0) || 'H'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-4 border border-border dark:border-slate-600 rounded-xl flex items-center gap-3">
              <Home className="h-6 w-6 text-primary shrink-0" />
              <div className="text-sm min-w-0">
                <p className="font-semibold text-textPrimary dark:text-slate-100 truncate">
                  {house.propertyType}
                </p>
                <p className="text-textSecondary">Type</p>
              </div>
            </div>
            <div className="p-4 border border-border dark:border-slate-600 rounded-xl flex items-center gap-3">
              <Bed className="h-6 w-6 text-primary shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-textPrimary dark:text-slate-100">{house.bedrooms}</p>
                <p className="text-textSecondary">Bedrooms</p>
              </div>
            </div>
            <div className="p-4 border border-border dark:border-slate-600 rounded-xl flex items-center gap-3">
              <Bath className="h-6 w-6 text-primary shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-textPrimary dark:text-slate-100">{house.bathrooms}</p>
                <p className="text-textSecondary">Bathrooms</p>
              </div>
            </div>
            {house.squareFootage && (
              <div className="p-4 border border-border dark:border-slate-600 rounded-xl flex items-center gap-3">
                <Layout className="h-6 w-6 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-textPrimary dark:text-slate-100">{house.squareFootage}</p>
                  <p className="text-textSecondary">m²</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border dark:border-slate-600 pt-6">
            <h3 className="text-lg font-bold mb-4 text-brandNavy dark:text-white">About this property</h3>
            <p className="text-textSecondary dark:text-slate-300 text-base leading-relaxed">
              {house.description}
            </p>
          </div>

          <div className="border-t border-border dark:border-slate-600 pt-6 pb-6">
            <h3 className="text-lg font-bold mb-4 text-brandNavy dark:text-white">What this place offers</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-3">
              {house.amenities?.map((amenity: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-textPrimary dark:text-slate-100 font-medium text-sm min-w-0"
                >
                  <div className="h-2 w-2 rounded-full bg-primary/50 shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
              {(!house.amenities || house.amenities.length === 0) && (
                <p className="text-textSecondary col-span-2">No special amenities listed.</p>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-28 bg-white dark:bg-darksurface border border-border dark:border-slate-600 rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col gap-4">
            <div className="flex items-end gap-2 text-2xl font-bold text-brandNavy dark:text-white">
              ETB {house.pricing.pricePerMonth.toLocaleString()}{' '}
              <span className="text-base text-textSecondary font-normal pb-1">/ month</span>
            </div>
            {house.pricing.securityDeposit && (
              <div className="text-textSecondary text-sm mb-2">
                + ETB {house.pricing.securityDeposit.toLocaleString()} security deposit
              </div>
            )}

            {contactHint && isAuthenticated && (
              <p className="text-sm text-textSecondary">{contactHint}</p>
            )}

            <div className="mt-2 space-y-3">
              <button
                type="button"
                onClick={openContact}
                disabled={!!(isAuthenticated && !canUseRenterActions && !isDemo)}
                title={contactHint || undefined}
                className="btn-primary w-full h-12 text-lg shadow-md hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="h-5 w-5 mr-2" /> Contact Host
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favoriteLoading || (!!isAuthenticated && !canUseRenterActions && !isDemo)}
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

      {/* Mobile action bar — fixed so it never sits between gallery and content */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-darksurface border-t border-border dark:border-slate-700 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] safe-pb">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-brandNavy dark:text-white text-base truncate">
            ETB {house.pricing.pricePerMonth.toLocaleString()}
            <span className="text-xs font-normal text-textSecondary"> /mo</span>
          </p>
        </div>
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={favoriteLoading || (!!isAuthenticated && !canUseRenterActions && !isDemo)}
          className={`p-2.5 rounded-full border border-border dark:border-slate-600 disabled:opacity-50 shrink-0 ${heartClass}`}
          aria-label={isFavorite ? 'Remove from saved' : 'Save'}
        >
          {favoriteLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className={`h-5 w-5 ${heartFilled ? 'fill-current' : ''}`} />
          )}
        </button>
        <button
          type="button"
          onClick={openContact}
          disabled={!!(isAuthenticated && !canUseRenterActions && !isDemo)}
          className="btn-primary !w-auto px-4 !h-11 text-sm shrink-0"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" /> Contact
        </button>
      </div>
    </div>
  );
};

export default PropertyDetails;
