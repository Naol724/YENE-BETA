import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Check, X, Mail, User, Phone, MapPin, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { mockUsers } from '../data/mockData';

export default function PendingApprovals() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(mockUsers.filter(u => !u.isApproved && (u.role === 'owner' || u.role === 'broker')));
    const [rejectModal, setRejectModal] = useState(null);
    const [approveModal, setApproveModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectNote, setRejectNote] = useState('');

    const handleApprove = () => {
        setUsers(prev => prev.filter(u => u.id !== approveModal.id));
        setApproveModal(null);
    };

    const handleReject = () => {
        setUsers(prev => prev.filter(u => u.id !== rejectModal.id));
        setRejectModal(null);
        setRejectReason('');
        setRejectNote('');
    };

    const daysSince = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div>
            <div className="page-header">
                <h1>Pending Approvals</h1>
                <p>Review and approve owner and broker registrations</p>
            </div>

            {users.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Check size={48} color="var(--success)" />
                        <h3>All caught up!</h3>
                        <p>No pending approvals at this time.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="alert alert-warning">
                        <Clock size={16} />
                        <div><strong>{users.length} pending approval{users.length > 1 ? 's' : ''}</strong> — review and approve or reject new owner and broker accounts.</div>
                    </div>
                    <div className="approval-grid">
                        {users.map(u => {
                            const days = daysSince(u.joinedDate);
                            return (
                                <div key={u.id} className={`approval-card ${days > 3 ? 'priority-high' : ''}`}>
                                    <div className="approval-card-header">
                                        <div className="approval-avatar" style={{ color: u.avatarColor }}>{u.avatar}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 16 }}>{u.name}</div>
                                            <span className={`badge badge-${u.role === 'owner' ? 'primary' : 'purple'}`} style={{ marginTop: 4 }}>{u.role}</span>
                                            {days > 3 && <span className="badge badge-warning" style={{ marginLeft: 6 }}>⚠ {days} days waiting</span>}
                                        </div>
                                    </div>
                                    <div className="approval-card-body">
                                        <div className="approval-info">
                                            <div className="approval-field">
                                                <label><Mail size={11} style={{ display: 'inline' }} /> Email</label>
                                                <p>{u.email}</p>
                                            </div>
                                            <div className="approval-field">
                                                <label><Phone size={11} style={{ display: 'inline' }} /> Phone</label>
                                                <p>{u.phone}</p>
                                            </div>
                                            <div className="approval-field">
                                                <label><MapPin size={11} style={{ display: 'inline' }} /> Location</label>
                                                <p>{u.location}</p>
                                            </div>
                                            <div className="approval-field">
                                                <label><Calendar size={11} style={{ display: 'inline' }} /> Registered</label>
                                                <p>{u.joinedDate}</p>
                                            </div>
                                        </div>
                                        <div className="approval-actions">
                                            <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setApproveModal(u)}>
                                                <Check size={15} /> Approve
                                            </button>
                                            <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRejectModal(u)}>
                                                <X size={15} /> Reject
                                            </button>
                                            <button className="btn btn-outline btn-sm" onClick={() => navigate(`/users/${u.id}`)}>
                                                <User size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Approve Modal */}
            <Modal
                isOpen={!!approveModal}
                onClose={() => setApproveModal(null)}
                title="Approve User"
                footer={
                    <>
                        <button className="btn btn-outline" onClick={() => setApproveModal(null)}>Cancel</button>
                        <button className="btn btn-success" onClick={handleApprove}>Confirm Approval</button>
                    </>
                }
            >
                <div className="alert alert-success">
                    Are you sure you want to approve <strong>{approveModal?.name}</strong> as a{approveModal?.role === 'owner' ? 'n' : ''} {approveModal?.role}? They will receive a welcome email and can start listing properties.
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={!!rejectModal}
                onClose={() => { setRejectModal(null); setRejectReason(''); setRejectNote(''); }}
                title={`Reject ${rejectModal?.name}`}
                footer={
                    <>
                        <button className="btn btn-outline" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Cancel</button>
                        <button className="btn btn-danger" onClick={handleReject} disabled={!rejectReason}>Send Rejection</button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Rejection Reason *</label>
                    <select className="form-select" value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                        <option value="">Select a reason...</option>
                        <option>Incomplete information</option>
                        <option>Invalid documentation</option>
                        <option>Duplicate account</option>
                        <option>Suspicious activity</option>
                        <option>Other (please specify)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Custom Message (Optional)</label>
                    <textarea className="form-input form-textarea" placeholder="Additional message to user..." value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>The user will receive an email notification with the rejection reason and may re-apply with corrected information.</p>
            </Modal>
        </div>
    );
}
