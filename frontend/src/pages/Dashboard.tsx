import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Heart, MessageSquare, User, LayoutDashboard, Home } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';

const Dashboard: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const isOwner = user?.role === 'OWNER';

  const cards = [
    {
      to: '/favorites',
      icon: Heart,
      title: 'Saved properties',
      desc: 'Listings you have hearted',
    },
    {
      to: isOwner ? '/owner/inquiries' : '/inquiries',
      icon: MessageSquare,
      title: 'Messages',
      desc: 'Conversations with owners and renters',
    },
    {
      to: isOwner ? '/owner/profile' : '/profile',
      icon: User,
      title: 'Profile settings',
      desc: 'Account details and preferences',
    },
    ...(isOwner
      ? [
          {
            to: '/owner',
            icon: LayoutDashboard,
            title: 'Owner dashboard',
            desc: 'Listings, analytics, and premium',
          },
          {
            to: '/owner/listings/new',
            icon: Home,
            title: 'Post a property',
            desc: 'Create a new listing',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-surface/50 dark:bg-darkbg pb-20 md:pb-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-brandNavy dark:text-white">Your dashboard</h1>
        <p className="mt-2 text-textSecondary dark:text-darkmuted">
          Quick links to your saved homes, messages, and account.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {cards.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to + title}
              to={to}
              className="card-container p-6 hover:shadow-lg transition-shadow flex gap-4 group dark:bg-darksurface dark:border-slate-700"
            >
              <div className="rounded-xl bg-brandNavy/5 dark:bg-white/5 p-3 h-fit group-hover:bg-brandTeal/10 transition-colors">
                <Icon className="h-6 w-6 text-brandTeal" />
              </div>
              <div>
                <h2 className="font-semibold text-brandNavy dark:text-white group-hover:text-brandTeal transition-colors">
                  {title}
                </h2>
                <p className="text-sm text-textSecondary dark:text-darkmuted mt-1">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-textSecondary dark:text-darkmuted">
          <Link to="/" className="text-brandTeal font-medium hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Dashboard;
