import React from 'react';

export const PropertyCardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-xl overflow-hidden border border-border dark:border-slate-700 bg-white dark:bg-darksurface max-w-3xl mx-auto w-full">
    <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-700" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
      <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
      <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded w-1/3" />
    </div>
  </div>
);

export default PropertyCardSkeleton;
