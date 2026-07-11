import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Heart,
  MessageSquare,
  Home,
  Camera,
  LayoutDashboard,
  Shield,
  Users,
  CheckCircle2,
} from 'lucide-react';

type ActorId = 'guest' | 'renter' | 'owner' | 'admin';

type ActorGuide = {
  id: ActorId;
  label: string;
  title: string;
  summary: string;
  steps: { icon: React.ElementType; title: string; text: string }[];
  cta?: { to: string; label: string };
};

const ACTORS: ActorGuide[] = [
  {
    id: 'guest',
    label: 'Guest',
    title: 'Browse without an account',
    summary: 'Anyone can explore Ethiopian rentals before signing up.',
    steps: [
      {
        icon: Search,
        title: 'Search by city',
        text: 'Use the home search bar or Popular cities to open listings in Addis Ababa, Hawassa, Mekelle, and more.',
      },
      {
        icon: Home,
        title: 'Open a listing',
        text: 'View photos, price, bedrooms, amenities, and location on the full property page.',
      },
      {
        icon: Users,
        title: 'Create an account when ready',
        text: 'Register as a renter to save homes and message owners, or as an owner to list a property.',
      },
    ],
    cta: { to: '/listings', label: 'Browse listings' },
  },
  {
    id: 'renter',
    label: 'Renter',
    title: 'Find and contact a home',
    summary: 'Renters search, save favorites, and chat with property owners.',
    steps: [
      {
        icon: Users,
        title: 'Register as a renter',
        text: 'Sign up with “I’m looking for a place”, verify your email if required, then sign in.',
      },
      {
        icon: Search,
        title: 'Filter listings',
        text: 'Search by city, price, bedrooms, and property type on Listings. Open View details for the full page.',
      },
      {
        icon: Heart,
        title: 'Save favorites',
        text: 'Heart listings you like. Find them anytime under Saved / Favorites.',
      },
      {
        icon: MessageSquare,
        title: 'Message the owner',
        text: 'Use Contact / Message on a listing. Replies appear in Messages with unread badges.',
      },
    ],
    cta: { to: '/register', label: 'Register as renter' },
  },
  {
    id: 'owner',
    label: 'Owner',
    title: 'List and manage properties',
    summary: 'Owners publish homes, answer inquiries, and track performance.',
    steps: [
      {
        icon: Users,
        title: 'Register as an owner',
        text: 'Choose “I’m listing my property” at signup. After login you land on the Owner dashboard.',
      },
      {
        icon: Camera,
        title: 'Add a listing',
        text: 'Use Post or Owner → New listing. Add location, price, photos (uploaded to the server), and publish.',
      },
      {
        icon: MessageSquare,
        title: 'Reply to renters',
        text: 'Inquiries show under Owner → Inquiries (and Messages). Respond in the thread in real time.',
      },
      {
        icon: LayoutDashboard,
        title: 'Manage & upgrade',
        text: 'Pause or edit listings, view analytics, and upgrade to Premium when you need more free listing slots.',
      },
    ],
    cta: { to: '/register', label: 'Register as owner' },
  },
  {
    id: 'admin',
    label: 'Admin',
    title: 'Moderate the platform',
    summary: 'Admins oversee users, listings, and platform health.',
    steps: [
      {
        icon: Shield,
        title: 'Sign in as admin',
        text: 'Use an account with the ADMIN role. The Admin link appears in the navigation after login.',
      },
      {
        icon: Users,
        title: 'Manage users',
        text: 'Filter renters and owners, review approval status, and take moderation actions from the admin dashboard.',
      },
      {
        icon: Home,
        title: 'Approve new listings',
        text: 'Owner posts stay Pending until you review details and Approve. Only then do they appear in public search.',
      },
      {
        icon: CheckCircle2,
        title: 'Verify premium payments',
        text: 'When an owner pays for Premium, confirm the payment under Payments, then Grant Premium. Features unlock only after your approval.',
      },
    ],
    cta: { to: '/login', label: 'Admin sign in' },
  },
];

const HowItWorks: React.FC = () => {
  const [active, setActive] = useState<ActorId>('renter');
  const guide = ACTORS.find((a) => a.id === active) ?? ACTORS[1];

  return (
    <section id="how-it-works" className="scroll-mt-24 sm:scroll-mt-28 mt-12 sm:mt-16 px-1">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brandNavy dark:text-white text-center">
        How it works
      </h2>
      <p className="mt-2 text-center text-sm sm:text-base text-textSecondary dark:text-slate-300 max-w-2xl mx-auto">
        YENE BET has four kinds of users. Pick a role to see the steps.
      </p>
      <div className="mx-auto mt-2 sm:mt-3 h-1 w-12 sm:w-14 bg-brandNavy dark:bg-brandTeal rounded-full" />

      <div
        className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="User roles"
      >
        {ACTORS.map((a) => {
          const selected = a.id === active;
          return (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(a.id)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${
                selected
                  ? 'bg-brandTeal border-brandTeal text-white shadow-sm'
                  : 'bg-white dark:bg-darksurface border-border dark:border-slate-600 text-brandNavy dark:text-slate-200 hover:border-brandTeal/50'
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        className="mt-6 sm:mt-8 max-w-3xl mx-auto rounded-2xl border border-border dark:border-slate-600 bg-white dark:bg-darksurface p-4 sm:p-6 md:p-8 shadow-sm"
      >
        <h3 className="text-lg sm:text-xl font-bold text-brandNavy dark:text-white">{guide.title}</h3>
        <p className="mt-1.5 text-sm text-textSecondary dark:text-slate-300">{guide.summary}</p>

        <ol className="mt-5 sm:mt-6 space-y-4">
          {guide.steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-brandTeal/15 dark:bg-brandTeal/20 text-brandTeal flex items-center justify-center">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                  </span>
                  {i < guide.steps.length - 1 && (
                    <span className="w-px flex-1 min-h-[12px] bg-border dark:bg-slate-600 mt-1" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brandTeal">
                    Step {i + 1}
                  </p>
                  <h4 className="font-semibold text-brandNavy dark:text-white text-sm sm:text-base">
                    {step.title}
                  </h4>
                  <p className="mt-0.5 text-xs sm:text-sm text-textSecondary dark:text-slate-300 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {guide.cta && (
          <div className="mt-6 flex flex-col xs:flex-row gap-2 sm:gap-3">
            <Link
              to={guide.cta.to}
              className="btn-teal justify-center !h-11 text-sm px-5 inline-flex items-center"
            >
              {guide.cta.label}
            </Link>
            {guide.id === 'renter' && (
              <Link
                to="/listings"
                className="btn-secondary justify-center !h-11 text-sm px-5 inline-flex items-center"
              >
                Browse listings
              </Link>
            )}
            {guide.id === 'owner' && (
              <Link
                to="/owner"
                className="btn-secondary justify-center !h-11 text-sm px-5 inline-flex items-center"
              >
                Owner dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorks;
