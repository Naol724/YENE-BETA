import { useState } from 'react';
import { BarChart3, Download, Calendar, Users, Home, DollarSign, Shield } from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { mockUserGrowthData, mockRevenueData, mockListingsData } from '../data/mockData';

const REPORT_TYPES = [
    { id: 'user', label: 'User Reports', desc: 'Growth, retention, distribution', icon: <Users size={18} /> },
    { id: 'listing', label: 'Listing Reports', desc: 'Activity, categories, pricing', icon: <Home size={18} /> },
    { id: 'financial', label: 'Financial Reports', desc: 'Revenue, payments, projections', icon: <DollarSign size={18} /> },
    { id: 'moderation', label: 'Moderation Reports', desc: 'Approvals, flags, admin actions', icon: <Shield size={18} /> },
];

const DATE_PRESETS = ['Today', 'Last 7 days', 'Last 30 days', 'This month', 'Custom'];

const PIE_DATA = [
    { name: 'Renters', value: 45 },
    { name: 'Owners', value: 35 },
    { name: 'Brokers', value: 20 },
];
const PIE_COLORS = ['#2563EB', '#10B981', '#7C3AED'];

export default function Reports() {
    const [selectedType, setSelectedType] = useState('user');
    const [datePreset, setDatePreset] = useState('Last 30 days');

    const handleExport = (fmt) => {
        alert(`Exporting ${selectedType} report as ${fmt}...`);
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Generate and export platform reports</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleExport('CSV')}><Download size={14} /> CSV</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleExport('PDF')}><Download size={14} /> PDF</button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleExport('Excel')}><Download size={14} /> Excel</button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><h3>Report Type</h3></div>
                <div className="card-body">
                    <div className="report-types">
                        {REPORT_TYPES.map(r => (
                            <div key={r.id} className={`report-type-item ${selectedType === r.id ? 'selected' : ''}`} onClick={() => setSelectedType(r.id)}>
                                <div style={{ color: 'var(--primary)', marginBottom: 8 }}>{r.icon}</div>
                                <h4>{r.label}</h4>
                                <p>{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Date Range */}
            <div className="filter-bar">
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                {DATE_PRESETS.map(p => (
                    <button key={p} className={`btn ${datePreset === p ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setDatePreset(p)}>{p}</button>
                ))}
            </div>

            {selectedType === 'user' && (
                <div>
                    <div className="charts-grid" style={{ marginBottom: 20 }}>
                        <div className="card">
                            <div className="chart-wrapper">
                                <div className="chart-header"><h3>User Growth by Role</h3></div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={mockUserGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
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
                                <div className="chart-header"><h3>User Distribution</h3></div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedType === 'listing' && (
                <div className="card">
                    <div className="chart-wrapper">
                        <div className="chart-header"><h3>Listing Activity</h3></div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockListingsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="listings" fill="#2563EB" radius={[4, 4, 0, 0]} name="Total" />
                                <Bar dataKey="premium" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Premium" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {selectedType === 'financial' && (
                <div className="card">
                    <div className="chart-wrapper">
                        <div className="chart-header"><h3>Revenue Overview</h3></div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mockRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} formatter={(v) => `KES ${v.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Actual Revenue" />
                                <Bar dataKey="projected" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Projected" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {selectedType === 'moderation' && (
                <div className="card">
                    <div className="card-header"><h3>Moderation Summary — {datePreset}</h3></div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            {[
                                { label: 'Approvals', val: 12, color: 'var(--success)', bg: 'var(--success-light)' },
                                { label: 'Rejections', val: 3, color: 'var(--error)', bg: 'var(--error-light)' },
                                { label: 'Listings Deleted', val: 2, color: 'var(--warning)', bg: 'var(--warning-light)' },
                                { label: 'Admin Actions', val: 27, color: 'var(--primary)', bg: 'var(--primary-light)' },
                            ].map(s => (
                                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: 20, textAlign: 'center' }}>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.val}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
