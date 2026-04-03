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
    <footer className="mt-16 md:mt-24 border-t border-border dark:border-slate-700 bg-[#f0f4f8] dark:bg-slate-950 transition-colors">
      {/* CTA strip */}
      <div className="bg-gradient-to-r from-brandNavy via-brandNavy to-[#0f2744] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-brandTeal/90 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Rent smarter in Ethiopia
            </p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
              Ready to find your next home—or list one?
            </h2>
            <p className="mt-3 text-white/80 text-sm md:text-base leading-relaxed">
              Search thousands of rentals, save favorites, and message owners in one place.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/listings"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brandTeal px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-brandTealDark transition-colors"
            >
              Browse listings
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Trust row */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-10 md:mb-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl bg-white dark:bg-darksurface border border-border dark:border-slate-600 p-5 shadow-md flex gap-4"
            >
              <div className="h-12 w-12 rounded-xl bg-brandTeal/10 flex items-center justify-center shrink-0 text-brandTeal">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3 className="font-bold text-brandNavy dark:text-white text-sm">{title}</h3>
                <p className="mt-1 text-sm text-textSecondary dark:text-darkmuted leading-snug">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-12 md:pb-14">
        <div className="rounded-3xl bg-white dark:bg-darksurface border border-border dark:border-slate-600 shadow-lg overflow-hidden">
          <div className="p-8 md:p-10 md:flex md:gap-10 md:items-start">
            <div className="flex-1">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brandTeal mb-2">
                Newsletter
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-brandNavy dark:text-white">
                Stay ahead of new rentals
              </h2>
              <p className="mt-2 text-sm text-textSecondary dark:text-darkmuted leading-relaxed">
                Get curated matches and tips for renting in Ethiopian cities. Unsubscribe anytime.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="mt-8 md:mt-0 flex-1 space-y-5 min-w-0">
              <div className="flex flex-wrap gap-6 text-sm">
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
              <div className="flex flex-wrap gap-4 text-sm">
                {(
                  [
                    { id: 'all' as const, label: 'All' },
                    { id: 'sale' as const, label: 'Sale' },
                    { id: 'rent' as const, label: 'Rent' },
                  ] as const
                ).map(({ id, label }) => (
                  <label key={id} className="flex items-center gap-2 cursor-pointer text-brandNavy dark:text-slate-200">
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
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field flex-1 rounded-xl border-border dark:border-slate-600 bg-surface dark:bg-slate-800/50"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="btn-teal px-8 rounded-xl uppercase text-sm font-bold tracking-wide shrink-0 justify-center"
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

      {/* Links & contact */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <span className="w-12 h-12 rounded-full bg-brandNavy flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Home className="h-6 w-6" />
              </span>
              <span className="text-xl font-bold tracking-tight text-brandNavy dark:text-white uppercase">
                {SITE_NAME}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-brandNavy/85 dark:text-slate-300 text-sm leading-relaxed">
              Ethiopia&apos;s rental marketplace—browse verified homes, message owners, and manage your search in one
              place.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-brandNavy dark:text-slate-200">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-brandTeal" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 shrink-0 mt-0.5 text-brandTeal" />
                <a href="tel:+251911000000" className="hover:text-brandTeal transition-colors">
                  +251 911 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 shrink-0 mt-0.5 text-brandTeal" />
                <a href="mailto:support@houserental.example" className="hover:text-brandTeal transition-colors">
                  support@houserental.example
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-brandNavy dark:text-white uppercase tracking-wide mb-4">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/listings" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  All listings
                </Link>
              </li>
              <li>
                <Link to="/search?city=Addis%20Ababa" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  Addis Ababa
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  Saved homes
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-brandNavy dark:text-white uppercase tracking-wide mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#about" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  About us
                </a>
              </li>
              <li>
                <a href="/#blog" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@houserental.example"
                  className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors"
                >
                  Contact support
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-brandNavy dark:text-white uppercase tracking-wide mb-4">For owners</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/register" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  List a property
                </Link>
              </li>
              <li>
                <Link to="/owner" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  Owner dashboard
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  Find an agent
                </Link>
              </li>
            </ul>
            <h3 className="text-sm font-bold text-brandNavy dark:text-white uppercase tracking-wide mb-4 mt-8">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#privacy" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-textSecondary dark:text-slate-400 hover:text-brandTeal transition-colors">
                  Terms of service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border dark:border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-center md:text-left text-sm text-textSecondary dark:text-slate-400 order-2 md:order-1">
            © {year} {SITE_NAME}. All rights reserved. · ETB pricing · Serving renters & owners nationwide
          </p>
          <div className="flex justify-center md:justify-end gap-5 order-1 md:order-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-border dark:border-slate-600 flex items-center justify-center text-textSecondary hover:text-brandTeal hover:border-brandTeal/40 transition-colors"
              aria-label="Facebook"
            >
              <SocialFacebook className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-border dark:border-slate-600 flex items-center justify-center text-textSecondary hover:text-brandTeal hover:border-brandTeal/40 transition-colors"
              aria-label="Twitter"
            >
              <SocialTwitter className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-border dark:border-slate-600 flex items-center justify-center text-textSecondary hover:text-brandTeal hover:border-brandTeal/40 transition-colors"
              aria-label="Instagram"
            >
              <SocialInstagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
