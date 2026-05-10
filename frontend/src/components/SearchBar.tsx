import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  /** If set, navigates to /search?city= on submit */
  compact?: boolean;
  className?: string;
};

export const SearchBar: React.FC<Props> = ({ compact, className = '' }) => {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Link
          to="/search"
          className="relative flex items-center rounded-full border border-border dark:border-slate-600 bg-white dark:bg-darksurface shadow-md hover:shadow-lg transition-shadow group"
        >
          <Search className="absolute left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-textSecondary group-hover:text-brandTeal pointer-events-none" />
          <span className="block w-full py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-12 sm:pr-14 text-textSecondary dark:text-darkmuted text-xs sm:text-sm md:text-base">
            <span className="hidden sm:inline">Search by location, price, or property type…</span>
            <span className="sm:hidden">Search properties…</span>
          </span>
          <span className="absolute right-2 p-1.5 sm:p-2 rounded-full bg-surface dark:bg-slate-700 group-hover:bg-brandTeal/10">
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brandTeal" />
          </span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={className}
    >
      <Link
        to="/search"
        className="relative flex items-center rounded-full border border-white/50 dark:border-slate-600 bg-white/95 dark:bg-darksurface/95 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all group"
      >
        <Search className="absolute left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-textSecondary group-hover:text-brandTeal pointer-events-none" />
        <span className="block w-full py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-12 sm:pr-14 text-textSecondary dark:text-darkmuted text-xs sm:text-sm md:text-base">
          <span className="hidden sm:inline">Search by location, price, or property type…</span>
          <span className="sm:hidden">Search properties…</span>
        </span>
        <span className="absolute right-2 p-1.5 sm:p-2 rounded-full bg-surface dark:bg-slate-700 group-hover:bg-brandTeal/10">
          <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brandTeal" />
        </span>
      </Link>
    </motion.div>
  );
};

export default SearchBar;
