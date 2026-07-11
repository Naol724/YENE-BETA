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
  status: 'Pending' | 'AwaitingApproval' | 'Completed' | 'Failed' | 'Rejected';
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
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      case 'AwaitingApproval':
        return 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30';
      case 'Pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
      case 'Failed':
      case 'Rejected':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'AwaitingApproval':
        return <Clock className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Failed':
      case 'Rejected':
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
      <div className="min-h-screen bg-surface/50 dark:bg-darkbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-surface/50 dark:bg-darkbg text-textPrimary dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-darksurface shadow-sm border-b border-border dark:border-slate-700/60">
        <div className="px-4 py-5 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <BackNavButton fallbackTo="/dashboard" />
            <div>
              <h1 className="text-2xl font-bold text-brandNavy dark:text-white">Payment Dashboard</h1>
              <p className="text-sm text-textSecondary dark:text-darkmuted">Manage your payments and transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-darksurface border-b border-border dark:border-slate-700/60">
        <div className="px-2 sm:px-4 max-w-7xl mx-auto">
          <div className="flex gap-2 sm:gap-8 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 sm:py-4 border-b-2 transition-colors font-semibold shrink-0 text-sm ${
                    activeTab === tab.id
                      ? 'border-brandTeal text-brandTeal'
                      : 'border-transparent text-textSecondary dark:text-darkmuted hover:text-brandNavy dark:hover:text-slate-200'
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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-darksurface p-6 rounded-2xl shadow-md border border-border dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary dark:text-darkmuted font-medium">Total Transactions</p>
                    <p className="text-2xl font-bold text-brandNavy dark:text-white mt-1">{stats.totalTransactions}</p>
                    <p className="text-xs text-textSecondary dark:text-darkmuted mt-2">
                      <span className="text-emerald-500 font-semibold">{stats.completedTransactions}</span> completed
                    </p>
                  </div>
                  <div className="p-3 bg-brandTeal/10 dark:bg-brandTeal/20 rounded-xl">
                    <Receipt className="w-6 h-6 text-brandTeal" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-darksurface p-6 rounded-2xl shadow-md border border-border dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary dark:text-darkmuted font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-brandNavy dark:text-white mt-1">ETB {stats.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 font-semibold mt-2">
                      ETB {stats.completedAmount.toLocaleString()} completed
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-darksurface p-6 rounded-2xl shadow-md border border-border dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary dark:text-darkmuted font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-brandNavy dark:text-white mt-1">{stats.successRate.toFixed(1)}%</p>
                    <p className="text-xs text-textSecondary dark:text-darkmuted mt-2">
                      <span className="text-rose-500 font-semibold">{stats.failedTransactions}</span> failed
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-darksurface p-6 rounded-2xl shadow-md border border-border dark:border-slate-700/60 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textSecondary dark:text-darkmuted font-medium">Pending</p>
                    <p className="text-2xl font-bold text-brandNavy dark:text-white mt-1">{stats.pendingTransactions}</p>
                    <p className="text-xs text-amber-500 font-semibold mt-2">
                      ETB {stats.pendingAmount.toLocaleString()} pending
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-darksurface rounded-2xl shadow-md border border-border dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-border dark:border-slate-700/60 bg-white dark:bg-darksurface">
                <h2 className="text-lg font-semibold text-brandNavy dark:text-white">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border dark:divide-slate-700/60">
                  <thead className="bg-surface dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-darksurface divide-y divide-border dark:divide-slate-700/60">
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-surface/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brandNavy dark:text-white">
                          {transaction.referenceId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary dark:text-slate-100 font-medium">
                          ETB {transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          <div className="flex items-center">
                            <Smartphone className="w-4 h-4 mr-1.5 text-brandTeal" />
                            {transaction.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{transaction.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.status === 'Completed' && (
                            <button
                              onClick={() => downloadReceipt(transaction)}
                              className="text-brandTeal hover:text-brandTeal/80 hover:bg-brandTeal/10 p-1.5 rounded-lg transition-colors"
                              title="Download Receipt"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-textSecondary dark:text-darkmuted text-sm bg-white dark:bg-darksurface">
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

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-darksurface rounded-2xl shadow-md border border-border dark:border-slate-700/60 overflow-hidden">
              <div className="p-6 border-b border-border dark:border-slate-700/60 bg-white dark:bg-darksurface">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-brandNavy dark:text-white">All Transactions</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search transactions..."
                        className="pl-10 pr-4 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandTeal/50 text-textPrimary dark:text-slate-100"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandTeal/50 text-textPrimary dark:text-slate-100"
                    >
                      <option value="all">All Status</option>
                      <option value="Completed">Premium granted</option>
                      <option value="AwaitingApproval">Awaiting approval</option>
                      <option value="Pending">Payment pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Failed">Failed</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <select
                      value={filterMethod}
                      onChange={(e) => setFilterMethod(e.target.value)}
                      className="px-3 py-2 border border-border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandTeal/50 text-textPrimary dark:text-slate-100"
                    >
                      <option value="all">All Methods</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Simulated">Simulated</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border dark:divide-slate-700/60">
                  <thead className="bg-surface dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary dark:text-darkmuted uppercase tracking-wider">Phone</th>
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary dark:text-slate-100 font-medium">
                          ETB {transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          {transaction.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          <div className="flex items-center">
                            <Smartphone className="w-4 h-4 mr-1.5 text-brandTeal" />
                            {transaction.paymentMethod}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{transaction.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary dark:text-darkmuted">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            {transaction.status === 'Completed' && (
                              <button
                                onClick={() => downloadReceipt(transaction)}
                                className="text-brandTeal hover:text-brandTeal/80 hover:bg-brandTeal/10 p-1.5 rounded-lg transition-colors"
                                title="Download Receipt"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            {transaction.mpesaResultDesc && (
                              <div className="text-xs text-textSecondary dark:text-darkmuted max-w-xs truncate" title={transaction.mpesaResultDesc}>
                                {transaction.mpesaResultDesc}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-textSecondary dark:text-darkmuted text-sm bg-white dark:bg-darksurface">
                          No matching transactions found.
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

export default PaymentDashboard;
