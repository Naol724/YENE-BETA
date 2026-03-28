import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Trash2, Check, X, UserPlus } from 'lucide-react';
import Modal from '../components/Modal';
import { mockUsers } from '../data/mockData';

export default function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(mockUsers);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [suspendModal, setSuspendModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [suspendDuration, setSuspendDuration] = useState('7');
    const [suspendReason, setSuspendReason] = useState('');

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const handleApprove = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isApproved: true, status: 'active' } : u));
    };

    const handleDelete = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        setDeleteModal(null);
    };

    const handleSuspend = () => {
        setUsers(prev => prev.map(u => u.id === suspendModal.id ? { ...u, status: 'suspended' } : u));
        setSuspendModal(null);
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                <div>
                    <h1>User Management</h1>
                    <p>Manage users, approve owners and brokers</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/users/pending')}>
                    <UserPlus size={16} /> Pending Approvals
                </button>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="input-with-icon" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={16} className="input-icon" />
                    <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="renter">Renter</option>
                    <option value="owner">Owner</option>
                    <option value="broker">Broker</option>
                </select>
                <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                </select>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} users</span>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Premium</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar" style={{ background: u.avatarColor + '20', color: u.avatarColor }}>{u.avatar}</div>
                                            <div>
                                                <div className="user-name">{u.name}</div>
                                                <div className="user-email">{u.email}</div>
                                                <div className="user-phone">{u.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`badge badge-${u.role === 'owner' ? 'primary' : u.role === 'broker' ? 'purple' : 'gray'}`}>{u.role}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8. }}>
                                            <span className={`badge badge-${u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'error'}`}>
                                                {u.isApproved ? '✓ ' : u.status === 'pending' ? '× ' : ''}{u.status}
                                            </span>
                                            {!u.isApproved && (u.role === 'owner' || u.role === 'broker') && (
                                                <button className="btn-icon approve" title="Approve" onClick={() => handleApprove(u.id)}><Check size={14} /></button>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {u.isPremium
                                            ? <span className="badge badge-warning">⭐ Premium</span>
                                            : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                                        }
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.joinedDate}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn-icon view" title="View Profile" onClick={() => navigate(`/users/${u.id}`)}><Eye size={15} /></button>
                                            {u.status !== 'suspended' && (
                                                <button className="btn-icon edit" title="Suspend" onClick={() => setSuspendModal(u)}><X size={15} /></button>
                                            )}
                                            <button className="btn-icon delete" title="Delete" onClick={() => setDeleteModal(u)}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="empty-state"><Users size={40} /><h3>No users found</h3><p>Try adjusting your search or filters</p></div>
                )}
            </div>

            {/* Suspend Modal */}
            <Modal
                isOpen={!!suspendModal}
                onClose={() => setSuspendModal(null)}
                title={`Suspend ${suspendModal?.name}`}
                footer={
                    <>
                        <button className="btn btn-outline" onClick={() => setSuspendModal(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={handleSuspend}>Suspend Account</button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Suspension Duration</label>
                    <select className="form-select" value={suspendDuration} onChange={e => setSuspendDuration(e.target.value)}>
                        <option value="1">1 Day</option>
                        <option value="7">7 Days</option>
                        <option value="30">30 Days</option>
                        <option value="permanent">Permanent</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Reason</label>
                    <select className="form-select" value={suspendReason} onChange={e => setSuspendReason(e.target.value)}>
                        <option value="">Select reason...</option>
                        <option>Inappropriate content</option>
                        <option>Fraudulent activity</option>
                        <option>Repeated violations</option>
                        <option>User complaint</option>
                        <option>Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <textarea className="form-input form-textarea" placeholder="Internal notes (optional)..." />
                </div>
            </Modal>

            {/* Delete Confirm */}
            <Modal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Delete User"
                footer={
                    <>
                        <button className="btn btn-outline" onClick={() => setDeleteModal(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(deleteModal.id)}>Delete Permanently</button>
                    </>
                }
            >
                <div className="alert alert-error">
                    Are you sure you want to permanently delete <strong>{deleteModal?.name}</strong>? This action cannot be undone.
                </div>
            </Modal>
        </div>
    );
}
