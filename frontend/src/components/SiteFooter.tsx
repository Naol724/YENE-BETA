import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Home } from 'lucide-react';

const SITE_NAME = 'HouseRental';

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
    <footer className="bg-[#f4f7f9] border-t border-border mt-16 md:mt-24">
      {/* Newsletter */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-12 md:pt-14 pb-10 relative">
        <span className="absolute top-12 right-4 md:right-8 text-xs font-semibold text-brandTeal border border-brandTeal/50 rounded-full px-2.5 py-0.5 bg-white">
          FREE
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-brandNavy pr-16">Subscribe to our newsletter</h2>
        <p className="mt-2 text-sm text-textSecondary leading-relaxed">
          Get email updates about our latest properties and special offers.
        </p>

        <form onSubmit={handleNewsletterSubmit} className="mt-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-brandNavy uppercase tracking-wide mb-2">Frequency</p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-brandNavy">
                <input
                  type="radio"
                  name="frequency"
                  checked={frequency === 'weekly'}
                  onChange={() => setFrequency('weekly')}
                  className="text-brandTeal border-border focus:ring-brandTeal"
                />
                Weekly
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-brandNavy">
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
          </div>
          <div>
            <p className="text-xs font-semibold text-brandNavy uppercase tracking-wide mb-2">Property type</p>
            <div className="flex flex-wrap gap-6">
              {(
                [
                  { id: 'all' as const, label: 'All' },
                  { id: 'sale' as const, label: 'Sale' },
                  { id: 'rent' as const, label: 'Rent' },
                ] as const
              ).map(({ id, label }) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer text-sm text-brandNavy">
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
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field flex-1 rounded-xl border-border bg-white"
              autoComplete="email"
            />
            <button type="submit" className="btn-teal px-8 rounded-xl uppercase text-sm font-bold tracking-wide shrink-0 justify-center">
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

      <div className="border-t border-brandNavy/10" />

      {/* Brand, quick links, legal */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <span className="w-12 h-12 rounded-full bg-brandNavy flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Home className="h-6 w-6" />
              </span>
              <span className="text-xl font-bold tracking-tight text-brandNavy uppercase">{SITE_NAME}</span>
            </Link>
            <p className="mt-4 max-w-md text-brandNavy/85 text-sm leading-relaxed">
              Kenya&apos;s premier platform for finding long-term rentals—browse verified listings and connect with
              property owners in one place.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-brandNavy">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 shrink-0 mt-0.5" />
                <a href="tel:+254700000000" className="hover:text-brandTeal transition-colors">
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 shrink-0 mt-0.5" />
                <a href="mailto:support@houserental.example" className="hover:text-brandTeal transition-colors">
                  support@houserental.example
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-base font-bold text-brandNavy mb-4">Quick links</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="space-y-2">
                <Link to="/" className="block text-textSecondary hover:text-brandTeal transition-colors">
                  About us
                </Link>
                <a href="mailto:support@houserental.example" className="block text-textSecondary hover:text-brandTeal transition-colors">
                  Contact
                </a>
                <span className="block text-textSecondary/60 cursor-not-allowed">Blogs</span>
                <span className="block text-textSecondary/60 cursor-not-allowed">FAQs</span>
              </div>
              <div className="space-y-2">
                <Link to="/search" className="block text-textSecondary hover:text-brandTeal transition-colors">
                  For sale
                </Link>
                <Link to="/search" className="block text-textSecondary hover:text-brandTeal transition-colors">
                  For rent
                </Link>
                <Link to="/search" className="block text-textSecondary hover:text-brandTeal transition-colors">
                  Find an agent
                </Link>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-base font-bold text-brandNavy mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacy" className="text-textSecondary hover:text-brandTeal transition-colors">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-textSecondary hover:text-brandTeal transition-colors">
                  Terms of service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/80">
          <p className="text-center text-sm text-textSecondary">
            Copyright © {year} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-textSecondary hover:text-brandTeal transition-colors"
              aria-label="Facebook"
            >
              <SocialFacebook className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-textSecondary hover:text-brandTeal transition-colors"
              aria-label="Twitter"
            >
              <SocialTwitter className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-textSecondary hover:text-brandTeal transition-colors"
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
