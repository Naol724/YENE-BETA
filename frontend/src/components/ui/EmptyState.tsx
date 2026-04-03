import React from 'react';
import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-border dark:border-slate-600 bg-surface/50 dark:bg-darksurface/50">
    <div className="rounded-full bg-brandNavy/5 dark:bg-white/5 p-4 mb-4">
      <Icon className="h-10 w-10 text-brandTeal opacity-80" aria-hidden />
    </div>
    <h3 className="text-lg font-semibold text-brandNavy dark:text-white">{title}</h3>
    {description ? (
      <p className="mt-2 text-sm text-textSecondary dark:text-darkmuted max-w-md">{description}</p>
    ) : null}
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export default EmptyState;
