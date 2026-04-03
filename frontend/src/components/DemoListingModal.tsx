import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { MapPin, X, MessageCircle } from 'lucide-react';
import type { RootState } from '../store';
import type { HouseCardModel } from './PropertyListingCard';
import type { DemoListingExtra } from '../data/demoListingExtras';
import { CONTACT_OWNER_AUTH_STATE } from '../utils/authRedirectState';

type Props = {
  house: HouseCardModel;
  extra: DemoListingExtra;
  onClose: () => void;
};

const DemoListingModal: React.FC<Props> = ({ house, extra, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const img = house.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa';

  const handleMessageOwner = () => {
    if (!isAuthenticated) {
      toast.success('Create a free account to message owners');
      onClose();
      navigate('/register', { state: CONTACT_OWNER_AUTH_STATE });
      return;
    }
    if (user?.role === 'OWNER') {
      toast.error('Switch to a renter account to message property owners.');
      return;
    }
    if (user?.role !== 'RENTER') {
      toast.error('Sign in as a renter to send messages.');
      return;
    }
    onClose();
    navigate('/inquiries');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-listing-title"
    >
      <div className="bg-white dark:bg-darksurface w-full sm:max-w-lg sm:rounded-2xl shadow-2xl max-h-[92dvh] overflow-y-auto rounded-t-2xl border border-border dark:border-slate-600">
        <div className="relative aspect-[16/10] sm:rounded-t-2xl overflow-hidden shrink-0">
          <img src={img} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brandTeal">Sample listing</p>
          <h2 id="demo-listing-title" className="text-xl font-bold text-brandNavy dark:text-white mt-1">
            {house.title}
          </h2>
          <p className="flex items-center gap-1 text-sm text-textSecondary dark:text-darkmuted mt-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {house.location.city}, {house.location.area}
          </p>
          <p className="text-2xl font-bold text-brandNavy dark:text-white mt-4">
            ETB {house.pricing.pricePerMonth.toLocaleString()}
            <span className="text-sm font-normal text-textSecondary"> /month</span>
          </p>
          <p className="text-sm text-textSecondary dark:text-darkmuted mt-4 leading-relaxed">{extra.description}</p>
          <div className="mt-4">
            <p className="text-xs font-semibold text-brandNavy dark:text-slate-200 mb-2">Highlights</p>
            <ul className="flex flex-wrap gap-2">
              {extra.amenities.map((a) => (
                <li
                  key={a}
                  className="text-xs px-2.5 py-1 rounded-full bg-surface dark:bg-slate-700 text-textPrimary dark:text-slate-200 border border-border dark:border-slate-600"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-textSecondary dark:text-darkmuted mt-4">{extra.ownerLabel}</p>
          <div className="mt-6 flex flex-row gap-2 sm:gap-3">
            <button
              type="button"
              className="btn-primary flex-1 min-w-0 !h-11 sm:!h-12 text-[10px] sm:text-sm px-2 sm:px-4 inline-flex items-center justify-center gap-1 sm:gap-2 text-center"
              onClick={handleMessageOwner}
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Message owner</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 min-w-0 !h-11 sm:!h-12 text-[10px] sm:text-sm px-2 sm:px-4"
            >
              Close
            </button>
          </div>
          <p className="text-[11px] text-textSecondary mt-3 text-center">
            Real listings open full details after owners publish. Use Messages for live chat when connected to the API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoListingModal;
