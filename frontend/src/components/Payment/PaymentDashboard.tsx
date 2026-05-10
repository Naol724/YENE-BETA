import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  CreditCard,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  DollarSign,
  Receipt,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from '../../store';
import api from '../../utils/api';
import BackNavButton from '../BackNavButton';

interface Transaction {
  _id: string;
  amount: number;
  phoneNumber: string;
  referenceId: string;
  status: 'Pending' | 'Completed' | 'Failed';
  paymentMethod: string;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  mpesaResultDesc?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  successRate: number;
}

const PaymentDashboard: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    fetchPaymentData();
  }, [isAuthenticated, user]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions
      const transactionsResponse = await api.get('/premium/transactions');
      const transactionsData = transactionsResponse.data.data || [];
      setTransactions(transactionsData);
      
      // Calculate stats
      const totalTransactions = transactionsData.length;
      const completedTransactions = transactionsData.filter((tx: Transaction) => tx.status === 'Completed').length;
      const pendingTransactions = transactionsData.filter((tx: Transaction) => tx.status === 'Pending').length;
      const failedTransactions = transactionsData.filter((tx: Transaction) => tx.status === 'Failed').length;
      
      const totalAmount = transactionsData.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      const completedAmount = transactionsData
        .filter((tx: Transaction) => tx.status === 'Completed')
        .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      const pendingAmount = transactionsData
        .filter((tx: Transaction) => tx.status === 'Pending')
        .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      
      const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;
      
      setStats({
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        totalAmount,
        completedAmount,
        pendingAmount,
        successRate
      });
      
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.phoneNumber.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || transaction.paymentMethod === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-50';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'Failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadReceipt = (transaction: Transaction) => {
    // Create a simple receipt download
    const receiptContent = `
Payment Receipt
================
Reference ID: ${transaction.referenceId}
Amount: ETB ${transaction.amount.toLocaleString()}
Status: ${transaction.status}
Payment Method: ${transaction.paymentMethod}
Phone: ${transaction.phoneNumber}
Date: ${formatDate(transaction.createdAt)}
${transaction.mpesaResultDesc ? `Description: ${transaction.mpesaResultDesc}` : ''}
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${transaction.referenceId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <BackNavButton fallbackTo="/dashboard" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your payments and transactions</p>
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
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.completedTransactions} completed
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Receipt className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">ETB {stats.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">
                      ETB {stats.completedAmount.toLocaleString()} completed
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.failedTransactions} failed
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      ETB {stats.pendingAmount.toLocaleString()} pending
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.referenceId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ETB {transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Smartphone className="w-4 h-4 mr-1" />
                            {transaction.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{transaction.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.status === 'Completed' && (
                            <button
                              onClick={() => downloadReceipt(transaction)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search transactions..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Status</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <select
                      value={filterMethod}
                      onChange={(e) => setFilterMethod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Methods</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Simulated">Simulated</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.referenceId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ETB {transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Smartphone className="w-4 h-4 mr-1" />
                            {transaction.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{transaction.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            {transaction.status === 'Completed' && (
                              <button
                                onClick={() => downloadReceipt(transaction)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Download Receipt"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            {transaction.mpesaResultDesc && (
                              <div className="text-xs text-gray-500 max-w-xs truncate" title={transaction.mpesaResultDesc}>
                                {transaction.mpesaResultDesc}
                              </div>
                            )}
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
      </div>
    </div>
  );
};

export default PaymentDashboard;
