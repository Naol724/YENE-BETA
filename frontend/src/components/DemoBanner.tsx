import React from 'react';
import { Info } from 'lucide-react';

type Props = {
  children?: React.ReactNode;
};

/** Shown when filling the UI with demonstration listings or messages. */
export const DemoBanner: React.FC<Props> = ({ children }) => (
  <div
    role="status"
    className="rounded-xl border border-brandTeal/40 bg-brandTeal/10 dark:bg-brandTeal/15 px-4 py-3 text-sm text-brandNavy dark:text-slate-100 flex gap-3 items-start"
  >
    <Info className="h-5 w-5 text-brandTeal shrink-0 mt-0.5" aria-hidden />
    <div>
      <p className="font-semibold text-brandNavy dark:text-white">Demonstration content</p>
      <p className="text-textSecondary dark:text-darkmuted mt-1">
        {children ??
          'This is sample data so you can explore the UI. Real listings and messages appear when your database and API have data.'}
      </p>
    </div>
  </div>
);

export default DemoBanner;
