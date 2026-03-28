import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, DollarSign, Activity, FileText, ShieldAlert } from 'lucide-react';
import api from '../utils/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Content (simulated) */}
      <div className="hidden md:block w-64 space-y-2 mt-16 pr-6 border-r border-border">
        <Link to="/admin" className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary font-bold">
          <Activity className="h-5 w-5" /> Dashboard
        </Link>
        <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-lg text-textSecondary hover:bg-surface transition-colors font-medium">
          <Users className="h-5 w-5" /> Users & Owners
        </Link>
        <Link to="/admin/listings" className="flex items-center gap-3 p-3 rounded-lg text-textSecondary hover:bg-surface transition-colors font-medium">
          <Home className="h-5 w-5" /> Listings
        </Link>
        <Link to="/admin/transactions" className="flex items-center gap-3 p-3 rounded-lg text-textSecondary hover:bg-surface transition-colors font-medium">
          <DollarSign className="h-5 w-5" /> Transactions
        </Link>
      </div>

      <div className="flex-1 w-full mt-4 md:mt-16">
        <h2 className="text-3xl font-bold mb-8">Platform Overview</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => <div key={n} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <div className="card-container border-l-4 border-l-primary flex flex-col justify-center">
              <div className="flex items-center text-textSecondary mb-2 font-medium">
                <Users className="h-4 w-4 mr-2" /> Total Users
              </div>
              <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-textSecondary mt-1">{stats?.totalRenters} Renters &bull; {stats?.totalOwners} Owners</p>
            </div>
            
            <div className="card-container border-l-4 border-l-secondary flex flex-col justify-center">
              <div className="flex items-center text-textSecondary mb-2 font-medium">
                <Home className="h-4 w-4 mr-2" /> Properties
              </div>
              <p className="text-3xl font-bold">{stats?.totalListings || 0}</p>
              <p className="text-xs text-textSecondary mt-1">{stats?.activeListings} Active</p>
            </div>

            <div className="card-container border-l-4 border-l-green-500 flex flex-col justify-center">
              <div className="flex items-center text-textSecondary mb-2 font-medium">
                <DollarSign className="h-4 w-4 mr-2" /> Revenue (KES)
              </div>
              <p className="text-3xl font-bold">{stats?.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-xs text-textSecondary mt-1">From {stats?.premiumSubscribers} Premium Users</p>
            </div>
            
            <Link to="/admin/users" className="card-container border-l-4 border-l-yellow-500 flex flex-col justify-center bg-yellow-50/50 hover:bg-yellow-50 group transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-textSecondary font-medium group-hover:text-yellow-700">
                  <ShieldAlert className="h-4 w-4 mr-2" /> Pending Approvals
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-700">{stats?.pendingApprovals || 0}</p>
              <p className="text-xs text-yellow-600 mt-1 font-semibold">Review & Approve</p>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center"><FileText className="mr-2 h-5 w-5 text-textSecondary" /> Recent Platform Activity</h3>
            <div className="space-y-4">
               <div className="flex gap-4 p-3 border border-border rounded-lg bg-surface relative">
                 <div className="h-10 w-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">M</div>
                 <div>
                   <p className="text-sm font-semibold">Martin requested Owner approval.</p>
                   <p className="text-xs text-textSecondary mt-1">10 minutes ago</p>
                 </div>
               </div>
               <div className="flex gap-4 p-3 border border-border rounded-lg bg-surface relative">
                 <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">H</div>
                 <div>
                   <p className="text-sm font-semibold">New property listed in Westlands.</p>
                   <p className="text-xs text-textSecondary mt-1">1 hour ago</p>
                 </div>
               </div>
               <div className="flex gap-4 p-3 border border-border rounded-lg bg-surface relative">
                 <div className="h-10 w-10 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold flex-shrink-0"><DollarSign className="h-4 w-4"/></div>
                 <div>
                   <p className="text-sm font-semibold">M-Pesa transaction #REF1234 complete.</p>
                   <p className="text-xs text-textSecondary mt-1">2 hours ago</p>
                 </div>
               </div>
            </div>
            <Link to="/admin/users" className="text-primary font-bold text-sm text-center block w-full mt-4">View Full Logs →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
