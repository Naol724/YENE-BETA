import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Home, CreditCard, Shield, Clock, Edit, Trash2, Ban, RotateCcw } from 'lucide-react';
import { mockUsers, mockListings, mockTransactions } from '../data/mockData';
import Modal from '../components/Modal';

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState('listings');
    const [deleteModal, setDeleteModal] = useState(false);

    const user = mockUsers.find(u => u.id === id);
    if (!user) return <div className="empty-state"><h3>User not found</h3><button className="btn btn-outline" onClick={() => navigate('/users')}>Back to Users</button></div>;

    const userListings = mockListings.filter(l => l.ownerId === id);
    const userTx = mockTransactions.filter(t => t.userId === id);

    const loginHistory = [
        { ip: '41.90.64.1', device: 'Chrome / Windows', location: 'Nairobi, KE', time: '2024-03-27 08:12 AM', status: 'success' },
        { ip: '41.90.64.1', device: 'Mobile Safari / iOS', location: 'Nairobi, KE', time: '2024-03-25 06:45 PM', status: 'success' },
        { ip: '197.248.12.3', device: 'Chrome / Android', location: 'Mombasa, KE', time: '2024-03-22 11:30 AM', status: 'failed' },
    ];

    return (
        <div>
            <button className="btn btn-ghost" onClick={() => navigate('/users')} style={{ marginBottom: 20 }}>
                <ArrowLeft size={16} /> Back to Users
            </button>

            {/* Header */}
            <div className="user-detail-header">
                <div className="user-detail-avatar" style={{ color: user.avatarColor }}>{user.avatar}</div>
                <div className="user-detail-info" style={{ flex: 1 }}>
                    <h2>{user.name}</h2>
                    <p>{user.email} · {user.phone}</p>
                    <div className="user-detail-badges">
                        <span className={`badge badge-${user.role === 'owner' ? 'primary' : user.role === 'broker' ? 'purple' : 'gray'}`}>{user.role}</span>
                        <span className={`badge badge-${user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'error'}`}>{user.status}</span>
                        {user.isPremium && <span className="badge badge-warning">⭐ Premium</span>}
                        {user.isApproved && <span className="badge badge-success">✓ Verified</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <button className="btn btn-outline btn-sm"><Edit size={14} /> Edit</button>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}><Ban size={14} /> Suspend</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(true)}><Trash2 size={14} /> Delete</button>
                </div>
            </div>

            {/* Info Grid */}
            <div className="charts-grid" style={{ marginBottom: 20 }}>
                <div className="card">
                    <div className="card-header"><h3>Profile Details</h3></div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                { icon: <Mail size={14} />, label: 'Email', val: user.email },
                                { icon: <Phone size={14} />, label: 'Phone', val: user.phone },
                                { icon: <MapPin size={14} />, label: 'Location', val: user.location },
                                { icon: <Calendar size={14} />, label: 'Member Since', val: user.joinedDate },
                                { icon: <Home size={14} />, label: 'Listings', val: user.listings },
                                { icon: <Shield size={14} />, label: 'Approval', val: user.isApproved ? 'Approved' : 'Pending' },
                            ].map(f => (
                                <div key={f.label}>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{f.icon}{f.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 500 }}>{f.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><h3>Activity Summary</h3></div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                { label: 'Listings', val: userListings.length, color: 'var(--primary)' },
                                { label: 'Transactions', val: userTx.length, color: 'var(--success)' },
                                { label: 'Total Spent', val: `KES ${userTx.filter(t => t.status === 'completed').reduce((a, t) => a + t.amount, 0).toLocaleString()}`, color: 'var(--warning)' },
                                { label: 'Logins', val: loginHistory.length, color: 'var(--secondary)' },
                            ].map(s => (
                                <div key={s.label} style={{ padding: 16, background: 'var(--bg)', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
                {['listings', 'transactions', 'login history'].map(t => (
                    <div key={t} className={`detail-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</div>
                ))}
            </div>

            {tab === 'listings' && (
                <div className="card">
                    <div className="table-container">
                        {userListings.length === 0
                            ? <div className="empty-state"><Home size={36} /><h3>No listings</h3><p>This user has no property listings.</p></div>
                            : <table>
                                <thead><tr><th>Title</th><th>Location</th><th>Price</th><th>Status</th><th>Views</th></tr></thead>
                                <tbody>
                                    {userListings.map(l => (
                                        <tr key={l.id}>
                                            <td style={{ fontWeight: 600 }}>{l.title}</td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{l.location}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>KES {l.price.toLocaleString()}</td>
                                            <td><span className={`badge badge-${l.status === 'active' ? 'success' : l.status === 'pending' ? 'warning' : 'error'}`}>{l.status}</span></td>
                                            <td style={{ fontSize: 13 }}>{l.views}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        }
                    </div>
                </div>
            )}

            {tab === 'transactions' && (
                <div className="card">
                    <div className="table-container">
                        {userTx.length === 0
                            ? <div className="empty-state"><CreditCard size={36} /><h3>No transactions</h3></div>
                            : <table>
                                <thead><tr><th>Transaction ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                                <tbody>
                                    {userTx.map(t => (
                                        <tr key={t.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: 13 }}>#{t.id}</td>
                                            <td><span className="badge badge-primary">{t.type}</span></td>
                                            <td className={`tx-amount ${t.status}`}>KES {t.amount.toLocaleString()}</td>
                                            <td><span className={`badge badge-${t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'error'}`}>{t.status}</span></td>
                                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        }
                    </div>
                </div>
            )}

            {tab === 'login history' && (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead><tr><th>IP Address</th><th>Device</th><th>Location</th><th>Time</th><th>Status</th></tr></thead>
                            <tbody>
                                {loginHistory.map((l, i) => (
                                    <tr key={i}>
                                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{l.ip}</td>
                                        <td style={{ fontSize: 13 }}>{l.device}</td>
                                        <td style={{ fontSize: 13 }}>{l.location}</td>
                                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l.time}</td>
                                        <td><span className={`badge badge-${l.status === 'success' ? 'success' : 'error'}`}>{l.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete User"
                footer={<><button className="btn btn-outline" onClick={() => setDeleteModal(false)}>Cancel</button><button className="btn btn-danger" onClick={() => navigate('/users')}>Delete Permanently</button></>}>
                <div className="alert alert-error">Permanently delete <strong>{user.name}</strong>? All their data will be removed. This cannot be undone.</div>
            </Modal>
        </div>
    );
}
