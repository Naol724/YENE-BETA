import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Home, MessageSquare, Eye, TrendingUp, Star, Plus } from 'lucide-react';
import api from '../utils/api';

const OwnerDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalInquiries: 0,
    viewsThisWeek: 0,
    responseRate: 95
  });
  const [premiumStatus, setPremiumStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const housesRes = await api.get('/houses/my-listings');
        const inqRes = await api.get('/inquiries/received');
        const limitRes = await api.get('/premium/check-limit');
        
        setPremiumStatus(limitRes.data.data);
        
        let totalViews = 0;
        housesRes.data.data.forEach((h: any) => totalViews += h.views || 0);

        setStats({
          totalListings: housesRes.data.count,
          totalInquiries: inqRes.data.count,
          viewsThisWeek: totalViews,
          responseRate: 95
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.fullName.split(' ')[0]} 🏠</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user?.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {user?.isApproved ? 'Approved' : 'Pending Approval'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${premiumStatus?.isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
              {premiumStatus?.isPremium && <Star className="h-3 w-3" />}
              {premiumStatus?.isPremium ? 'Premium' : 'Free Status'}
            </span>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {!premiumStatus?.isPremium && (
            <Link to="/owner/premium" className="flex-1 md:flex-none border border-yellow-500 text-yellow-600 font-semibold h-10 px-4 rounded-lg flex items-center justify-center hover:bg-yellow-50 transition-colors">
              Upgrade
            </Link>
          )}
          <Link to="/owner/listings/new" className="flex-1 md:flex-none btn-primary h-10 px-4">
            <Plus className="h-4 w-4 mr-2" /> Add Listing
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-container flex flex-col justify-center">
          <div className="flex items-center text-textSecondary mb-2">
            <Home className="h-4 w-4 mr-2" /> Total Listings
          </div>
          <p className="text-3xl font-bold">{stats.totalListings}</p>
        </div>
        <div className="card-container flex flex-col justify-center">
          <div className="flex items-center text-textSecondary mb-2">
            <MessageSquare className="h-4 w-4 mr-2" /> Total Inquiries
          </div>
          <p className="text-3xl font-bold">{stats.totalInquiries}</p>
        </div>
        <div className="card-container flex flex-col justify-center">
          <div className="flex items-center text-textSecondary mb-2">
            <Eye className="h-4 w-4 mr-2" /> Views
          </div>
          <p className="text-3xl font-bold">{stats.viewsThisWeek}</p>
        </div>
        <div className="card-container flex flex-col justify-center">
          <div className="flex items-center text-textSecondary mb-2">
            <TrendingUp className="h-4 w-4 mr-2" /> Response Rate
          </div>
          <p className="text-3xl font-bold">{stats.responseRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Links */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <div className="space-y-4">
            <Link to="/owner/listings" className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors font-medium">
              Manage Listings <span className="text-xl">→</span>
            </Link>
            <Link to="/inquiries" className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors font-medium">
              View Messages <span className="text-xl">→</span>
            </Link>
            <Link to="/owner/premium" className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium">
              Premium Subscription <span className="text-xl">→</span>
            </Link>
          </div>
        </div>

        {/* Empty State / Notice */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold">List your first property</h3>
          <p className="text-textSecondary text-sm my-2 max-w-xs">
            Showcase your space to thousands of renters. Your first listing is completely free!
          </p>
          <Link to="/owner/listings/new" className="text-primary font-bold mt-2 underline decoration-2 underline-offset-4">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
