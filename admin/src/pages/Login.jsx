import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setTimeout(() => {
            if (email === 'admin@houserental.com' && password === 'admin123') {
                onLogin();
            } else {
                setError('Invalid email or password. Try admin@houserental.com / admin123');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-icon">
                        <Home size={28} color="white" />
                    </div>
                    <h1>Admin Dashboard</h1>
                    <p>House Rental Platform</p>
                </div>

                {error && (
                    <div className="login-error">
                        <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="login-email"
                            type="email"
                            className="form-input"
                            placeholder="admin@houserental.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="login-password"
                                type={showPw ? 'text' : 'password'}
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: 44 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <span className="forgot-link" style={{ cursor: 'pointer' }}>Forgot password?</span>
                    <button
                        id="login-btn"
                        type="submit"
                        className={`btn btn-primary btn-lg`}
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-hint">
                    <strong>Demo credentials:</strong><br />
                    admin@houserental.com &nbsp;/&nbsp; admin123
                </div>
            </div>
        </div>
    );
}
