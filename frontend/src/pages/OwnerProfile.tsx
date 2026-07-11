import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { logout, updateUser } from '../store/authSlice';
import api from '../utils/api';
import { Star, LogOut, Loader2 } from 'lucide-react';

export default function OwnerProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [premiumInfo, setPremiumInfo] = useState<{
    isPremium: boolean;
    premiumExpiresAt?: string | null;
  } | null>(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [saving, setSaving] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, premRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/premium/check-limit'),
        ]);
        if (cancelled) return;
        const u = meRes.data.data as { fullName?: string; phone?: string };
        if (u?.fullName) setFullName(u.fullName);
        if (u?.phone) setPhone(u.phone);
        const p = premRes.data.data as { isPremium?: boolean; premiumExpiresAt?: string | null };
        setPremiumInfo({
          isPremium: !!p?.isPremium,
          premiumExpiresAt: p?.premiumExpiresAt ?? null,
        });
      } catch {
        /* use redux fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', { fullName, phone });
      const u = res.data.data as { fullName: string; phone?: string };
      dispatch(
        updateUser({
          fullName: u.fullName,
          phone: u.phone,
        })
      );
      alert('Profile updated');
    } catch (err) {
      console.error(err);
      alert('Could not update profile (is the API running?)');
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    dispatch(logout());
    setShowLogout(false);
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-8 text-textPrimary dark:text-slate-100">
      <h1 className="text-2xl sm:text-[28px] font-bold mb-2 text-textPrimary dark:text-white">Profile</h1>
      <p className="text-textSecondary dark:text-slate-400 text-sm mb-8">Manage your owner account</p>

      <form onSubmit={saveProfile} className="space-y-6 bg-white dark:bg-darksurface border border-border dark:border-slate-700 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-brandTeal/15 dark:bg-brandTeal/20 flex items-center justify-center text-2xl font-bold text-brandTealDark dark:text-brandTeal border-2 border-border dark:border-slate-600">
            {(fullName || user?.fullName || '?')[0]}
          </div>
          <div>
            <button
              type="button"
              className="text-sm font-semibold text-brandTealDark dark:text-brandTeal"
              onClick={() => api.post('/users/me/avatar').then(() => alert('Avatar upload is simulated in this build.'))}
            >
              Upload avatar
            </button>
            <p className="text-xs text-textSecondary dark:text-slate-400 mt-1">JPG or PNG, max 5MB</p>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold mb-1 text-textPrimary dark:text-slate-100">
            Full name
          </label>
          <input id="fullName" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-1 text-textPrimary dark:text-slate-100">
            Email
          </label>
          <input id="email" className="input-field bg-surface dark:bg-slate-800" readOnly value={user?.email ?? ''} aria-readonly />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold mb-1 text-textPrimary dark:text-slate-100">
            Phone
          </label>
          <input id="phone" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251…" />
        </div>
        <div>
          <label htmlFor="loc" className="block text-sm font-semibold mb-1 text-textPrimary dark:text-slate-100">
            Location (optional)
          </label>
          <input id="loc" className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold mb-1 text-textPrimary dark:text-slate-100">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            className="input-field !h-auto min-h-[80px] py-3"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="rounded-xl bg-surface dark:bg-slate-800/60 border border-border dark:border-slate-600 p-4 space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2 text-textPrimary dark:text-slate-100">
            Account status
            <span className={`text-xs px-2 py-0.5 rounded-full ${user?.isApproved ? 'bg-success/15 text-success' : 'bg-warning/25 text-textPrimary dark:text-amber-100'}`}>
              {user?.isApproved ? 'Approved' : 'Pending approval'}
            </span>
          </p>
          <p className="text-sm text-textSecondary dark:text-slate-400 flex flex-wrap items-center gap-2">
            Premium:{' '}
            <span className="font-medium text-textPrimary dark:text-slate-100 inline-flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500" />
              {premiumInfo?.isPremium ? 'Active' : 'Free plan'}
            </span>
            {premiumInfo?.isPremium && premiumInfo.premiumExpiresAt && (
              <span className="text-xs w-full sm:w-auto">
                Expires {new Date(premiumInfo.premiumExpiresAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        <fieldset className="border border-border dark:border-slate-600 rounded-xl p-4">
          <legend className="text-sm font-semibold px-1 text-textPrimary dark:text-slate-100">Notifications</legend>
          <label className="flex justify-between items-center py-2 text-textPrimary dark:text-slate-200">
            <span>Email notifications</span>
            <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
          </label>
          <label className="flex justify-between items-center py-2 text-textPrimary dark:text-slate-200">
            <span>Push notifications</span>
            <input type="checkbox" checked={pushNotif} onChange={(e) => setPushNotif(e.target.checked)} />
          </label>
        </fieldset>

        <div>
          <label htmlFor="lang" className="block text-sm font-semibold mb-1 text-textPrimary dark:text-slate-100">
            Language
          </label>
          <select
            id="lang"
            className="input-field"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
          >
            <option value="en">English</option>
            <option value="sw">Kiswahili</option>
          </select>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save changes'}
        </button>
      </form>

      <div className="mt-8 space-y-3 max-w-md">
        <button
          type="button"
          className="w-full sm:w-auto sm:min-w-[200px] h-12 px-6 rounded-lg border border-border dark:border-slate-600 font-medium text-textPrimary dark:text-slate-100 hover:bg-surface dark:hover:bg-slate-800"
        >
          Change password
        </button>
        <div className="flex flex-wrap gap-4 text-sm text-brandTealDark dark:text-brandTeal font-medium">
          <a href="/help" className="hover:underline">
            Help center
          </a>
          <a href="/support" className="hover:underline">
            Contact support
          </a>
          <a href="/terms" className="hover:underline">
            Terms of service
          </a>
        </div>
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="w-full sm:w-auto sm:min-w-[200px] h-12 px-6 rounded-lg border-2 border-error text-error font-semibold hover:bg-error/5 inline-flex items-center justify-center gap-2"
        >
          <LogOut className="h-5 w-5" /> Log out
        </button>
      </div>

      {showLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="alertdialog" aria-labelledby="logout-title">
          <div className="bg-white dark:bg-darksurface rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-border dark:border-slate-700 mx-3">
            <h2 id="logout-title" className="text-lg font-bold mb-2 text-textPrimary dark:text-white">
              Log out?
            </h2>
            <p className="text-textSecondary dark:text-slate-400 text-sm mb-4">You will need to sign in again to manage listings.</p>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button type="button" className="flex-1 btn-primary h-11" onClick={confirmLogout}>
                Log out
              </button>
              <button
                type="button"
                className="flex-1 h-11 rounded-lg border border-border dark:border-slate-600 font-medium text-textPrimary dark:text-slate-100"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
