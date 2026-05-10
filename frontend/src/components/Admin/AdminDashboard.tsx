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

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalInquiries: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
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
  createdAt: string;
}

interface Transaction {
  _id: string;
  user: { fullName: string; email: string };
  amount: number;
  status: string;
  paymentMethod: string;
  referenceId: string;
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

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
        toast.success(`Property ${action}d`);
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to perform property action:', error);
      toast.error('Action failed');
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
    return !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackNavButton fallbackTo="/" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your rental platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {stats.activeUsers} active
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                    <p className="text-xs text-gray-500 mt-1">Listed properties</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Inquiries</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</p>
                    <p className="text-xs text-gray-500 mt-1">Total conversations</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">ETB {stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">Total earnings</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Users Management</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-medium text-sm">
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'OWNER' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {user.isEmailVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            {user.isApproved ? (
                              <UserCheck className="w-4 h-4 text-green-500" />
                            ) : (
                              <UserX className="w-4 h-4 text-yellow-500" />
                            )}
                            {user.isPremium && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Premium</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            {!user.isApproved && user.role !== 'ADMIN' && (
                              <>
                                <button
                                  onClick={() => handleUserAction(user._id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUserAction(user._id, 'reject')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleUserAction(user._id, 'togglePremium')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Properties Management</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search properties..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredProperties.map((property) => (
                  <div key={property._id} className="bg-white border rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa"
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                      <p className="text-sm text-gray-500">by {property.owner.fullName}</p>
                      <p className="text-sm text-gray-500">{property.location.area}, {property.location.city}</p>
                      <p className="text-lg font-bold text-primary mt-2">
                        ETB {property.pricing.pricePerMonth.toLocaleString()}/mo
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'Active' ? 'bg-green-100 text-green-800' :
                          property.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {property.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{property.views}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <button className="flex-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                          <Edit className="w-3 h-3 inline mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handlePropertyAction(property._id, 'delete')}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Payment Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.referenceId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.user.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ETB {transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
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
