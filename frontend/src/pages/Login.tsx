import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, normalizeApiUser } from '../store/authSlice';
import type { User } from '../store/authSlice';
import api from '../utils/api';
import { friendlyAuthError } from '../utils/friendlyAuthError';
import { networkErrorHint, parseApiErrorMessage } from '../utils/parseApiError';
import { Home, Loader2 } from 'lucide-react';

function redirectAfterAuth(
  user: User,
  navigate: ReturnType<typeof useNavigate>,
  fromPath?: string
) {
  if (fromPath) {
    navigate(fromPath, { replace: true });
    return;
  }
  if (user.role === 'OWNER') navigate('/owner');
  else navigate('/');
}

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post<{
        success: boolean;
        token: string;
        user: User;
        message?: string;
      }>('/auth/login', { email: email.trim(), password });

      if (!data.success || !data.token || !data.user) {
        setError(friendlyAuthError(data.message ?? 'Could not sign in'));
        return;
      }

      const user = normalizeApiUser(data.user as Parameters<typeof normalizeApiUser>[0]);
      dispatch(login({ user, token: data.token }));
      redirectAfterAuth(user, navigate, fromPath);
    } catch (err: unknown) {
      const fromBody = parseApiErrorMessage(err);
      if (fromBody) {
        setError(friendlyAuthError(fromBody));
        return;
      }
      const net = networkErrorHint(err);
      if (net) {
        setError(net);
        return;
      }
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-10 animate-fade-in">
      <Link
        to="/"
        className="mb-8 text-2xl font-bold text-primary flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Home className="h-7 w-7" />
        HouseRental
      </Link>

      <div className="w-full max-w-md card-container p-6 md:p-8 shadow-md">
        <h1 className="text-2xl font-bold text-textPrimary mb-1">Welcome back</h1>
        <p className="text-textSecondary text-sm mb-6">Sign in to continue</p>

        {error && (
          <div
            className="mb-4 rounded-lg bg-red-50 border border-error/30 text-error text-sm px-4 py-3"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-textPrimary mb-1.5">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-textPrimary mb-1.5">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textSecondary">
          No account yet?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
