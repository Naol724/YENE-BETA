import { useState } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { mockTransactions } from '../data/mockData';

export default function Transactions() {
    const [txns, setTxns] = useState(mockTransactions);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');

    const filtered = txns.filter(t => {
        const matchSearch = t.userName.toLowerCase().includes(search.toLowerCase()) || t.userEmail.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchRole = roleFilter === 'all' || t.role === roleFilter;
        return matchSearch && matchStatus && matchRole;
    });

    const totalRevenue = filtered.filter(t => t.status === 'completed').reduce((a, t) => a + t.amount, 0);
    const pending = filtered.filter(t => t.status === 'pending').reduce((a, t) => a + t.amount, 0);
    const completed = filtered.filter(t => t.status === 'completed').length;

    const handleExport = () => {
        const csv = ['Transaction ID,User,Role,Amount,Type,Status,Method,Date',
            ...filtered.map(t => `#${t.id},${t.userName},${t.role},KES ${t.amount},${t.type},${t.status},${t.method},${new Date(t.date).toLocaleString()}`)
        ].join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'transactions.csv';
        a.click();
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Transactions</h1>
                    <p>Monitor payment transactions and revenue</p>
                </div>
                <button className="btn btn-primary" onClick={handleExport}><Download size={16} /> Export CSV</button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Total Revenue', val: `KES ${totalRevenue.toLocaleString()}`, icon: <CheckCircle size={20} />, bg: '#ECFDF5', color: '#10B981' },
                    { label: 'Pending Amount', val: `KES ${pending.toLocaleString()}`, icon: <Clock size={20} />, bg: '#FFFBEB', color: '#F59E0B' },
                    { label: 'Completed', val: completed, icon: <CheckCircle size={20} />, bg: '#EFF6FF', color: '#2563EB' },
                    { label: 'Total Transactions', val: filtered.length, icon: <CreditCard size={20} />, bg: '#F5F3FF', color: '#7C3AED' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        </div>
                        <div className="stat-value" style={{ fontSize: 22 }}>{s.val}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="input-with-icon" style={{ flex: 1 }}>
                    <Search size={16} className="input-icon" />
                    <input className="form-input" placeholder="Search by user name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
                <select className="form-select" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="owner">Owner</option>
                    <option value="broker">Broker</option>
                </select>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(t => (
                                <tr key={t.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>#{t.id}</td>
                                    <td>
                                        <div className="user-name">{t.userName}</div>
                                        <div className="user-email">{t.phone}</div>
                                    </td>
                                    <td><span className="badge badge-primary">{t.type}</span></td>
                                    <td className={`tx-amount ${t.status}`}>KES {t.amount.toLocaleString()}</td>
                                    <td>
                                        <span className="mpesa-badge">
                                            <CreditCard size={12} /> {t.method}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'error'}`}>
                                            {t.status === 'completed' ? '✓ ' : t.status === 'pending' ? '⏳ ' : '✗ '}{t.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                        {new Date(t.date).toLocaleDateString()}<br />
                                        <span style={{ fontSize: 11 }}>{new Date(t.date).toLocaleTimeString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div className="empty-state"><CreditCard size={40} /><h3>No transactions found</h3></div>}
            </div>
        </div>
    );
}
