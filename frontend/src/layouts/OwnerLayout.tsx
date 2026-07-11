import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  BarChart3,
  Crown,
  User,
  Menu,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { flushReplyQueue } from '../utils/syncReplyQueue';
import { useMessageNotifications } from '../context/MessageNotificationsContext';

const sidebarNav = [
  { to: '/owner', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/listings', end: false, label: 'Listings', icon: Home },
  { to: '/owner/inquiries', end: false, label: 'Inquiries', icon: MessageSquare },
  { to: '/owner/analytics', end: false, label: 'Analytics', icon: BarChart3 },
  { to: '/owner/premium', end: false, label: 'Premium', icon: Crown },
  { to: '/payments', end: false, label: 'Payments', icon: CreditCard },
  { to: '/owner/profile', end: false, label: 'Profile', icon: User },
];

const bottomNav = sidebarNav.filter((item) => item.to !== '/owner/premium' && item.to !== '/payments');

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto min-w-[1.15rem] h-4 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export default function OwnerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const { unreadCount } = useMessageNotifications();
  const online = useOnlineStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    if (online) {
      flushReplyQueue().catch(() => {});
    }
  }, [online]);

  return (
    <div className="min-h-screen bg-surface/50 dark:bg-darkbg flex flex-col md:flex-row transition-colors">
      {!online && (
        <div
          role="status"
          aria-live="polite"
          className="bg-warning/90 text-textPrimary dark:text-slate-900 text-sm font-medium text-center py-2 px-4 z-[60]"
        >
          You are offline. Listings are cached where possible; replies may be queued until you reconnect.
        </div>
      )}

      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border dark:border-slate-700 bg-white dark:bg-darksurface min-h-screen sticky top-0 h-screen">
        <div className="p-4 border-b border-border dark:border-slate-700">
          <NavLink to="/" className="text-lg font-bold text-primary dark:text-brandTeal">
            YENE BET
          </NavLink>
          <p className="text-xs text-textSecondary dark:text-slate-400 mt-1">Owner dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Owner navigation">
          {sidebarNav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary/10 dark:bg-brandTeal/15 text-primary dark:text-brandTeal'
                    : 'text-textSecondary dark:text-slate-400 hover:bg-surface dark:hover:bg-slate-800 hover:text-textPrimary dark:hover:text-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="flex-1">{label}</span>
              {to === '/owner/inquiries' && <NavBadge count={unreadCount} />}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border dark:border-slate-700 space-y-2 mt-auto">
          <p className="text-xs font-medium text-textPrimary dark:text-slate-100 truncate px-1" title={user?.fullName}>
            {user?.fullName ?? 'Owner'}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border dark:border-slate-600 py-2.5 text-sm font-medium text-textSecondary dark:text-slate-300 hover:bg-surface dark:hover:bg-slate-800 hover:text-error transition-colors"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="md:hidden flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-border dark:border-slate-700 bg-white dark:bg-darksurface sticky top-0 z-40">
          <button
            type="button"
            className="p-2.5 rounded-lg border border-border dark:border-slate-600 text-textPrimary dark:text-slate-100 shrink-0"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-primary dark:text-brandTeal truncate max-w-[45%] text-center text-sm">
            {user?.fullName?.split(' ')[0] ?? 'Owner'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 rounded-lg border border-border dark:border-slate-600 text-textSecondary dark:text-slate-300 hover:text-error shrink-0"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white dark:bg-darksurface h-full shadow-xl p-4 flex flex-col border-r border-border dark:border-slate-700">
              <p className="font-bold text-primary dark:text-brandTeal mb-4">Menu</p>
              <nav className="space-y-1 flex-1 overflow-y-auto" aria-label="Owner navigation mobile drawer">
                {sidebarNav.map(({ to, end, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? 'bg-primary/10 dark:bg-brandTeal/15 text-primary dark:text-brandTeal'
                          : 'text-textSecondary dark:text-slate-300'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    <span className="flex-1">{label}</span>
                    {to === '/owner/inquiries' && <NavBadge count={unreadCount} />}
                  </NavLink>
                ))}
              </nav>
              <NavLink
                to="/"
                className="text-sm text-primary dark:text-brandTeal font-medium py-2"
                onClick={() => setDrawerOpen(false)}
              >
                ← Back to site
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-border dark:border-slate-600 py-2.5 text-sm font-medium text-error"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Log out
              </button>
            </div>
          </div>
        )}

        <main
          id="owner-main"
          className="flex-1 px-3 sm:px-4 md:px-8 pt-4 md:pt-8 pb-28 md:pb-10 max-w-7xl w-full mx-auto"
        >
          <Outlet />
        </main>

        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-darksurface/95 backdrop-blur-md border-t border-border dark:border-slate-700 z-40 flex justify-around items-center px-1 pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
          aria-label="Owner primary navigation"
        >
          {bottomNav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-lg transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive ? 'text-primary dark:text-brandTeal' : 'text-textSecondary dark:text-slate-400'
                }`
              }
            >
              <span className="relative">
                <Icon className="h-5 w-5 mb-0.5" aria-hidden />
                {to === '/owner/inquiries' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[0.95rem] h-3.5 px-0.5 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium truncate max-w-full px-0.5">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
