import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShieldCheck, ShieldAlert, Trash2, Search } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id: string, status: boolean) => {
    try {
      await api.put(`/admin/users/${id}/approve`, { status });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in mt-16">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold">User Management</h2>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 h-10 w-full"
          />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-textSecondary text-sm uppercase tracking-wide">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-textSecondary animate-pulse">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-textSecondary">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-textPrimary">{user.fullName}</div>
                      <div className="text-xs text-textSecondary">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{user.email}</div>
                      <div className="text-xs text-textSecondary">{user.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${user.role==='OWNER'?'bg-blue-100 text-blue-700':user.role==='ADMIN'?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-700'}`}>
                        {user.role} {user.isPremium && '⭐'}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.isApproved ? (
                        <span className="flex items-center text-green-600 text-sm font-semibold"><ShieldCheck className="h-4 w-4 mr-1" /> Approved</span>
                      ) : (
                        <span className="flex items-center text-yellow-600 text-sm font-semibold"><ShieldAlert className="h-4 w-4 mr-1" /> Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'OWNER' && !user.isApproved && (
                          <button onClick={() => handleApprove(user._id, true)} className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 font-semibold rounded text-sm transition-colors">
                            Approve
                          </button>
                        )}
                        {user.role === 'OWNER' && user.isApproved && (
                          <button onClick={() => handleApprove(user._id, false)} className="px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-semibold rounded text-sm transition-colors">
                            Suspend
                          </button>
                        )}
                        <button onClick={() => handleDelete(user._id)} className="p-1 text-error hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
