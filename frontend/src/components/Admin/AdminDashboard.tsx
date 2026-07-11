import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BarChart3,
  Users,
  Home,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from '../../store';
import api from '../../utils/api';
import BackNavButton from '../BackNavButton';
import { MediaImage } from '../MediaImage';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalInquiries: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
  pendingListings?: number;
  pendingPremiumPayments?: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  isPremium: boolean;
  createdAt: string;
}

interface Property {
  _id: string;
  title: string;
  owner: { fullName: string; email: string };
  propertyType: string;
  pricing: { pricePerMonth: number };
  location: { city: string; area: string };
  status: string;
  views: number;
  images?: { url?: string }[];
  createdAt: string;
}

interface Transaction {
  _id: string;
  user: { fullName: string; email: string; isPremium?: boolean };
  amount: number;
  status: string;
  paymentMethod: string;
  referenceId: string;
  phoneNumber?: string;
  mpesaResultDesc?: string;
  createdAt: string;
}

interface Inquiry {
  _id: string;
  property: { title: string; images?: { url?: string }[]; location: { city: string; area: string } };
  renter: { fullName: string; email: string; phone?: string };
  owner: { fullName: string; email: string; phone?: string };
  message: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'inquiries' | 'payments'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await api.get('/admin/dashboard/stats');
      setStats(statsResponse.data.data);
      
      // Fetch users
      const usersResponse = await api.get('/admin/users');
      setUsers(usersResponse.data.data || []);
      
      // Fetch properties
      const propertiesResponse = await api.get('/admin/properties');
      setProperties(propertiesResponse.data.data || []);
      
      // Fetch transactions
      const transactionsResponse = await api.get('/admin/transactions');
      setTransactions(transactionsResponse.data.data || []);

      // Fetch inquiries
      const inquiriesResponse = await api.get('/admin/inquiries');
      setInquiries(inquiriesResponse.data.data || []);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'approve' | 'reject' | 'togglePremium') => {
    try {
      if (action === 'approve') {
        await api.patch(`/admin/users/${userId}/approve`);
        toast.success('User approved successfully');
      } else if (action === 'reject') {
        await api.patch(`/admin/users/${userId}/reject`);
        toast.success('User rejected');
      } else if (action === 'togglePremium') {
        await api.patch(`/admin/users/${userId}/toggle-premium`);
        toast.success('Premium status updated');
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to perform user action:', error);
      toast.error('Action failed');
    }
  };

  const handlePropertyAction = async (propertyId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this property?')) return;
        await api.delete(`/admin/properties/${propertyId}`);
        toast.success('Property deleted');
      } else {
        await api.patch(`/admin/properties/${propertyId}/${action}`);
        toast.success(action === 'approve' ? 'Listing approved and published' : 'Listing rejected');
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to perform property action:', error);
      toast.error('Action failed');
    }
  };

  const handlePremiumPayment = async (transactionId: string, action: 'grant' | 'reject') => {
    try {
      if (action === 'grant') {
        await api.patch(`/admin/transactions/${transactionId}/grant-premium`);
        toast.success('Payment verified — Premium granted');
      } else {
        if (!confirm('Reject this premium payment request?')) return;
        await api.patch(`/admin/transactions/${transactionId}/reject-premium`);
        toast.success('Premium payment rejected');
      }
      fetchDashboardData();
    } catch (error: unknown) {
      console.error('Failed to process premium payment:', error);
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Action failed');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = propertyFilter === 'all' || property.status === propertyFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTransactions = transactions.filter((tx) => {
    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'awaiting') return tx.status === 'AwaitingApproval';
    return tx.status === paymentFilter;
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-surface/50 dark:bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandTeal"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-surface/50 dark:bg-darkbg text-textPrimary dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-darksurface shadow-sm border-b border-border dark:border-slate-700/60">
        <div className="px-3 sm:px-4 py-4 sm:py-5 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <BackNavButton fallbackTo="/" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-brandNavy dark:text-white truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-textSecondary dark:text-darkmuted">Manage your rental platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-surface dark:hover:bg-slate-800 rounded-lg transition-colors" aria-label="Settings">
                <Settings className="w-5 h-5 text-textSecondary dark:text-darkmuted" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-darksurface border-b border-border dark:border-slate-700/60">
        <div className="px-2 sm:px-4 max-w-7xl mx-auto">
          <div className="flex gap-1 sm:gap-4 md:gap-8 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 border-b-2 transition-colors font-semibold shrink-0 text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? 'border-brandTeal text-brandTeal'
                      : 'border-transparent text-textSecondary dark:text-darkmuted hover:text-brandNavy dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-darksurface p-6 rounded-2xl shadow-md border border-border dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary dark:text-darkmuted font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-brandNavy dark:text-white mt-1">{stats.totalUsers}</p>
                    <p className="text-xs text-emerald-500 font-semibold mt-2">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {stats.activeUsers} active
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-darksurface p-6 rounded-2xl shadow-md border border-border dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary dark:text-darkmuted font-medium">Properties</p>
                    <p className="text-2xl font-bold text-brandNavy dark:text-white mt-1">{stats.totalProperties}</p>
                    <p className="text-xs text-textSecondary dark:text-darkmuted mt-2">Listed properties</p>
                  </div>
                  <div className="p-3 bg-brandTeal/10 dark:bg-brandTeal/20 rounded-xl">
                    <Home className="w-6 h-6 text-brandTeal" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-darksurface p-6 rounded-2xl shadow-md border border-border dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary dark:text-darkmuted font-medium">Inquiries</p>
                    <p className="text-2xl font-bold text-brandNavy dark:text-white mt-1">{stats.totalInquiries}</p>
                    <p className="text-xs text-textSecondary dark:text-darkmuted mt-2">Total conversations</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-darksurface p-6 rounded-2xl shadow-md border border-border dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary dark:text-darkmuted font-medium">Revenue</p>
                    <p className="text-2xl font-bold text-brandNavy dark:text-white mt-1">ETB {stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 font-semibold mt-2">Total earnings</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pending review queues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('properties');
                  setPropertyFilter('Pending');
                }}
                className="text-left bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Listings awaiting approval</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">
                  {stats.pendingListings ?? 0}
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-2">Review owner posts before they go live</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('payments');
                  setPaymentFilter('awaiting');
                }}
                className="text-left bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-sky-800 dark:text-sky-200">Premium payments to verify</p>
                <p className="text-3xl font-bold text-sky-700 dark:text-sky-300 mt-1">
                  {stats.pendingPremiumPayments ?? 0}
                </p>
                <p className="text-xs text-sky-700/80 dark:text-sky-300/80 mt-2">Confirm payment, then grant Premium</p>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-darksurface rounded-2xl shadow-md border border-border dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-border dark:border-slate-700/60 bg-white dark:bg-darksurface">
                <h2 className="text-lg font-semibold text-brandNavy dark:text-white">Recent Activity</h2>
              </div>
              <div className="divide-y divide-border dark:divide-slate-700/60">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-surface/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-brandTeal/10 dark:bg-brandTeal/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-brandTeal" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-textPrimary dark:text-slate-100">{activity.description}</p>
                        <p className="text-xs text-textSecondary dark:text-darkmuted">by {activity.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-textSecondary dark:text-darkmuted">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
                {stats.recentActivity.length === 0 && (
                  <div className="p-6 text-center text-textSecondary dark:text-darkmuted text-sm bg-white dark:bg-darksurface">
                    No recent activity to show.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-darksurface rounded-2xl shadow-md border border-border dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-border dark:border-slate-700/60 bg-white dark:bg-darksurface">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-brandNavy dark:text-white">Users Management</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandTeal/50 text-textPrimary dark:text-slate-100"
                      />
                    </div>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-3 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandTeal/50 text-textPrimary dark:text-slate-100"
                    >
                      <option value="all">All Roles</option>
                      <option value="RENTER">Renters</option>
                      <option value="OWNER">Owners</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border dark:divide-slate-700/60">
                  <thead className="bg-surface dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-darksurface divide-y divide-border dark:divide-slate-700/60">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-surface/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-9 h-9 bg-brandTeal/10 dark:bg-brandTeal/20 text-brandTeal rounded-full flex items-center justify-center font-bold">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-textPrimary dark:text-slate-100">{user.fullName}</div>
                              <div className="text-xs text-textSecondary dark:text-darkmuted">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                            user.role === 'OWNER' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {user.isEmailVerified ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" title="Email Verified" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500" title="Email Not Verified" />
                            )}
                            {user.isApproved ? (
                              <UserCheck className="w-4 h-4 text-emerald-500" title="Owner Approved" />
                            ) : (
                              <UserX className="w-4 h-4 text-amber-500" title="Owner Pending Approval" />
                            )}
                            {user.isPremium && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full uppercase tracking-wider">Premium</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-1">
                            {!user.isApproved && user.role !== 'ADMIN' && (
                              <>
                                <button
                                  onClick={() => handleUserAction(user._id, 'approve')}
                                  className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 p-1.5 rounded-lg transition-colors"
                                  title="Approve User"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUserAction(user._id, 'reject')}
                                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"
                                  title="Reject User"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleUserAction(user._id, 'togglePremium')}
                              className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 p-1.5 rounded-lg transition-colors"
                              title="Toggle Premium Status"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-textSecondary dark:text-darkmuted text-sm bg-white dark:bg-darksurface">
                          No matching users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-darksurface rounded-2xl shadow-md border border-border dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-border dark:border-slate-700/60 bg-white dark:bg-darksurface">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-brandNavy dark:text-white">Properties Management</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={propertyFilter}
                      onChange={(e) => setPropertyFilter(e.target.value)}
                      className="px-3 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandTeal/50"
                      aria-label="Filter by status"
                    >
                      <option value="all">All statuses</option>
                      <option value="Pending">Pending review</option>
                      <option value="Active">Active</option>
                      <option value="Available">Available</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Paused">Paused</option>
                      <option value="Flagged">Flagged</option>
                    </select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search properties..."
                        className="pl-10 pr-4 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandTeal/50 text-textPrimary dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-surface/30 dark:bg-darkbg/20">
                {filteredProperties.map((property) => (
                  <div key={property._id} className="bg-white dark:bg-darksurface border border-border dark:border-slate-700/60 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="relative h-48 bg-surface dark:bg-slate-800">
                        <MediaImage
                          src={property.images?.[0]?.url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute bottom-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full ${
                          property.status === 'Active' || property.status === 'Available' ? 'bg-emerald-500 text-white' :
                          property.status === 'Pending' ? 'bg-amber-500 text-white' :
                          property.status === 'Rejected' ? 'bg-rose-600 text-white' :
                          property.status === 'Paused' ? 'bg-slate-500 text-white' :
                          'bg-rose-500 text-white'
                        }`}>
                          {property.status === 'Pending' ? 'Needs review' : property.status}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-textPrimary dark:text-slate-100 truncate text-base" title={property.title}>{property.title}</h3>
                        <p className="text-xs text-textSecondary dark:text-darkmuted mt-1">by {property.owner?.fullName || 'N/A'}</p>
                        <p className="text-xs text-textSecondary dark:text-darkmuted mt-0.5">{property.location?.area}, {property.location?.city}</p>
                        <p className="text-lg font-bold text-brandTeal mt-3">
                          ETB {property.pricing.pricePerMonth.toLocaleString()}/mo
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between text-xs text-textSecondary dark:text-darkmuted mb-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{property.views} views</span>
                        </span>
                        <span>{property.propertyType}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-border dark:border-slate-700/60">
                        {property.status === 'Pending' || property.status === 'Rejected' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handlePropertyAction(property._id, 'approve')}
                              className="flex-1 py-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg hover:bg-emerald-500/20 transition-colors text-xs"
                            >
                              Approve
                            </button>
                            {property.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => handlePropertyAction(property._id, 'reject')}
                                className="flex-1 py-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold rounded-lg hover:bg-amber-500/20 transition-colors text-xs"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        ) : property.status === 'Active' || property.status === 'Available' ? (
                          <button
                            type="button"
                            onClick={() => handlePropertyAction(property._id, 'reject')}
                            className="flex-1 py-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 font-semibold rounded-lg hover:bg-amber-500/20 transition-colors text-xs"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePropertyAction(property._id, 'approve')}
                            className="flex-1 py-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 font-semibold rounded-lg hover:bg-emerald-500/20 transition-colors text-xs"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => handlePropertyAction(property._id, 'delete')}
                          className="py-2 px-3 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors text-xs"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProperties.length === 0 && (
                  <div className="col-span-full py-12 text-center text-textSecondary dark:text-darkmuted text-sm bg-white dark:bg-darksurface rounded-2xl border border-border dark:border-slate-700/60">
                    No matching properties found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-darksurface rounded-2xl shadow-md border border-border dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-border dark:border-slate-700/60 bg-white dark:bg-darksurface">
                <h2 className="text-lg font-semibold text-brandNavy dark:text-white">System Inquiries</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border dark:divide-slate-700/60">
                  <thead className="bg-surface dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Property</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Renter</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-darksurface divide-y divide-border dark:divide-slate-700/60">
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry._id} className="hover:bg-surface/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brandNavy dark:text-white truncate max-w-xs" title={inquiry.property?.title}>
                          {inquiry.property?.title || 'Deleted Property'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          <div className="font-semibold text-textPrimary dark:text-slate-100">{inquiry.renter?.fullName || 'N/A'}</div>
                          <div className="text-xs text-textSecondary dark:text-darkmuted">{inquiry.renter?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          <div className="font-semibold text-textPrimary dark:text-slate-100">{inquiry.owner?.fullName || 'N/A'}</div>
                          <div className="text-xs text-textSecondary dark:text-darkmuted">{inquiry.owner?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-textSecondary dark:text-darkmuted max-w-sm truncate" title={inquiry.message}>
                          {inquiry.message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {inquiries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-textSecondary dark:text-darkmuted text-sm bg-white dark:bg-darksurface">
                          No inquiries found on the platform.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-darksurface rounded-2xl shadow-md border border-border dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-border dark:border-slate-700/60 bg-white dark:bg-darksurface">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-brandNavy dark:text-white">Payment Transactions</h2>
                    <p className="text-xs text-textSecondary dark:text-darkmuted mt-1">
                      Verify payment, then grant Premium. Owners stay free until you approve.
                    </p>
                  </div>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="px-3 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandTeal/50"
                    aria-label="Filter payments"
                  >
                    <option value="all">All payments</option>
                    <option value="awaiting">Awaiting approval</option>
                    <option value="Completed">Premium granted</option>
                    <option value="Pending">Payment pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border dark:divide-slate-700/60">
                  <thead className="bg-surface dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-darksurface divide-y divide-border dark:divide-slate-700/60">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-surface/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brandNavy dark:text-white">
                          {transaction.referenceId}
                          {transaction.phoneNumber && (
                            <div className="text-xs font-normal text-textSecondary dark:text-darkmuted mt-0.5">
                              {transaction.phoneNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          <div className="font-semibold text-textPrimary dark:text-slate-100">{transaction.user?.fullName || 'N/A'}</div>
                          <div className="text-xs text-textSecondary dark:text-darkmuted">{transaction.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary dark:text-slate-100 font-medium">
                          ETB {transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            transaction.status === 'AwaitingApproval' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300' :
                            transaction.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {transaction.status === 'AwaitingApproval' ? 'Awaiting approval' : transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.status === 'AwaitingApproval' ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-[8rem]">
                              <button
                                type="button"
                                onClick={() => handlePremiumPayment(transaction._id, 'grant')}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 whitespace-nowrap"
                              >
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                Grant Premium
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePremiumPayment(transaction._id, 'reject')}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/25 whitespace-nowrap"
                              >
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-textSecondary dark:text-darkmuted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-textSecondary dark:text-darkmuted text-sm bg-white dark:bg-darksurface">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
