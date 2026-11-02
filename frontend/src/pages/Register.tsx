import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getPostAuthRedirectPath } from '../utils/authRedirectState';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { login, normalizeApiUser } from '../store/authSlice';
import type { User } from '../store/authSlice';
import toast from 'react-hot-toast';
import { registerRequest } from '../services/authService';
import { isValidEmail, isValidPhoneLoose } from '../utils/validation';
import { friendlyAuthError } from '../utils/friendlyAuthError';
import { networkErrorHint, parseApiErrorMessage } from '../utils/parseApiError';
import { Eye, EyeOff, Home, Loader2 } from 'lucide-react';
import { LanguageSelect, useI18n } from '../context/I18nContext';

function redirectAfterAuth(
  user: User,
  navigate: ReturnType<typeof useNavigate>,
  path?: string
) {
  if (path && path.startsWith('/')) {
    navigate(path, { replace: true });
    return;
  }
  if (user.role === 'OWNER') navigate('/owner');
  else navigate('/');
}

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const postAuthPath = getPostAuthRedirectPath(location.state);
  const authUser = useSelector((s: RootState) => s.auth.user);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'RENTER' | 'OWNER'>('RENTER');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('register.passwordShort'));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t('login.invalidEmail'));
      return;
    }
    if (!isValidPhoneLoose(phone)) {
      setError(t('register.invalidPhone'));
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await registerRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });

      if (!data.success || !data.token || !data.user) {
        setError(friendlyAuthError(data.message ?? t('register.failed')));
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
      const alreadyVerified =
        typeof data.user === 'object' &&
        data.user != null &&
        'isEmailVerified' in data.user &&
        Boolean((data.user as { isEmailVerified?: boolean }).isEmailVerified);
      if (alreadyVerified) {
        toast.success(t('register.success'));
        redirectAfterAuth(user, navigate, postAuthPath);
        return;
      }
      setRegisteredEmail(user.email);
      setRegisterSuccessMessage(data.message ?? null);
      toast.success(t('register.success'));
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
      setError(t('common.tryAgain'));
    } finally {
      setSubmitting(false);
    }
  };

  const finishRegistration = () => {
    if (authUser) redirectAfterAuth(authUser, navigate, postAuthPath);
  };

  if (registeredEmail) {
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

        <div className="w-full max-w-md card-container p-6 md:p-8 shadow-md space-y-4">
          <h1 className="text-2xl font-bold text-textPrimary">{t('register.successTitle')}</h1>
          <p className="text-textSecondary text-sm">
            {registerSuccessMessage ?? t('register.successBody')}
          </p>
          <Link
            to="/verify-email"
            state={{ email: registeredEmail }}
            className="btn-primary w-full text-center block"
          >
            {t('register.enterCode')}
          </Link>
          <button type="button" onClick={finishRegistration} className="btn-secondary w-full">
            {t('register.continueApp')}
          </button>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-textPrimary mb-1">{t('register.title')}</h1>
        <p className="text-textSecondary text-sm mb-6">{t('register.subtitle')}</p>

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
              {t('common.fullName')}
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder={t('register.namePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-textPrimary mb-1.5">
              {t('common.email')}
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
              {t('common.phone')}
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+251 913678845"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-textPrimary mb-2">{t('register.roleLegend')}</legend>
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="role"
                checked={role === 'RENTER'}
                onChange={() => setRole('RENTER')}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-textPrimary">{t('register.roleRenter')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="role"
                checked={role === 'OWNER'}
                onChange={() => setRole('OWNER')}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-textPrimary">{t('register.roleOwner')}</span>
            </label>
          </fieldset>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-textPrimary mb-1.5">
              {t('common.password')}
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-11"
                placeholder={t('register.passwordHint')}
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
          <div>
            <label
              htmlFor="reg-confirm"
              className="block text-sm font-medium text-textPrimary mb-1.5"
            >
              {t('register.confirmPassword')}
            </label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-11"
                placeholder={t('register.repeatPassword')}
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={
                  showConfirmPassword ? t('common.hidePassword') : t('common.showPassword')
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('register.submitting')}
              </>
            ) : (
              t('register.submit')
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textSecondary">
          {t('register.hasAccount')}{' '}
          <Link to="/login" state={location.state} className="font-semibold text-primary hover:underline">
            {t('register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
