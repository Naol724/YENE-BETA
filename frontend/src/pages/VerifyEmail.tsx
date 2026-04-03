import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { verifyEmailRequest } from '../services/authService';
import { Home, Loader2 } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail =
    (location.state as { email?: string } | null)?.email?.trim() || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await verifyEmailRequest(email.trim(), otp.trim());
      if (data.success) {
        setSuccess(true);
        toast.success('Email verified');
      } else {
        setError(data.message ?? 'Verification failed');
        toast.error(data.message ?? 'Verification failed');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const d = err.response.data as { message?: string };
        const msg = d.message ? String(d.message) : 'Invalid or expired code.';
        setError(msg);
        toast.error(msg);
      } else {
        setError('Something went wrong. Try again.');
        toast.error('Something went wrong');
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
        <h1 className="text-2xl font-bold text-textPrimary mb-1">Verify your email</h1>
        <p className="text-textSecondary text-sm mb-6">
          Enter the code shown in your API server terminal after registration. Codes expire in 10 minutes.
        </p>

        {success ? (
          <div className="space-y-4">
            <p className="text-textPrimary">Your email is verified.</p>
            <button type="button" onClick={() => navigate('/')} className="btn-primary w-full">
              Continue to home
            </button>
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
              <label htmlFor="verify-email" className="block text-sm font-medium text-textPrimary mb-1.5">
                Email
              </label>
              <input
                id="verify-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="verify-otp" className="block text-sm font-medium text-textPrimary mb-1.5">
                Verification code
              </label>
              <input
                id="verify-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                className="input-field"
                placeholder="6-digit code"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify'
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

export default VerifyEmail;
