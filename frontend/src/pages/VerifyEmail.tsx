import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { resendVerificationRequest, verifyEmailRequest } from '../services/authService';
import { Home, Loader2 } from 'lucide-react';
import { LanguageSelect, useI18n } from '../context/I18nContext';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const initialEmail =
    (location.state as { email?: string } | null)?.email?.trim() || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
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

  const handleResendOrUnlock = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError(t('verify.enterEmailFirst'));
      return;
    }
    setResending(true);
    try {
      const { data } = await resendVerificationRequest(email.trim());
      if (data.alreadyVerified) {
        setSuccess(true);
        setInfo(data.message ?? 'Your account is verified. You can sign in.');
        toast.success('Account verified — you can sign in');
        return;
      }
      if (data.emailDelivery) {
        setInfo(data.message ?? 'A new code was sent to your email.');
        toast.success('Code sent');
      } else {
        setInfo(
          data.message ??
            'Email could not be sent. If a code was generated, check the API terminal, or sign in again.'
        );
        toast(data.message ?? 'Check the message below');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
        const d = err.response.data as { message?: string };
        const msg = d.message ? String(d.message) : 'Could not resend code.';
        setError(msg);
        toast.error(msg);
      } else {
        setError('Could not resend code. Try again.');
        toast.error('Could not resend code');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-10 animate-fade-in">
      <div className="w-full max-w-md flex justify-end mb-4">
        <LanguageSelect />
      </div>
      <Link
        to="/"
        className="mb-8 text-2xl font-bold text-primary flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Home className="h-7 w-7" />
        YENE BET
      </Link>

      <div className="w-full max-w-md card-container p-6 md:p-8 shadow-md">
        <h1 className="text-2xl font-bold text-textPrimary mb-1">{t('verify.title')}</h1>
        <p className="text-textSecondary text-sm mb-6">{t('verify.subtitle')}</p>

        {success ? (
          <div className="space-y-4">
            <p className="text-textPrimary">{info ?? t('verify.success')}</p>
            <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full">
              {t('verify.continueLogin')}
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
            {info && (
              <div
                className="rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-sm px-4 py-3"
                role="status"
              >
                {info}
              </div>
            )}
            <div>
              <label htmlFor="verify-email" className="block text-sm font-medium text-textPrimary mb-1.5">
                {t('common.email')}
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
                {t('verify.code')}
              </label>
              <input
                id="verify-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                className="input-field"
                placeholder={t('verify.codePlaceholder')}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !otp.trim()}
              className="btn-primary w-full gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('verify.verifying')}
                </>
              ) : (
                t('verify.submit')
              )}
            </button>
            <button
              type="button"
              disabled={resending}
              onClick={handleResendOrUnlock}
              className="btn-secondary w-full gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('verify.working')}
                </>
              ) : (
                t('verify.resend')
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-textSecondary">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t('verify.backLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
