import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import { useI18n, LanguageSelect } from '../context/I18nContext';
import { useMessageNotifications } from '../context/MessageNotificationsContext';
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
} from 'lucide-react';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useMessageNotifications();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const messagesPath = user?.role === 'OWNER' ? '/owner/inquiries' : '/inquiries';

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/listings', label: t('nav.listings') },
    { to: messagesPath, label: t('nav.messages'), badge: isAuthenticated ? unreadCount : 0 },
  ] as const;

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
        <div className="container-mobile h-9 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="mailto:support@houserental.example" className="hidden sm:flex items-center gap-1.5 hover:text-brandTeal">
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden lg:block">support@houserental.example</span>
              <span className="lg:hidden">Email</span>
            </a>
            <span className="hidden sm:flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden lg:block">+251 913678845</span>
              <span className="lg:hidden">+251 913678845</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LanguageSelect />
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800 text-brandNavy dark:text-slate-200"
              aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {isAuthenticated ? (
              <span className="hidden sm:block font-medium text-brandNavy dark:text-slate-200 truncate max-w-[100px]">
                {user?.fullName.split(' ')[0]}
              </span>
            ) : (
              <div className="hidden sm:flex items-center gap-1 text-brandNavy dark:text-slate-200">
                <Link to="/login" className="hover:text-brandTeal font-medium text-sm">
                  {t('nav.login')}
                </Link>
                <span className="text-border dark:text-slate-600">|</span>
                <Link to="/register" className="hover:text-brandTeal font-medium text-sm">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: main nav — 3-column grid keeps logo / links / actions evenly spaced */}
      <header className="hidden md:flex fixed top-9 left-0 right-0 h-16 bg-white dark:bg-darksurface border-b border-border dark:border-slate-700 z-50 items-center shadow-sm transition-colors">
        <div className="container-mobile w-full flex items-center justify-between gap-3 xl:gap-6">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-brandNavy dark:bg-brandTeal flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-brandNavy dark:text-white uppercase truncate">
              YENE BET
            </span>
          </Link>

          <nav className="flex items-center justify-center gap-4 lg:gap-7 xl:gap-9 min-w-0 flex-1 px-2">
            {navLinks.map(({ to, label, ...rest }) => {
              const badge = 'badge' in rest ? rest.badge : 0;
              const isMessages = to === messagesPath;
              const active =
                location.pathname === to ||
                (to !== '/' && location.pathname.startsWith(to)) ||
                (to === '/listings' && location.pathname === '/search') ||
                (isMessages &&
                  (location.pathname.startsWith('/inquiries') ||
                    location.pathname.startsWith('/owner/inquiries') ||
                    location.pathname.startsWith('/chat')));
              return (
                <Link
                  key={`${to}-${label}`}
                  to={to}
                  className={`relative shrink-0 whitespace-nowrap text-sm font-semibold tracking-wide uppercase transition-colors ${
                    active
                      ? 'text-brandTeal'
                      : 'text-brandNavy dark:text-slate-100 hover:text-brandTeal'
                  }`}
                >
                  {label}
                  {badge > 0 && (
                    <span className="absolute -top-2 -right-4 min-w-[1.1rem] h-4 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                className="flex items-center gap-1 text-sm font-semibold tracking-wide uppercase text-brandNavy dark:text-slate-100 hover:text-brandTeal"
              >
                {t('nav.more')}
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
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white dark:bg-darksurface rounded-lg shadow-lg border border-border dark:border-slate-600 py-2 z-50 text-sm font-medium text-brandNavy dark:text-slate-100">
                    {isAuthenticated && (
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 hover:bg-surface dark:hover:bg-slate-700"
                        onClick={() => setMoreOpen(false)}
                      >
                        Saved
                      </Link>
                    )}
                    <Link
                      to="/search"
                      className="block px-4 py-2 hover:bg-surface dark:hover:bg-slate-700"
                      onClick={() => setMoreOpen(false)}
                    >
                      Advanced search
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden xl:block font-semibold text-brandNavy dark:text-slate-100 truncate max-w-[120px]">
                  Hi, {user?.fullName?.split(' ')[0]}
                </span>
                {user?.role === 'OWNER' && (
                  <Link
                    to="/owner"
                    className="text-sm font-semibold text-brandNavy dark:text-slate-100 hover:text-brandTeal hidden lg:block"
                  >
                    {t('nav.dashboard')}
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="text-sm font-semibold text-brandNavy dark:text-slate-100 hover:text-brandTeal hidden lg:block"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-error hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  aria-label={t('nav.logout')}
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ) : null}
            <Link to={postHref} className="btn-primary h-10 sm:h-11 px-4 sm:px-6 text-xs shrink-0">
              {t('nav.post')}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile: compact top strip */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-darksurface border-b border-border dark:border-slate-700 z-50 px-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brandNavy flex items-center justify-center text-white">
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <span className="font-bold text-brandNavy dark:text-white text-xs sm:text-sm uppercase tracking-tight">YENE BET</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg text-brandNavy dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="p-1.5 sm:p-2 rounded-lg text-brandNavy dark:text-slate-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
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
              className="absolute right-0 top-0 bottom-0 w-[min(100%,320px)] bg-white dark:bg-darksurface shadow-2xl flex flex-col p-4 sm:p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <span className="font-bold text-brandNavy dark:text-white uppercase text-sm sm:text-base">
                  {t('nav.menu')}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface dark:hover:bg-slate-700"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { to: '/', label: t('nav.home') },
                  { to: '/listings', label: t('nav.listings') },
                  { to: messagesPath, label: t('nav.messages'), badge: isAuthenticated ? unreadCount : 0 },
                  ...(isAuthenticated
                    ? [
                        { to: '/favorites', label: t('nav.saved'), badge: 0 },
                        { to: '/dashboard', label: t('nav.dashboard'), badge: 0 },
                        ...(user?.role === 'OWNER'
                          ? [{ to: '/owner/listings/new', label: t('nav.post'), badge: 0 }]
                          : []),
                        ...(user?.role === 'ADMIN'
                          ? [{ to: '/admin', label: 'Admin Dashboard', badge: 0 }]
                          : []),
                      ]
                    : []),
                ].map((item) => (
                  <Link
                    key={item.to + item.label}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="py-3 px-2 sm:py-3 sm:px-3 rounded-lg font-medium text-brandNavy dark:text-slate-100 hover:bg-surface dark:hover:bg-slate-700 text-sm sm:text-base flex items-center justify-between gap-2"
                  >
                    <span>{item.label}</span>
                    {(item.badge ?? 0) > 0 && (
                      <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-error text-white text-[11px] font-bold flex items-center justify-center">
                        {(item.badge ?? 0) > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileNavOpen(false)}
                      className="mt-4 sm:mt-6 btn-primary text-center py-3 sm:py-4 text-sm"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileNavOpen(false)}
                      className="mt-2 sm:mt-3 btn-teal text-center py-3 sm:py-4 text-sm"
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileNavOpen(false);
                    }}
                    className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-error py-3 text-sm sm:text-base"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" /> {t('nav.logout')}
                  </button>
                )}
              </div>
              <div className="mt-auto pt-6 sm:pt-8 border-t border-border dark:border-slate-600">
                <LanguageSelect className="w-full [&_select]:w-full [&_select]:border [&_select]:border-border [&_select]:dark:border-slate-600 [&_select]:rounded-lg [&_select]:px-2 [&_select]:py-2" />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
