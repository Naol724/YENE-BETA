import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import api from '../utils/api';
import { login, normalizeApiUser } from '../store/authSlice';
import type { User } from '../store/authSlice';
import { Eye, EyeOff, Home, Loader2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { resettoken } = useParams<{ resettoken: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!resettoken) {
      setError('Invalid reset link');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post<{
        success: boolean;
        token?: string;
        user?: User;
        message?: string;
      }>(`/auth/reset-password/${resettoken}`, { password });

      if (!data.success || !data.token || !data.user) {
        setError(data.message ?? 'Reset failed');
        return;
      }

      const user = normalizeApiUser(data.user as Parameters<typeof normalizeApiUser>[0]);
      dispatch(login({ user, token: data.token }));
      if (user.role === 'OWNER') navigate('/owner', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const d = err.response.data as { message?: string };
        if (d.message) setError(String(d.message));
        else setError('Invalid or expired link.');
      } else {
        setError('Something went wrong. Try again.');
      }
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
        <h1 className="text-2xl font-bold text-textPrimary mb-1">Set new password</h1>
        <p className="text-textSecondary text-sm mb-6">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-lg bg-red-50 border border-error/30 text-error text-sm px-4 py-3"
              role="alert"
            >
              {error}
            </div>
          )}
          <div>
            <label htmlFor="reset-password" className="block text-sm font-medium text-textPrimary mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-11"
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="reset-confirm" className="block text-sm font-medium text-textPrimary mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="reset-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-field pr-11"
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating…
              </>
            ) : (
              'Update password'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textSecondary">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
