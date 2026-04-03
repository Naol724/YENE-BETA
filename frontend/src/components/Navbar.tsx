import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import {
  Home,
  LogOut,
  Mail,
  Phone,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  Globe,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/listings', label: 'Listings' },
  { to: '/inquiries', label: 'Messages' },
] as const;

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const messagesPath = user?.role === 'OWNER' ? '/owner/inquiries' : '/inquiries';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const postHref =
    isAuthenticated && user?.role === 'OWNER' ? '/owner/listings/new' : '/register';

  return (
    <>
      {/* Desktop: utility bar */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-[60] bg-utilityBar dark:bg-slate-900/95 border-b border-border/60 dark:border-slate-700 text-xs text-brandNavy/80 dark:text-slate-300">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="mailto:support@houserental.example" className="flex items-center gap-1.5 hover:text-brandTeal">
              <Mail className="h-3.5 w-3.5" />
              support@houserental.example
            </a>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              +251 911 000 000
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border/60 bg-white/80 px-1">
              <Globe className="h-3.5 w-3.5 text-textSecondary ml-1" aria-hidden />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'am')}
                className="bg-transparent text-xs font-medium text-brandNavy py-1 pr-6 rounded cursor-pointer outline-none"
                aria-label="Language"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ (beta)</option>
              </select>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-white/50 text-brandNavy"
              aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {isAuthenticated ? (
              <span className="font-medium text-brandNavy">{user?.fullName.split(' ')[0]}</span>
            ) : (
              <span className="flex items-center gap-1">
                <Link to="/login" className="hover:text-brandTeal font-medium">
                  Login
                </Link>
                <span className="text-border">|</span>
                <Link to="/register" className="hover:text-brandTeal font-medium">
                  Register
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: main nav */}
      <header className="hidden md:flex fixed top-9 left-0 right-0 h-16 bg-white dark:bg-darksurface border-b border-border dark:border-slate-700 z-50 px-6 items-center justify-between shadow-sm transition-colors">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="w-11 h-11 rounded-full bg-brandNavy flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-brandNavy uppercase">YENE BET</span>
        </Link>

        <nav className="flex items-center gap-8">
          {NAV_LINKS.map(({ to, label }) => {
            const active =
              location.pathname === to ||
              (to !== '/' && location.pathname.startsWith(to)) ||
              (to === '/listings' && location.pathname === '/search');
            return (
              <Link
                key={to}
                to={to}
                className={`text-sm font-semibold tracking-wide uppercase transition-colors ${
                  active ? 'text-brandTeal' : 'text-brandNavy hover:text-brandTeal'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-semibold tracking-wide uppercase text-brandNavy hover:text-brandTeal"
            >
              More
              <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50 text-sm font-medium">
                  {isAuthenticated && (
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 hover:bg-surface"
                      onClick={() => setMoreOpen(false)}
                    >
                      Saved
                    </Link>
                  )}
                  <Link
                    to="/search"
                    className="block px-4 py-2 hover:bg-surface"
                    onClick={() => setMoreOpen(false)}
                  >
                    Advanced search
                  </Link>
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold text-textPrimary">Hi, {user?.fullName?.split(' ')[0]}</span>
              {user?.role === 'OWNER' && (
                <Link to="/owner" className="text-sm font-semibold text-brandNavy hover:text-brandTeal">
                  Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : null}
          <Link to={postHref} className="btn-primary h-11 px-6 text-xs">
            Post
          </Link>
        </div>
      </header>

      {/* Mobile: compact top strip */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-darksurface border-b border-border dark:border-slate-700 z-50 px-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
          <span className="w-9 h-9 rounded-full bg-brandNavy flex items-center justify-center text-white">
            <Home className="h-4 w-4" />
          </span>
          <span className="font-bold text-brandNavy dark:text-white text-sm uppercase tracking-tight">YENE BET</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-brandNavy dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-lg text-brandNavy dark:text-slate-200"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[70] bg-black/50"
            onClick={() => setMobileNavOpen(false)}
          >
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute right-0 top-0 bottom-0 w-[min(100%,320px)] bg-white dark:bg-darksurface shadow-2xl flex flex-col p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-brandNavy dark:text-white uppercase">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface dark:hover:bg-slate-700"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/listings', label: 'Listings' },
                  { to: messagesPath, label: 'Messages' },
                  ...(isAuthenticated
                    ? [
                        { to: '/favorites', label: 'Saved' },
                        { to: '/dashboard', label: 'Dashboard' },
                        ...(user?.role === 'OWNER' ? [{ to: '/owner/listings/new', label: 'Post property' }] : []),
                      ]
                    : []),
                ].map((item) => (
                  <Link
                    key={item.to + item.label}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="py-3 px-2 rounded-lg font-medium text-brandNavy dark:text-slate-100 hover:bg-surface dark:hover:bg-slate-700"
                  >
                    {item.label}
                  </Link>
                ))}
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileNavOpen(false)}
                      className="mt-4 btn-primary text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileNavOpen(false)}
                      className="mt-2 btn-teal text-center"
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileNavOpen(false);
                    }}
                    className="mt-4 flex items-center justify-center gap-2 text-error py-3"
                  >
                    <LogOut className="h-5 w-5" /> Log out
                  </button>
                )}
              </div>
              <div className="mt-auto pt-8 border-t border-border dark:border-slate-600 flex items-center gap-2">
                <Globe className="h-4 w-4 text-textSecondary" />
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as 'en' | 'am')}
                  className="flex-1 bg-transparent text-sm font-medium border border-border dark:border-slate-600 rounded-lg px-2 py-2"
                >
                  <option value="en">English</option>
                  <option value="am">አማርኛ</option>
                </select>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
