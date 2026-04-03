import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { Home, LogOut, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const roleLabel = user.role === 'OWNER' ? 'Property owner' : 'Renter';

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-lg mx-auto animate-fade-in">
      <Link
        to="/"
        className="mb-6 inline-flex text-xl font-bold text-primary items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Home className="h-6 w-6" />
        YENE BET
      </Link>

      <div className="card-container p-6 md:p-8 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-textPrimary">{user.fullName}</h1>
            <p className="text-sm text-textSecondary">{roleLabel}</p>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-textSecondary font-medium">Email</dt>
            <dd className="text-textPrimary">{user.email}</dd>
          </div>
          {user.role === 'OWNER' && typeof user.isApproved === 'boolean' && (
            <div>
              <dt className="text-textSecondary font-medium">Listing status</dt>
              <dd className="text-textPrimary">
                {user.isApproved ? 'Approved' : 'Pending approval'}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-8 flex flex-col gap-3">
          {user.role === 'OWNER' && (
            <Link to="/owner" className="btn-primary text-center">
              Owner dashboard
            </Link>
          )}
          <button type="button" onClick={handleLogout} className="btn-secondary w-full gap-2 flex items-center justify-center">
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
