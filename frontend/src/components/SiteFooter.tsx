import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Home,
  Shield,
  MessageSquare,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const SITE_NAME = 'YENE BET';

function SocialFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function SocialTwitter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SocialInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

const TRUST = [
  {
    icon: Shield,
    title: 'Verified listings',
    text: 'Owners and listings reviewed for quality and safety.',
  },
  {
    icon: MessageSquare,
    title: 'Direct messaging',
    text: 'Chat with hosts in real time from your inbox.',
  },
  {
    icon: Building2,
    title: 'Across Ethiopia',
    text: 'From Addis to regional cities—browse by area.',
  },
] as const;

const linkClass =
  'text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors text-sm leading-snug';

const SiteFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [propertyType, setPropertyType] = useState<'all' | 'sale' | 'rent'>('all');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 sm:mt-16 md:mt-24 border-t border-border dark:border-slate-700 bg-[#f0f4f8] dark:bg-slate-950 transition-colors overflow-x-hidden">
      {/* CTA strip */}
      <div className="bg-gradient-to-r from-brandNavy via-brandNavy to-[#0f2744] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-8">
          <div className="max-w-xl min-w-0 text-center md:text-left">
            <p className="inline-flex items-center justify-center md:justify-start gap-2 text-brandTeal/90 text-xs sm:text-sm font-medium">
              <Sparkles className="h-4 w-4 shrink-0" />
              Rent smarter in Ethiopia
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-snug px-1 sm:px-0">
              Ready to find your next home—or list one?
            </h2>
            <p className="mt-2 sm:mt-3 text-white/80 text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
              Search rentals, save favorites, and message owners in one place.
            </p>
          </div>
          <div className="flex flex-col xs:flex-row sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto max-w-md mx-auto md:mx-0 md:max-w-none shrink-0">
            <Link
              to="/listings"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brandTeal px-4 sm:px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brandTealDark transition-colors flex-1 sm:flex-none"
            >
              Browse listings
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-4 sm:px-6 py-3 text-sm font-semibold text-white hover:bg-white/15 transition-colors flex-1 sm:flex-none"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Trust row — no negative overlap on mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-5 sm:mt-0 sm:-mt-4 md:-mt-6 mb-6 sm:mb-10 md:mb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl sm:rounded-2xl bg-white dark:bg-darksurface border border-border dark:border-slate-600 p-3.5 sm:p-5 shadow-sm sm:shadow-md flex gap-3"
            >
              <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-brandTeal/10 flex items-center justify-center shrink-0 text-brandTeal">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-brandNavy dark:text-white text-sm leading-tight">{title}</h3>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-textSecondary dark:text-darkmuted leading-snug">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-6 sm:pb-12 md:pb-14">
        <div className="rounded-xl sm:rounded-3xl bg-white dark:bg-darksurface border border-border dark:border-slate-600 shadow-md sm:shadow-lg overflow-hidden">
          <div className="p-4 sm:p-8 md:p-10 md:flex md:gap-10 md:items-start">
            <div className="flex-1 min-w-0">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brandTeal mb-1 sm:mb-2">
                Newsletter
              </span>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-brandNavy dark:text-white">
                Stay ahead of new rentals
              </h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-textSecondary dark:text-darkmuted leading-relaxed">
                Get curated matches and tips for renting in Ethiopian cities. Unsubscribe anytime.
              </p>
            </div>
            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-4 md:mt-0 flex-1 space-y-3 sm:space-y-5 min-w-0"
            >
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-brandNavy dark:text-slate-200">
                  <input
                    type="radio"
                    name="frequency"
                    checked={frequency === 'weekly'}
                    onChange={() => setFrequency('weekly')}
                    className="text-brandTeal border-border focus:ring-brandTeal"
                  />
                  Weekly
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-brandNavy dark:text-slate-200">
                  <input
                    type="radio"
                    name="frequency"
                    checked={frequency === 'monthly'}
                    onChange={() => setFrequency('monthly')}
                    className="text-brandTeal border-border focus:ring-brandTeal"
                  />
                  Monthly
                </label>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                {(
                  [
                    { id: 'all' as const, label: 'All' },
                    { id: 'sale' as const, label: 'Sale' },
                    { id: 'rent' as const, label: 'Rent' },
                  ] as const
                ).map(({ id, label }) => (
                  <label
                    key={id}
                    className="flex items-center gap-2 cursor-pointer text-brandNavy dark:text-slate-200"
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      checked={propertyType === id}
                      onChange={() => setPropertyType(id)}
                      className="text-brandTeal border-border focus:ring-brandTeal"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex flex-col xs:flex-row sm:flex-row gap-2 sm:gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field flex-1 min-w-0 rounded-xl border-border dark:border-slate-600 bg-surface dark:bg-slate-800/50 w-full text-sm"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="btn-teal px-5 sm:px-8 rounded-xl uppercase text-xs sm:text-sm font-bold tracking-wide shrink-0 justify-center w-full sm:w-auto py-2.5"
                >
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <p className="text-sm text-success font-medium" role="status">
                  Thanks — you&apos;re on the list.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-brandNavy/10 dark:border-slate-700" />

      {/* Links & contact — compact 2-col on mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12">
          {/* Brand + contact */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-brandNavy flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Home className="h-4 w-4 sm:h-6 sm:w-6" />
              </span>
              <span className="text-base sm:text-xl font-bold tracking-tight text-brandNavy dark:text-white uppercase">
                {SITE_NAME}
              </span>
            </Link>
            <p className="mt-2 sm:mt-4 max-w-sm text-brandNavy/85 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              Ethiopia&apos;s rental marketplace—browse verified homes, message owners, and manage your
              search in one place.
            </p>
            <ul className="mt-3 sm:mt-6 flex flex-col sm:flex-col gap-1.5 sm:gap-3 text-xs sm:text-sm text-brandNavy dark:text-slate-200">
              <li className="flex items-center gap-2 min-w-0">
                <MapPin className="h-4 w-4 shrink-0 text-brandTeal" />
                <span className="truncate">Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2 min-w-0">
                <Phone className="h-4 w-4 shrink-0 text-brandTeal" />
                <a href="tel:+251911000000" className="hover:text-brandTeal transition-colors truncate">
                  +251 911 000 000
                </a>
              </li>
              <li className="flex items-center gap-2 min-w-0">
                <Mail className="h-4 w-4 shrink-0 text-brandTeal" />
                <a
                  href="mailto:support@houserental.example"
                  className="hover:text-brandTeal transition-colors truncate"
                >
                  support@houserental.example
                </a>
              </li>
            </ul>
          </div>

          {/* Nav columns: 2×2 on phone, wider on desktop */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 sm:gap-6">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-brandNavy dark:text-white uppercase tracking-wide mb-2 sm:mb-3">
                Explore
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li>
                  <Link to="/listings" className={linkClass}>
                    All listings
                  </Link>
                </li>
                <li>
                  <Link to="/search?city=Addis%20Ababa" className={linkClass}>
                    Addis Ababa
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className={linkClass}>
                    Saved homes
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-brandNavy dark:text-white uppercase tracking-wide mb-2 sm:mb-3">
                Company
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li>
                  <a href="/#how-it-works" className={linkClass}>
                    How it works
                  </a>
                </li>
                <li>
                  <a href="/#how-it-works" className={linkClass}>
                    About us
                  </a>
                </li>
                <li>
                  <a href="/#faq" className={linkClass}>
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="mailto:support@houserental.example" className={linkClass}>
                    Contact support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-brandNavy dark:text-white uppercase tracking-wide mb-2 sm:mb-3">
                For owners
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li>
                  <Link to="/register" className={linkClass}>
                    List a property
                  </Link>
                </li>
                <li>
                  <Link to="/owner" className={linkClass}>
                    Owner dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-brandNavy dark:text-white uppercase tracking-wide mb-2 sm:mb-3">
                Legal
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li>
                  <a href="#privacy" className={linkClass}>
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className={linkClass}>
                    Terms of service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-border dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          <p className="text-center sm:text-left text-xs sm:text-sm text-textSecondary dark:text-slate-400 order-2 sm:order-1 leading-relaxed">
            © {year} {SITE_NAME}. All rights reserved.
            <span className="hidden sm:inline"> · ETB pricing · Serving renters & owners nationwide</span>
          </p>
          <div className="flex justify-center sm:justify-end gap-2.5 sm:gap-5 order-1 sm:order-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white dark:bg-slate-800 border border-border dark:border-slate-600 flex items-center justify-center text-textSecondary hover:text-brandTeal hover:border-brandTeal/40 transition-colors"
              aria-label="Facebook"
            >
              <SocialFacebook className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white dark:bg-slate-800 border border-border dark:border-slate-600 flex items-center justify-center text-textSecondary hover:text-brandTeal hover:border-brandTeal/40 transition-colors"
              aria-label="Twitter"
            >
              <SocialTwitter className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white dark:bg-slate-800 border border-border dark:border-slate-600 flex items-center justify-center text-textSecondary hover:text-brandTeal hover:border-brandTeal/40 transition-colors"
              aria-label="Instagram"
            >
              <SocialInstagram className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
