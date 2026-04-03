import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type Props = {
  /** Where to go if there is no history (e.g. opened in a new tab). */
  fallbackTo?: string;
  className?: string;
};

/**
 * Browser-style back; falls back to `fallbackTo` (default home) when history is empty.
 */
const BackNavButton: React.FC<Props> = ({ fallbackTo = '/', className = '' }) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (typeof window === 'undefined') {
      navigate(fallbackTo);
      return;
    }
    const ref = document.referrer;
    let fromSameSite = false;
    if (ref) {
      try {
        fromSameSite = new URL(ref).origin === window.location.origin;
      } catch {
        fromSameSite = false;
      }
    }
    if (fromSameSite || window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border dark:border-slate-600 bg-white dark:bg-darksurface px-3 py-1.5 text-sm font-medium text-brandNavy dark:text-slate-100 shadow-sm hover:border-brandTeal hover:text-brandTeal transition-colors ${className}`}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      Back
    </button>
  );
};

export default BackNavButton;
