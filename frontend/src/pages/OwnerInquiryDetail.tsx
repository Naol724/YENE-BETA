import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import api from '../utils/api';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { formatTimeAgo } from '../utils/timeAgo';

const QUEUE_KEY = 'owner-reply-queue';

function queueOfflineReply(inquiryId: string, message: string) {
  const raw = localStorage.getItem(QUEUE_KEY);
  const list = raw ? (JSON.parse(raw) as { inquiryId: string; message: string }[]) : [];
  list.push({ inquiryId, message });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(list));
}

export default function OwnerInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const online = useOnlineStatus();

  const [inquiry, setInquiry] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sentAnim, setSentAnim] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/inquiries/${id}`);
      let data = res.data.data;
      if (data?.status === 'Pending') {
        try {
          const r = await api.patch(`/inquiries/${id}`, { status: 'Read' });
          data = r.data.data;
        } catch {
          /* ignore */
        }
      }
      setInquiry(data);
    } catch (e) {
      console.error(e);
      setInquiry(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reply.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      alert('Reply must be between 10 and 500 characters.');
      return;
    }
    if (!id) return;
    if (!online) {
      queueOfflineReply(id, trimmed);
      setReply('');
      alert('You are offline. Your reply will be sent when you are back online.');
      return;
    }
    setSending(true);
    try {
      const res = await api.post(`/inquiries/${id}/reply`, { message: trimmed });
      setInquiry(res.data.data);
      setReply('');
      setSentAnim(true);
      setTimeout(() => setSentAnim(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const markResponded = async () => {
    if (!id) return;
    try {
      const res = await api.patch(`/inquiries/${id}`, { status: 'Responded' });
      setInquiry(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <p className="text-textSecondary text-sm">Loading inquiry…</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center py-16">
        <p className="text-textSecondary mb-4">Inquiry not found</p>
        <Link to="/owner/inquiries" className="text-primary font-semibold">
          Back to inquiries
        </Link>
      </div>
    );
  }

  const renter = inquiry.renter as { fullName?: string; phone?: string; email?: string } | undefined;
  const property = inquiry.property as { _id?: string; title?: string } | undefined;
  const replies = (inquiry.replies as { sender?: { _id?: string }; message?: string; createdAt?: string }[]) ?? [];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-textSecondary hover:text-primary mb-6"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </button>

      <header className="flex gap-4 mb-8">
        <div className="h-14 w-14 rounded-full bg-surface border border-border flex items-center justify-center text-xl font-bold text-textSecondary">
          {(renter?.fullName ?? '?')[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-textPrimary">{renter?.fullName ?? 'Renter'}</h1>
          {property?._id && (
            <Link
              to={`/house/${property._id}`}
              className="text-primary text-sm font-medium inline-flex items-center gap-1 hover:underline"
            >
              {property.title} <ExternalLink className="h-3 w-3" />
            </Link>
          )}
          <p className="text-xs text-textSecondary mt-1">
            Received {inquiry.createdAt ? formatTimeAgo(String(inquiry.createdAt)) : ''}
          </p>
          <span
            className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${
              inquiry.status === 'Pending'
                ? 'bg-error/15 text-error'
                : inquiry.status === 'Read'
                  ? 'bg-warning/25 text-textPrimary'
                  : 'bg-success/15 text-success'
            }`}
          >
            {inquiry.status === 'Pending' ? 'New' : String(inquiry.status)}
          </span>
        </div>
      </header>

      <section className="rounded-xl border border-border bg-surface p-4 mb-6" aria-label="Contact information">
        <h2 className="text-sm font-semibold text-textSecondary mb-3">Contact</h2>
        <div className="flex flex-wrap gap-3">
          {renter?.phone && (
            <a
              href={`tel:${renter.phone}`}
              className="inline-flex items-center gap-2 btn-primary !h-10 !text-sm"
              aria-label={`Call ${renter.phone}`}
            >
              <Phone className="h-4 w-4" /> Call
            </a>
          )}
          {renter?.email && (
            <a
              href={`mailto:${renter.email}`}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-white font-medium text-sm hover:bg-surface"
              aria-label={`Email ${renter.email}`}
            >
              <Mail className="h-4 w-4" /> Email
            </a>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 mb-6" aria-label="Original message">
        <h2 className="text-sm font-semibold text-textSecondary mb-2">Message</h2>
        <p className="text-textPrimary whitespace-pre-wrap leading-relaxed">{String(inquiry.message ?? '')}</p>
      </section>

      {replies.length > 0 && (
        <section className="space-y-3 mb-6" aria-label="Conversation history">
          <h2 className="text-sm font-semibold text-textSecondary">Conversation</h2>
          {replies.map((r, idx) => {
            const sid = r.sender && typeof r.sender === 'object' && '_id' in r.sender ? String((r.sender as { _id: string })._id) : String(r.sender);
            const isMe = user?.id && sid === user.id;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl max-w-[95%] ${isMe ? 'ml-auto bg-primary text-white' : 'bg-surface border border-border'}`}
              >
                <p className="whitespace-pre-wrap">{r.message}</p>
                <p className={`text-xs mt-2 ${isMe ? 'text-blue-100' : 'text-textSecondary'}`}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                </p>
              </div>
            );
          })}
        </section>
      )}

      <form onSubmit={sendReply} className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <label htmlFor="reply" className="block text-sm font-semibold mb-2">
          Your reply
        </label>
        <textarea
          id="reply"
          className="w-full border border-border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-primary"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          minLength={10}
          maxLength={500}
          placeholder="Write at least 10 characters…"
          aria-describedby="reply-hint"
        />
        <p id="reply-hint" className="text-xs text-textSecondary mt-1">
          {reply.length}/500
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button type="submit" disabled={sending || reply.trim().length < 10} className="btn-primary flex items-center gap-2">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : sentAnim ? <CheckCircle2 className="h-5 w-5 text-white" /> : null}
            Send reply
          </button>
          <button
            type="button"
            onClick={markResponded}
            className="h-12 px-4 rounded-lg border border-border font-medium hover:bg-surface"
          >
            Mark as responded
          </button>
        </div>
        {!online && <p className="text-warning text-sm mt-2">Offline — replies are queued for sync.</p>}
      </form>
    </div>
  );
}
