import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  Users,
  Home,
  MessageSquare,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface DashboardStats {
  totalUsers: number;
  totalOwners: number;
  totalRenters: number;
  totalListings: number;
  activeListings: number;
  totalInquiries: number;
  pendingInquiries: number;
}

interface RecentListing {
  _id: string;
  title: string;
  status: string;
  owner: { fullName: string; email: string };
  createdAt: string;
}

interface RecentInquiry {
  _id: string;
  status: string;
  property: { title: string };
  renter: { fullName: string; email: string };
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
      toast.error('Access denied');
    }
  }, [user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data.stats);
          setRecentListings(res.data.data.recentListings);
          setRecentInquiries(res.data.data.recentInquiries);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brandTeal mx-auto mb-4" />
          <p className="text-textSecondary">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brandNavy dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-textSecondary dark:text-darkmuted">
            Welcome back, {user?.fullName || 'Admin'}. Monitor platform activity and manage content.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-200 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Users */}
            <div className="bg-white dark:bg-darksurface rounded-xl p-6 border border-border dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary dark:text-darkmuted text-sm mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-brandNavy dark:text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-textSecondary dark:text-darkmuted mt-2">
                    {stats.totalOwners} owners · {stats.totalRenters} renters
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total Listings */}
            <div className="bg-white dark:bg-darksurface rounded-xl p-6 border border-border dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary dark:text-darkmuted text-sm mb-1">Total Listings</p>
                  <p className="text-2xl font-bold text-brandNavy dark:text-white">{stats.totalListings}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ {stats.activeListings} active
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Total Inquiries */}
            <div className="bg-white dark:bg-darksurface rounded-xl p-6 border border-border dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary dark:text-darkmuted text-sm mb-1">Total Inquiries</p>
                  <p className="text-2xl font-bold text-brandNavy dark:text-white">{stats.totalInquiries}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                    ⏳ {stats.pendingInquiries} pending
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-white dark:bg-darksurface rounded-xl p-6 border border-border dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textSecondary dark:text-darkmuted text-sm mb-1">Platform Health</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">Good</p>
                  <p className="text-xs text-textSecondary dark:text-darkmuted mt-2">
                    All systems operational
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Listings Section */}
        <div className="bg-white dark:bg-darksurface rounded-xl border border-border dark:border-slate-700 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brandNavy dark:text-white">Recent Listings</h2>
            <button
              onClick={() => navigate('/admin/listings')}
              className="text-sm font-semibold text-brandTeal hover:text-brandTealDark transition-colors"
            >
              View all →
            </button>
          </div>

          {recentListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-slate-700 text-left">
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Title</th>
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Owner</th>
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Status</th>
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Date</th>
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((listing) => (
                    <tr key={listing._id} className="border-b border-border/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 text-textPrimary dark:text-slate-200 font-medium">{listing.title}</td>
                      <td className="py-4 text-textSecondary dark:text-darkmuted">{listing.owner.fullName}</td>
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            listing.status === 'Active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : listing.status === 'Paused'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="py-4 text-textSecondary dark:text-darkmuted">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/house/${listing._id}`)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-brandTeal"
                          title="View listing"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/listings/${listing._id}`)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                          title="Edit status"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-textSecondary dark:text-darkmuted text-center py-8">No listings yet</p>
          )}
        </div>

        {/* Recent Inquiries Section */}
        <div className="bg-white dark:bg-darksurface rounded-xl border border-border dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brandNavy dark:text-white">Recent Inquiries</h2>
            <button
              onClick={() => navigate('/admin/inquiries')}
              className="text-sm font-semibold text-brandTeal hover:text-brandTealDark transition-colors"
            >
              View all →
            </button>
          </div>

          {recentInquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-slate-700 text-left">
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Property</th>
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Renter</th>
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Status</th>
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Date</th>
                    <th className="pb-3 font-semibold text-textSecondary dark:text-darkmuted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map((inquiry) => (
                    <tr key={inquiry._id} className="border-b border-border/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 text-textPrimary dark:text-slate-200 font-medium">
                        {typeof inquiry.property === 'object' ? inquiry.property.title : 'Property'}
                      </td>
                      <td className="py-4 text-textSecondary dark:text-darkmuted">{inquiry.renter.fullName}</td>
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                            inquiry.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : inquiry.status === 'Read'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {inquiry.status === 'Pending' && <AlertCircle className="h-3 w-3" />}
                          {inquiry.status === 'Responded' && <CheckCircle2 className="h-3 w-3" />}
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="py-4 text-textSecondary dark:text-darkmuted">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => navigate(`/inquiries/${inquiry._id}`)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-brandTeal"
                          title="View inquiry"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-textSecondary dark:text-darkmuted text-center py-8">No inquiries yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white dark:bg-darksurface border border-border dark:border-slate-700 rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-brandNavy dark:text-white">Manage Users</h3>
            <p className="text-sm text-textSecondary dark:text-darkmuted">View and manage user accounts</p>
          </button>

          <button
            onClick={() => navigate('/admin/listings')}
            className="bg-white dark:bg-darksurface border border-border dark:border-slate-700 rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <Home className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-semibold text-brandNavy dark:text-white">Manage Listings</h3>
            <p className="text-sm text-textSecondary dark:text-darkmuted">Review and moderate property listings</p>
          </button>

          <button
            onClick={() => navigate('/admin/inquiries')}
            className="bg-white dark:bg-darksurface border border-border dark:border-slate-700 rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2" />
            <h3 className="font-semibold text-brandNavy dark:text-white">View Inquiries</h3>
            <p className="text-sm text-textSecondary dark:text-darkmuted">Monitor all user inquiries and messages</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
