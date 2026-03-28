import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { Home, Search, Heart, MessageSquare, User as UserIcon, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-50 px-6 hidden md:flex items-center justify-between shadow-sm">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <Home className="h-6 w-6" /> HouseRental
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-textSecondary hover:text-primary transition font-medium">Home</Link>
          <Link to="/search" className="text-textSecondary hover:text-primary transition font-medium">Search</Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold text-textPrimary">Hi, {user?.fullName.split(' ')[0]}</span>
              {user?.role === 'OWNER' && (
                <Link to="/owner" className="btn-primary h-10 px-4">Dashboard</Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="btn-secondary h-10 px-4">Admin</Link>
              )}
              <button onClick={handleLogout} className="text-error hover:text-red-700 p-2">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-primary font-medium">Log In</Link>
              <Link to="/register" className="btn-primary h-10 px-4">Sign Up</Link>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-full h-16 bg-white border-t border-border z-50 flex justify-around items-center px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" className="flex flex-col items-center p-2 text-textSecondary hover:text-primary active:scale-95 transition-transform">
          <Home className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center p-2 text-textSecondary hover:text-primary active:scale-95 transition-transform">
          <Search className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        {isAuthenticated && (
          <Link to="/favorites" className="flex flex-col items-center p-2 text-textSecondary hover:text-primary active:scale-95 transition-transform">
            <Heart className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-medium">Saved</span>
          </Link>
        )}
        <Link to="/inquiries" className="flex flex-col items-center p-2 text-textSecondary hover:text-primary active:scale-95 transition-transform">
          <MessageSquare className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Messages</span>
        </Link>
        <Link to={isAuthenticated ? (user?.role === 'OWNER' ? '/owner' : '/profile') : '/login'} className="flex flex-col items-center p-2 text-textSecondary hover:text-primary active:scale-95 transition-transform">
          <UserIcon className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
