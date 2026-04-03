import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2, ShieldCheck, Loader2, X, Download } from 'lucide-react';
import api from '../utils/api';

interface Tx {
  _id: string;
  amount: number;
  phoneNumber: string;
  referenceId: string;
  status: string;
  createdAt: string;
}

type UpgradeMode = 'simulated' | 'mpesa';

const PremiumUpgrade: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refId, setRefId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [mpesaPending, setMpesaPending] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/premium/transactions');
        setTransactions(res.data.data ?? []);
      } catch {
        /* unauthenticated or API down */
      }
    })();
  }, [success]);

  const startPremiumPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get('/premium/check-limit');
        if (res.data?.data?.isPremium) {
          stopPolling();
          setMpesaPending(false);
          setSuccess(true);
          setConfetti(true);
          setTimeout(() => setConfetti(false), 3500);
          try {
            const txRes = await api.get('/premium/transactions');
            setTransactions(txRes.data.data ?? []);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
    window.setTimeout(() => {
      stopPolling();
      setMpesaPending(false);
    }, 120000);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        mode?: UpgradeMode;
        message?: string;
        data?: { referenceId?: string };
      }>('/premium/upgrade', { phoneNumber, amount: 500 });

      if (!res.data.success) return;

      const mode = res.data.mode;
      const ref = res.data.data?.referenceId ?? '';

      if (mode === 'mpesa') {
        setRefId(ref);
        setMpesaMessage(res.data.message || 'Check your phone to approve the payment.');
        setMpesaPending(true);
        setShowModal(false);
        startPremiumPolling();
        return;
      }

      setRefId(ref);
      setSuccess(true);
      setShowModal(false);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3500);
    } catch (err) {
      console.error('Premium upgrade failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto text-center animate-fade-in relative pb-8">
        {confetti && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-lg animate-confetti-drop"
                style={{ left: `${(i * 4.2) % 100}%`, top: '-10%', animationDelay: `${i * 0.05}s` }}
              >
                ✨
              </span>
            ))}
          </div>
        )}
        <div className="h-24 w-24 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Premium Activated</h2>
        <p className="text-textSecondary mb-2">Transaction ref: {refId || '—'}</p>
        <p className="text-textSecondary mb-8 text-lg">Unlimited listings and premium tools are now unlocked.</p>
        <Link to="/owner" className="btn-primary w-full max-w-sm inline-flex justify-center">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (mpesaPending) {
    return (
      <div className="max-w-xl mx-auto text-center animate-fade-in space-y-6 pb-8">
        <div className="h-24 w-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold">Waiting for M-Pesa</h2>
        <p className="text-textSecondary">{mpesaMessage}</p>
        <p className="text-sm text-textSecondary">
          Approve the STK prompt on your phone. This page updates when payment is confirmed (up to 2 minutes).
        </p>
        {refId && <p className="font-mono text-xs text-textSecondary">Ref: {refId}</p>}
        <button
          type="button"
          className="text-primary font-semibold text-sm underline"
          onClick={() => {
            stopPolling();
            setMpesaPending(false);
          }}
        >
          Cancel waiting
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-10 pb-8">
      <div className="text-center">
        <h1 className="text-[28px] font-bold mb-2">Premium</h1>
        <p className="text-textSecondary max-w-xl mx-auto">
          KES 500 / month · Pay with M-Pesa when the API is configured, otherwise a dev simulation runs instantly.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="p-4 font-semibold">Feature</th>
              <th className="p-4 font-semibold text-center">Free</th>
              <th className="p-4 font-semibold text-center text-amber-700">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              ['Listings allowed', '1', 'Unlimited'],
              ['Featured placement', '—', '✓'],
              ['Verified badge', '—', '✓'],
              ['Priority support', '—', '✓'],
              ['Advanced analytics', 'Basic', 'Full'],
            ].map(([f, free, prem]) => (
              <tr key={String(f)}>
                <td className="p-4 font-medium">{f}</td>
                <td className="p-4 text-center text-textSecondary">{free}</td>
                <td className="p-4 text-center font-semibold text-primary">{prem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 bg-surface border border-border rounded-2xl p-8 w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Why upgrade</h2>
              <p className="text-textSecondary">Built for owners who list more than one home.</p>
            </div>
          </div>
          <ul className="space-y-3">
            {['Unlimited listings', 'Featured in search', 'Verified host badge', 'Richer analytics'].map((t) => (
              <li key={t} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 w-full bg-white border border-border rounded-2xl p-8 shadow-lg">
          <p className="text-3xl font-bold text-center mb-2">
            KES 500<span className="text-base font-normal text-textSecondary">/mo</span>
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary w-full h-14 text-lg bg-success hover:opacity-95 mt-4"
          >
            Upgrade with M-Pesa
          </button>
        </div>
      </div>

      {transactions.length > 0 && (
        <section aria-labelledby="pay-hist">
          <h2 id="pay-hist" className="text-xl font-semibold mb-4">
            Payment history
          </h2>
          <ul className="divide-y divide-border border border-border rounded-xl bg-white">
            {transactions.map((tx) => (
              <li key={tx._id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <div>
                  <p className="font-mono text-xs text-textSecondary">{tx.referenceId}</p>
                  <p className="text-textSecondary">{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">KES {tx.amount}</span>
                  <span className="text-success text-xs font-bold uppercase">{tx.status}</span>
                  <button type="button" className="p-2 rounded-lg border border-border hover:bg-surface" aria-label="Download receipt">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="mpesa-title">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button type="button" className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface" aria-label="Close" onClick={() => setShowModal(false)}>
              <X className="h-5 w-5" />
            </button>
            <h2 id="mpesa-title" className="text-xl font-bold mb-6 pr-10">
              M-Pesa Payment
            </h2>
            <form onSubmit={submitPayment}>
              <div className="mb-4">
                <label className="block font-semibold mb-2" htmlFor="mpesa-phone">
                  Phone number
                </label>
                <input
                  id="mpesa-phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="2517XXXXXXXX or 2547XXXXXXXX"
                  className="input-field text-lg tracking-wide"
                  required
                  pattern="(251|254)\d{9}"
                  title="Use international format: 251… (Ethiopia) or 254… (Kenya)"
                />
                <p className="text-xs text-textSecondary mt-2 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> STK push to this number when M-Pesa env is configured
                </p>
              </div>
              <div className="bg-surface p-4 rounded-xl mb-6 flex justify-between items-center">
                <span className="font-semibold text-textSecondary">Amount</span>
                <span className="text-2xl font-bold">KES 500</span>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full h-14 bg-success hover:opacity-95 disabled:opacity-60">
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin inline" /> Sending…
                  </>
                ) : (
                  'Pay now'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumUpgrade;
