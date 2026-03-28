import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import {
  Home,
  Search,
  Heart,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Mail,
  Phone,
  ChevronDown,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Listing' },
  { to: '/inquiries', label: 'Messages' },
] as const;

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const postHref =
    isAuthenticated && user?.role === 'OWNER' ? '/owner/listings/new' : '/register';

  return (
    <>
      {/* Desktop: utility bar */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-[60] bg-utilityBar border-b border-border/60 text-xs text-brandNavy/80">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="mailto:support@houserental.example" className="flex items-center gap-1.5 hover:text-brandTeal">
              <Mail className="h-3.5 w-3.5" />
              support@houserental.example
            </a>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              +254 700 000 000
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-textSecondary hidden lg:inline">English</span>
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
      <header className="hidden md:flex fixed top-9 left-0 right-0 h-16 bg-white border-b border-border z-50 px-6 items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="w-11 h-11 rounded-full bg-brandNavy flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-brandNavy uppercase">HouseRental</span>
        </Link>

        <nav className="flex items-center gap-8">
          {NAV_LINKS.map(({ to, label }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
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
            <>
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
            </>
          ) : null}
          <Link to={postHref} className="btn-primary h-11 px-6 text-xs">
            Post
          </Link>
        </div>
      </header>

      {/* Mobile: compact top strip */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-border z-50 px-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-brandNavy flex items-center justify-center text-white">
            <Home className="h-4 w-4" />
          </span>
          <span className="font-bold text-brandNavy text-sm uppercase tracking-tight">HouseRental</span>
        </Link>
        {isAuthenticated ? (
          <button type="button" onClick={handleLogout} className="text-error p-2" aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        ) : (
          <Link to="/login" className="text-sm font-semibold text-brandTeal">
            Login
          </Link>
        )}
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-full h-16 bg-white border-t border-border z-50 flex justify-around items-center px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link
          to="/"
          className="flex flex-col items-center p-2 text-textSecondary hover:text-brandTeal active:scale-95 transition-transform"
        >
          <Home className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          to="/search"
          className="flex flex-col items-center p-2 text-textSecondary hover:text-brandTeal active:scale-95 transition-transform"
        >
          <Search className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        {isAuthenticated && (
          <Link
            to="/favorites"
            className="flex flex-col items-center p-2 text-textSecondary hover:text-brandTeal active:scale-95 transition-transform"
          >
            <Heart className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-medium">Saved</span>
          </Link>
        )}
        <Link
          to="/inquiries"
          className="flex flex-col items-center p-2 text-textSecondary hover:text-brandTeal active:scale-95 transition-transform"
        >
          <MessageSquare className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Messages</span>
        </Link>
        <Link
          to={
            isAuthenticated ? (user?.role === 'OWNER' ? '/owner' : '/profile') : '/login'
          }
          className="flex flex-col items-center p-2 text-textSecondary hover:text-brandTeal active:scale-95 transition-transform"
        >
          <UserIcon className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
