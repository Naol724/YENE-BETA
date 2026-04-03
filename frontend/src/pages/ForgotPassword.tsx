import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { forgotPasswordRequest } from '../services/authService';
import { isValidEmail } from '../utils/validation';
import { Home, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await forgotPasswordRequest(email.trim());
      setSubmitted(true);
      toast.success('If an account exists, check your email or the API console');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const d = err.response.data as { message?: string };
        if (d.message) setError(String(d.message));
        else setError('Request failed. Try again.');
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
        YENE BET
      </Link>

      <div className="w-full max-w-md card-container p-6 md:p-8 shadow-md">
        <h1 className="text-2xl font-bold text-textPrimary mb-1">Forgot password</h1>
        <p className="text-textSecondary text-sm mb-6">
          We&apos;ll email reset instructions if an account exists for that address.
        </p>

        {submitted ? (
          <div className="rounded-lg bg-green-50 border border-green-200 text-green-900 text-sm px-4 py-3 space-y-2">
            <p>
              If an account exists for that email, you will receive password reset instructions shortly.
            </p>
            <p className="text-green-800/90">
              When email is not configured on the server, check the API console for a reset link (development
              only).
            </p>
            <Link to="/login" className="font-semibold text-primary hover:underline inline-block mt-2">
              Back to sign in
            </Link>
          </div>
        ) : (
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
              <label htmlFor="forgot-email" className="block text-sm font-medium text-textPrimary mb-1.5">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-textSecondary">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
