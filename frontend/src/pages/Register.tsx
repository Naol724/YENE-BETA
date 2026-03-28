import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, normalizeApiUser } from '../store/authSlice';
import type { User } from '../store/authSlice';
import api from '../utils/api';
import { friendlyAuthError } from '../utils/friendlyAuthError';
import { networkErrorHint, parseApiErrorMessage } from '../utils/parseApiError';
import { Home, Loader2 } from 'lucide-react';

function redirectAfterAuth(user: User, navigate: ReturnType<typeof useNavigate>) {
  if (user.role === 'OWNER') navigate('/owner');
  else navigate('/');
}

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'RENTER' | 'OWNER'>('RENTER');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post<{
        success: boolean;
        token: string;
        user: User;
        message?: string;
      }>('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });

      if (!data.success || !data.token || !data.user) {
        setError(friendlyAuthError(data.message ?? 'Could not create account'));
        return;
      }

      const user = normalizeApiUser(data.user as Parameters<typeof normalizeApiUser>[0]);
      dispatch(login({ user, token: data.token }));
      redirectAfterAuth(user, navigate);
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
        <h1 className="text-2xl font-bold text-textPrimary mb-1">Create your account</h1>
        <p className="text-textSecondary text-sm mb-6">Sign up to save homes and message owners</p>

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
            <label htmlFor="reg-name" className="block text-sm font-medium text-textPrimary mb-1.5">
              Full name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-textPrimary mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-phone" className="block text-sm font-medium text-textPrimary mb-1.5">
              Phone
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+254 …"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-textPrimary mb-2">How will you use HouseRental?</legend>
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="role"
                checked={role === 'RENTER'}
                onChange={() => setRole('RENTER')}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-textPrimary">I’m looking for a place</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="role"
                checked={role === 'OWNER'}
                onChange={() => setRole('OWNER')}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-textPrimary">I’m listing my property</span>
            </label>
          </fieldset>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-textPrimary mb-1.5">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="At least 8 characters"
              minLength={8}
            />
          </div>
          <div>
            <label
              htmlFor="reg-confirm"
              className="block text-sm font-medium text-textPrimary mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Repeat password"
              minLength={8}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account…
              </>
            ) : (
              'Sign up'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textSecondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
