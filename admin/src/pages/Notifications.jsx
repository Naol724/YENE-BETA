import { useState } from 'react';
import { Send, Users, User, Home, Bell, Check } from 'lucide-react';

const TARGETS = [
    { id: 'all', label: 'All Users', desc: 'Everyone on the platform' },
    { id: 'renters', label: 'Renters', desc: 'Looking for houses' },
    { id: 'owners', label: 'Owners', desc: 'Property owners' },
    { id: 'brokers', label: 'Brokers', desc: 'Real estate agents' },
    { id: 'premium', label: 'Premium Users', desc: 'Active subscriptions' },
    { id: 'pending', label: 'Pending Users', desc: 'Awaiting approval' },
];

const TYPES = [{ id: 'email', label: 'Email' }, { id: 'push', label: 'Push' }, { id: 'inapp', label: 'In-App' }];

const TEMPLATES = [
    { id: 't1', title: 'Welcome Message', subject: 'Welcome to House Rental Platform!', body: 'Welcome aboard! We\'re thrilled to have you on the House Rental Platform. Start exploring thousands of listings today.' },
    { id: 't2', title: 'Premium Promotion', subject: 'Upgrade to Premium — Special Offer!', body: 'List unlimited properties and get priority placement. Upgrade to Premium today for just KES 5,000/month.' },
    { id: 't3', title: 'Maintenance Notice', subject: 'Scheduled Maintenance — March 30', body: 'We will be performing scheduled maintenance on March 30 from 2AM–4AM EAT. Services will be temporarily unavailable.' },
];

export default function Notifications() {
    const [target, setTarget] = useState('all');
    const [notifType, setNotifType] = useState('email');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [schedule, setSchedule] = useState('now');
    const [sent, setSent] = useState(false);

    const loadTemplate = (t) => {
        setSubject(t.subject);
        setBody(t.body);
    };

    const handleSend = () => {
        if (!subject || !body) return;
        setSent(true);
        setTimeout(() => setSent(false), 3000);
        setSubject('');
        setBody('');
    };

    return (
        <div>
            <div className="page-header">
                <h1>Notification Management</h1>
                <p>Send broadcast notifications to platform users</p>
            </div>

            {sent && (
                <div className="alert alert-success">
                    <Check size={16} />
                    <div><strong>Notification sent successfully!</strong> Your message has been delivered to the selected audience.</div>
                </div>
            )}

            <div className="charts-grid">
                <div>
                    {/* Compose */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header"><h3>Compose Notification</h3></div>
                        <div className="card-body">
                            {/* Target Audience */}
                            <div className="form-group">
                                <label className="form-label">Target Audience</label>
                                <div className="notif-target-grid">
                                    {TARGETS.map(t => (
                                        <div key={t.id} className={`notif-target-item ${target === t.id ? 'selected' : ''}`} onClick={() => setTarget(t.id)}>
                                            <h4>{t.label}</h4>
                                            <p>{t.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Type */}
                            <div className="form-group">
                                <label className="form-label">Notification Type</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {TYPES.map(t => (
                                        <button key={t.id} className={`btn ${notifType === t.id ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setNotifType(t.id)}>
                                            <Bell size={14} /> {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input className="form-input" placeholder="Notification subject..." value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>

                            {/* Body */}
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <div className="rich-text-editor">
                                    <div className="editor-toolbar">
                                        {['B', 'I', 'U', 'H1', 'H2', '•'].map(f => (
                                            <button key={f} className="editor-btn">{f}</button>
                                        ))}
                                    </div>
                                    <textarea
                                        className="editor-area"
                                        style={{ width: '100%', border: 'none', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
                                        placeholder="Write your message here..."
                                        value={body}
                                        onChange={e => setBody(e.target.value)}
                                        rows={5}
                                    />
                                </div>
                            </div>

                            {/* Scheduling */}
                            <div className="form-group">
                                <label className="form-label">Send Time</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className={`btn ${schedule === 'now' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setSchedule('now')}>Send Now</button>
                                    <button className={`btn ${schedule === 'later' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setSchedule('later')}>Schedule Later</button>
                                </div>
                                {schedule === 'later' && (
                                    <input type="datetime-local" className="form-input" style={{ marginTop: 10 }} />
                                )}
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSend} disabled={!subject || !body}>
                                <Send size={16} /> {schedule === 'now' ? 'Send Notification' : 'Schedule Notification'}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    {/* Templates */}
                    <div className="card">
                        <div className="card-header">
                            <div><h3>Message Templates</h3><p>Load a pre-written template</p></div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {TEMPLATES.map(t => (
                                <div key={t.id} style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14, cursor: 'pointer', transition: 'var(--transition)' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                    onClick={() => loadTemplate(t)}>
                                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.title}</h4>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{t.body.substring(0, 80)}...</p>
                                    <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={(e) => { e.stopPropagation(); loadTemplate(t); }}>
                                        Load Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
