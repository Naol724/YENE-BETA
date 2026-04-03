import React from 'react';
import { Loader2 } from 'lucide-react';

type Props = {
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClass = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-14 w-14' };

export const Loader: React.FC<Props> = ({ label = 'Loading…', className = '', size = 'md' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`} role="status" aria-live="polite">
    <Loader2 className={`${sizeClass[size]} animate-spin text-brandTeal`} aria-hidden />
    {label ? <span className="text-sm text-textSecondary dark:text-darkmuted">{label}</span> : null}
  </div>
);

export default Loader;
