import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getPostAuthRedirectPath } from '../utils/authRedirectState';
import { useDispatch } from 'react-redux';
import { login, normalizeApiUser } from '../store/authSlice';
import type { User } from '../store/authSlice';
import toast from 'react-hot-toast';
import { loginRequest } from '../services/authService';
import { isValidEmail } from '../utils/validation';
import { friendlyAuthError } from '../utils/friendlyAuthError';
import { networkErrorHint, parseApiErrorMessage } from '../utils/parseApiError';
import { Eye, EyeOff, Home, Loader2 } from 'lucide-react';
import { LanguageSelect, useI18n } from '../context/I18nContext';

function redirectAfterAuth(
  user: User,
  navigate: ReturnType<typeof useNavigate>,
  fromPath?: string
) {
  if (fromPath && fromPath.startsWith('/')) {
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
  const { t } = useI18n();
  const fromPath = getPostAuthRedirectPath(location.state);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError(t('login.invalidEmail'));
      return;
    }
    if (password.length < 1) {
      setError(t('login.enterPassword'));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await loginRequest(email.trim(), password);

      if (!data.success || !data.token || !data.user) {
        setError(friendlyAuthError(data.message ?? t('login.failed')));
        return;
      }

      const user = normalizeApiUser(data.user as Parameters<typeof normalizeApiUser>[0]);
      dispatch(
        login({
          user,
          token: data.token,
          refreshToken: data.refreshToken ?? null,
        })
      );
      toast.success(t('login.welcomeBack', { name: user.fullName.split(' ')[0] }));
      redirectAfterAuth(user, navigate, fromPath);
    } catch (err: unknown) {
      const fromBody = parseApiErrorMessage(err);
      if (fromBody) {
        const friendly = friendlyAuthError(fromBody);
        setError(friendly);
        if (
          typeof err === 'object' &&
          err &&
          'response' in err &&
          (err as { response?: { data?: { code?: string }; status?: number } }).response?.data
            ?.code === 'EMAIL_NOT_VERIFIED'
        ) {
          navigate('/verify-email', { state: { email: email.trim() } });
        }
        return;
      }
      const net = networkErrorHint(err);
      if (net) {
        setError(net);
        return;
      }
      setError(t('common.tryAgain'));
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl font-bold text-textPrimary mb-1">{t('login.title')}</h1>
        <p className="text-textSecondary text-sm mb-6">{t('login.subtitle')}</p>

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
              {t('common.email')}
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
              {t('common.password')}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-11"
                placeholder="••••••••"
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
              >
                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              {t('login.forgot')}
            </Link>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('login.submitting')}
              </>
            ) : (
              t('login.submit')
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textSecondary">
          {t('login.noAccount')}{' '}
          <Link to="/register" state={location.state} className="font-semibold text-primary hover:underline">
            {t('login.createOne')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
