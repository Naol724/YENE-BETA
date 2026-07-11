import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  compact?: boolean;
  className?: string;
  /** Prefill (e.g. current city) */
  defaultValue?: string;
};

/** Hero / home search — navigates to listings filtered by city (or free-text location). */
export const SearchBar: React.FC<Props> = ({ compact, className = '', defaultValue = '' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(defaultValue);

  const goSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const city = query.trim();
    if (city) {
      navigate(`/listings?city=${encodeURIComponent(city)}`);
    } else {
      navigate('/listings');
    }
  };

  const shell = compact
    ? 'relative flex items-center rounded-full border border-border dark:border-slate-600 bg-white dark:bg-darksurface shadow-md focus-within:shadow-lg focus-within:border-brandTeal/50 transition-shadow'
    : 'relative flex items-center rounded-full border border-white/50 dark:border-slate-600 bg-white/95 dark:bg-darksurface/95 backdrop-blur-sm shadow-xl focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-brandTeal/40 transition-all';

  return (
    <motion.div
      initial={{ opacity: 0, y: compact ? 8 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: compact ? 0.35 : 0.45 }}
      className={className}
    >
      <form onSubmit={goSearch} className={shell} role="search">
        <Search className="absolute left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-textSecondary dark:text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city or area…"
          className="block w-full bg-transparent py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-20 sm:pr-24 text-brandNavy dark:text-slate-100 placeholder:text-textSecondary dark:placeholder:text-slate-400 text-xs sm:text-sm md:text-base outline-none rounded-full"
          aria-label="Search houses by city"
          autoComplete="address-level2"
        />
        <div className="absolute right-1.5 sm:right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="p-1.5 sm:p-2 rounded-full bg-surface dark:bg-slate-700 hover:bg-brandTeal/10 text-brandTeal"
            aria-label="Open filters"
            title="All listings & filters"
          >
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            type="submit"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-brandTeal text-white text-xs font-semibold px-3 py-2 hover:bg-brandTealDark transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default SearchBar;
