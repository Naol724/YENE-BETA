import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Home, Star, DollarSign, Clock, UserCheck,
    TrendingUp, TrendingDown, RefreshCw, Eye, CheckCircle, AlertTriangle
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    mockDashboardStats, mockActivity, mockUserGrowthData,
    mockRevenueData, mockListingsData, mockUsers, mockListings
} from '../data/mockData';

export default function Dashboard() {
    const navigate = useNavigate();
    const [growthTab, setGrowthTab] = useState('Monthly');
    const [revTab, setRevTab] = useState('Monthly');
    const s = mockDashboardStats;

    const stats = [
        { label: 'Total Users', value: s.totalUsers, sub: `${s.userBreakdown.owners} owners · ${s.userBreakdown.brokers} brokers · ${s.userBreakdown.renters} renters`, icon: <Users size={20} />, iconBg: '#EFF6FF', iconColor: '#2563EB', trend: '+12%', up: true },
        { label: 'Total Listings', value: s.totalListings, sub: `${s.listingBreakdown.active} active · ${s.listingBreakdown.premium} premium`, icon: <Home size={20} />, iconBg: '#ECFDF5', iconColor: '#10B981', trend: '+8%', up: true },
        { label: 'Premium Users', value: s.premiumUsers, sub: 'Active premium subscriptions', icon: <Star size={20} />, iconBg: '#F5F3FF', iconColor: '#7C3AED', trend: '+2', up: true },
        { label: 'Total Revenue', value: `KES ${s.totalRevenue.toLocaleString()}`, sub: 'From premium subscriptions', icon: <DollarSign size={20} />, iconBg: '#FFFBEB', iconColor: '#F59E0B', trend: '+18%', up: true },
        { label: 'Pending Approvals', value: s.pendingApprovals, sub: 'Owners & brokers awaiting approval', icon: <Clock size={20} />, iconBg: '#FEF2F2', iconColor: '#EF4444', trend: 'Action needed', up: false, isAlert: true },
        { label: 'Verified Users', value: s.verifiedUsers, sub: 'Approved accounts', icon: <UserCheck size={20} />, iconBg: '#ECFDF5', iconColor: '#10B981', trend: '+4', up: true },
    ];

    return (
        <div>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of your house rental platform</p>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('/users/pending')}>
                    <Clock size={16} /> Review Pending Approvals ({s.pendingApprovals})
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/listings')}>
                    <Eye size={16} /> View All Listings
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/reports')}>
                    <TrendingUp size={16} /> Generate Report
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/notifications')}>
                    <AlertTriangle size={16} /> Send Notification
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
                            <div className={`stat-trend ${s.isAlert ? 'down' : s.up ? 'up' : 'neutral'}`}>
                                {s.up && !s.isAlert ? <TrendingUp size={12} /> : s.isAlert ? <AlertTriangle size={12} /> : <TrendingDown size={12} />}
                                {s.trend}
                            </div>
                        </div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-sub">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="card">
                    <div className="chart-wrapper">
                        <div className="chart-header">
                            <h3>User Growth</h3>
                            <div className="chart-tabs">
                                {['Weekly', 'Monthly', 'Yearly'].map(t => (
                                    <div key={t} className={`chart-tab ${growthTab === t ? 'active' : ''}`} onClick={() => setGrowthTab(t)}>{t}</div>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={mockUserGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="renters" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                                <Line type="monotone" dataKey="owners" stroke="#10B981" strokeWidth={2.5} dot={false} />
                                <Line type="monotone" dataKey="brokers" stroke="#7C3AED" strokeWidth={2.5} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="chart-wrapper">
                        <div className="chart-header">
                            <h3>Revenue</h3>
                            <div className="chart-tabs">
                                {['Weekly', 'Monthly'].map(t => (
                                    <div key={t} className={`chart-tab ${revTab === t ? 'active' : ''}`} onClick={() => setRevTab(t)}>{t}</div>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={mockRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2.5} />
                                <Area type="monotone" dataKey="projected" stroke="#7C3AED" fill="#F5F3FF" strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Listings chart + Activity */}
            <div className="charts-grid">
                <div className="card">
                    <div className="chart-wrapper">
                        <div className="chart-header"><h3>Listing Activity (This Week)</h3></div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={mockListingsData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="listings" fill="#2563EB" radius={[4, 4, 0, 0]} name="Total Listings" />
                                <Bar dataKey="premium" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Premium" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3>Recent Activity</h3>
                            <p>Real-time platform events</p>
                        </div>
                        <button className="btn-ghost btn"><RefreshCw size={14} /></button>
                    </div>
                    <div className="card-body" style={{ padding: '0 24px' }}>
                        <div className="activity-feed">
                            {mockActivity.map(a => (
                                <div key={a.id} className="activity-item">
                                    <div className="activity-dot" style={{ background: a.color }} />
                                    <div className="activity-content">
                                        <p>{a.text}</p>
                                        <span>{a.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Registrations + Listings */}
            <div className="charts-grid">
                <div className="card">
                    <div className="card-header">
                        <div><h3>Recent Registrations</h3><p>Latest users on the platform</p></div>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/users')}>View All</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
                            <tbody>
                                {mockUsers.slice(0, 4).map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="avatar" style={{ background: u.avatarColor + '20', color: u.avatarColor }}>{u.avatar}</div>
                                                <div>
                                                    <div className="user-name">{u.name}</div>
                                                    <div className="user-email">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`badge badge-${u.role === 'owner' ? 'primary' : u.role === 'broker' ? 'purple' : 'gray'}`}>{u.role}</span></td>
                                        <td><span className={`badge badge-${u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'error'}`}>{u.status}</span></td>
                                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.joinedDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div><h3>Recent Listings</h3><p>Latest property additions</p></div>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/listings')}>View All</button>
                    </div>
                    <div className="card-body" style={{ padding: '0 24px 12px' }}>
                        {mockListings.slice(0, 3).map(l => (
                            <div key={l.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ width: 56, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg)' }}>
                                    {l.image ? <img src={l.image} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Home size={18} color="var(--text-muted)" /></div>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{l.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.location}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 3 }}>KES {l.price.toLocaleString()}/mo</div>
                                </div>
                                {l.isPremium && <span className="badge badge-warning">Premium</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
