import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Bell, Users, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { mockAdminUsers, mockAuditLogs } from '../data/mockData';
import Modal from '../components/Modal';

export default function Settings() {
    const [tab, setTab] = useState('platform');
    const [toggles, setToggles] = useState({
        autoApproval: false,
        docVerification: true,
        autoModeration: false,
        mpesaSimulation: true,
        pushNotifications: true,
    });
    const [newAdminModal, setNewAdminModal] = useState(false);
    const [adminUsers, setAdminUsers] = useState(mockAdminUsers);
    const [auditFilter, setAuditFilter] = useState('all');

    const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

    const filteredLogs = auditFilter === 'all' ? mockAuditLogs : mockAuditLogs.filter(l => l.targetType === auditFilter);

    const roleLabel = { super_admin: 'Super Admin', moderator: 'Content Moderator', user_manager: 'User Manager', viewer: 'Viewer' };
    const roleBadge = { super_admin: 'secondary', moderator: 'primary', user_manager: 'success', viewer: 'gray' };

    return (
        <div>
            <div className="page-header">
                <h1>Settings</h1>
                <p>Configure platform settings, manage admin users, and review audit logs</p>
            </div>

            <div className="settings-tabs">
                {[['platform', SettingsIcon, 'Platform Settings'], ['admins', Users, 'Admin Users'], ['audit', Clock, 'Audit Logs']].map(([key, Icon, label]) => (
                    <div key={key} className={`settings-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                        <Icon size={15} style={{ display: 'inline', marginRight: 6 }} />{label}
                    </div>
                ))}
            </div>

            {/* Platform Settings */}
            {tab === 'platform' && (
                <div className="card">
                    <div className="card-body">
                        {/* General */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
                                <Sliders size={15} style={{ display: 'inline', marginRight: 6 }} /> General Settings
                            </h4>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Platform Name</label><input className="form-input" defaultValue="House Rental Platform" /></div>
                                <div className="form-group"><label className="form-label">Contact Email</label><input className="form-input" defaultValue="support@houserental.com" /></div>
                                <div className="form-group"><label className="form-label">Support Phone</label><input className="form-input" defaultValue="+254 700 000 000" /></div>
                                <div className="form-group"><label className="form-label">Premium Price (KES)</label><input className="form-input" type="number" defaultValue="5000" /></div>
                            </div>
                        </div>

                        {/* User Settings */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
                                <Users size={15} style={{ display: 'inline', marginRight: 6 }} /> User Settings
                            </h4>
                            {[
                                { key: 'autoApproval', label: 'Auto-Approval for Owners/Brokers', desc: 'Automatically approve new owner/broker accounts without manual review' },
                                { key: 'docVerification', label: 'Document Verification Required', desc: 'Require document upload before account approval' },
                            ].map(s => (
                                <div key={s.key} className="settings-row">
                                    <div className="settings-row-info"><h4>{s.label}</h4><p>{s.desc}</p></div>
                                    <div className={`toggle-switch ${toggles[s.key] ? 'on' : ''}`} onClick={() => toggle(s.key)} />
                                </div>
                            ))}
                        </div>

                        {/* Moderation */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
                                <Shield size={15} style={{ display: 'inline', marginRight: 6 }} /> Content Moderation
                            </h4>
                            {[
                                { key: 'autoModeration', label: 'Auto-Moderation', desc: 'Automatically flag listings with inappropriate keywords' },
                            ].map(s => (
                                <div key={s.key} className="settings-row">
                                    <div className="settings-row-info"><h4>{s.label}</h4><p>{s.desc}</p></div>
                                    <div className={`toggle-switch ${toggles[s.key] ? 'on' : ''}`} onClick={() => toggle(s.key)} />
                                </div>
                            ))}
                            <div className="settings-row">
                                <div className="settings-row-info"><h4>Max Images Per Listing</h4><p>Maximum number of images allowed per property listing</p></div>
                                <input className="form-input" type="number" defaultValue="10" style={{ width: 80 }} />
                            </div>
                            <div className="settings-row">
                                <div className="settings-row-info"><h4>Free Listings Per User</h4><p>Number of free listings allowed before premium required</p></div>
                                <input className="form-input" type="number" defaultValue="1" style={{ width: 80 }} />
                            </div>
                        </div>

                        {/* Payment */}
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
                                💳 Payment Settings
                            </h4>
                            {[
                                { key: 'mpesaSimulation', label: 'M-Pesa Simulation Mode', desc: 'Use simulated M-Pesa payments (disable in production)' },
                            ].map(s => (
                                <div key={s.key} className="settings-row">
                                    <div className="settings-row-info"><h4>{s.label}</h4><p>{s.desc}</p></div>
                                    <div className={`toggle-switch ${toggles[s.key] ? 'on' : ''}`} onClick={() => toggle(s.key)} />
                                </div>
                            ))}
                            <div className="settings-row">
                                <div className="settings-row-info"><h4>Tax Rate (%)</h4><p>Applied to premium subscription payments</p></div>
                                <input className="form-input" type="number" defaultValue="16" style={{ width: 80 }} />
                            </div>
                        </div>

                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button className="btn btn-outline">Reset to Defaults</button>
                            <button className="btn btn-primary">Save Settings</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Users */}
            {tab === 'admins' && (
                <div className="card">
                    <div className="card-header">
                        <div><h3>Admin Users</h3><p>Manage administrator accounts and permissions</p></div>
                        <button className="btn btn-primary btn-sm" onClick={() => setNewAdminModal(true)}><Plus size={14} /> Add Admin</button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Admin</th><th>Role</th><th>Status</th><th>MFA</th><th>Last Login</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {adminUsers.map(a => (
                                    <tr key={a.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="admin-avatar">{a.name[0]}</div>
                                                <div>
                                                    <div className="user-name">{a.name}</div>
                                                    <div className="user-email">{a.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`badge badge-${roleBadge[a.role]}`}>{roleLabel[a.role]}</span></td>
                                        <td><span className={`badge badge-${a.status === 'active' ? 'success' : 'error'}`}>{a.status}</span></td>
                                        <td><span className={`badge badge-${a.mfa ? 'success' : 'gray'}`}>{a.mfa ? '✓ Enabled' : 'Disabled'}</span></td>
                                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(a.lastLogin).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn-icon edit" title="Edit"><Edit size={14} /></button>
                                                {a.id !== '1' && <button className="btn-icon delete" title="Disable" onClick={() => setAdminUsers(prev => prev.map(u => u.id === a.id ? { ...u, status: 'disabled' } : u))}><Trash2 size={14} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Audit Logs */}
            {tab === 'audit' && (
                <div className="card">
                    <div className="card-header">
                        <div><h3>Audit Logs</h3><p>Complete log of all admin actions</p></div>
                        <select className="form-select" style={{ width: 160 }} value={auditFilter} onChange={e => setAuditFilter(e.target.value)}>
                            <option value="all">All Actions</option>
                            <option value="user">User Actions</option>
                            <option value="listing">Listing Actions</option>
                            <option value="setting">Settings Changes</option>
                            <option value="report">Report Exports</option>
                        </select>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Target</th><th>IP Address</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(l => (
                                    <tr key={l.id}>
                                        <td style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(l.date).toLocaleString()}</td>
                                        <td style={{ fontWeight: 600, fontSize: 13 }}>{l.admin}</td>
                                        <td>
                                            <div className="audit-action">
                                                <div className="audit-dot" style={{ background: l.targetType === 'user' ? '#2563EB' : l.targetType === 'listing' ? '#10B981' : l.targetType === 'setting' ? '#F59E0B' : '#7C3AED' }} />
                                                {l.action}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 13 }}>{l.target}</td>
                                        <td style={{ fontSize: 13, fontFamily: 'monospace' }}>{l.ip}</td>
                                        <td><span className={`badge badge-${l.status === 'success' ? 'success' : 'error'}`}>{l.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* New Admin Modal */}
            <Modal isOpen={newAdminModal} onClose={() => setNewAdminModal(false)} title="Create Admin User"
                footer={<><button className="btn btn-outline" onClick={() => setNewAdminModal(false)}>Cancel</button><button className="btn btn-primary" onClick={() => setNewAdminModal(false)}>Create Admin</button></>}>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Admin name..." /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="admin@houserental.com" /></div>
                <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select">
                        <option>Content Moderator</option>
                        <option>User Manager</option>
                        <option>Viewer</option>
                        <option>Super Admin</option>
                    </select>
                </div>
                <div className="form-group"><label className="form-label">Temporary Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
            </Modal>
        </div>
    );
}
