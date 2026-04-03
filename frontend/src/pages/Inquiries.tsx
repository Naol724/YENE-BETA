import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { RootState } from '../store';
import { Send, MessageSquare, Phone } from 'lucide-react';
import api from '../utils/api';
import MessageBubble from '../components/chat/MessageBubble';
import type { Inquiry, InquiryReply } from '../services/inquiries';
import {
  fetchInquiryThread,
  postInquiryReply,
  getThreadPreview,
  ownerHasUnread,
  renterHasUnread,
} from '../services/inquiries';
import DemoBanner from '../components/DemoBanner';
import BackNavButton from '../components/BackNavButton';
import { useInquiryRealtime } from '../hooks/useInquiryRealtime';
import { DEMO_INQUIRIES, isDemoInquiryId } from '../data/demoInquiries';

const POLL_MS = 20000;

function replySenderId(reply: InquiryReply): string {
  if (typeof reply.sender === 'object' && reply.sender && '_id' in reply.sender) {
    return String((reply.sender as { _id: string })._id);
  }
  return String(reply.sender);
}

function replyIsMe(reply: InquiryReply, inquiry: Inquiry, user: { id: string; role?: string } | null): boolean {
  if (!user) return false;
  const sid = replySenderId(reply);
  const ownerId = typeof inquiry.owner === 'object' ? String(inquiry.owner._id) : String(inquiry.owner);
  const renterId = typeof inquiry.renter === 'object' ? String(inquiry.renter._id) : String(inquiry.renter);
  if (user.role === 'OWNER') return sid === ownerId;
  if (user.role === 'RENTER') return sid === renterId;
  return sid === String(user.id);
}

function otherPartyName(inquiry: Inquiry, role: string | undefined): string {
  if (role === 'OWNER') {
    return typeof inquiry.renter === 'object' ? inquiry.renter.fullName : 'Renter';
  }
  return typeof inquiry.owner === 'object' ? inquiry.owner.fullName : 'Owner';
}

function propertyTitle(inquiry: Inquiry): string {
  return typeof inquiry.property === 'object' && inquiry.property?.title ? inquiry.property.title : 'Property';
}

const Inquiries: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const threadEndRef = useRef<HTMLDivElement>(null);

  const mergeIntoList = useCallback((updated: Inquiry) => {
    setInquiries((prev) => prev.map((x) => (x._id === updated._id ? { ...x, ...updated } : x)));
  }, []);

  const loadThread = useCallback(
    async (id: string, opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setThreadLoading(true);
        setThreadError(null);
      }
      try {
        const data = await fetchInquiryThread(id);
        setSelectedInquiry(data);
        mergeIntoList(data);
      } catch (err) {
        console.error(err);
        if (!opts?.silent) {
          setThreadError('Could not load conversation.');
        }
      } finally {
        if (!opts?.silent) {
          setThreadLoading(false);
        }
      }
    },
    [mergeIntoList]
  );

  const fetchInquiries = useCallback(async () => {
    try {
      const url = user?.role === 'OWNER' ? '/inquiries/received' : '/inquiries/my-inquiries';
      const res = await api.get<{ data: Inquiry[] }>(url);
      setFetchFailed(false);
      setInquiries(res.data.data);
    } catch (err) {
      console.error(err);
      setFetchFailed(true);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const displayInquiries =
    !loading && !fetchFailed && inquiries.length === 0 ? DEMO_INQUIRIES : inquiries;
  const showDemoMessages = !loading && !fetchFailed && inquiries.length === 0;

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    if (!selectedInquiry?._id || isDemoInquiryId(selectedInquiry._id)) return;

    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      loadThread(selectedInquiry._id, { silent: true });
    };

    const id = window.setInterval(tick, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [selectedInquiry?._id, loadThread]);

  useEffect(() => {
    if (!selectedInquiry?._id || isDemoInquiryId(selectedInquiry._id)) return;
    const onFocus = () => {
      loadThread(selectedInquiry._id, { silent: true });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [selectedInquiry?._id, loadThread]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedInquiry?.replies, selectedInquiry?.message, selectedInquiry?._id]);

  const handleSelect = (inq: Inquiry) => {
    setThreadError(null);
    if (isDemoInquiryId(inq._id)) {
      setSelectedInquiry(inq);
      return;
    }
    setSelectedInquiry(inq);
    void loadThread(inq._id);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyMessage.trim();
    if (!trimmed || !selectedInquiry) return;
    if (trimmed.length > 500) return;
    if (isDemoInquiryId(selectedInquiry._id)) {
      toast('Sample conversation — replies are not saved. Send inquiries on real listings to message owners.', {
        icon: 'ℹ️',
      });
      return;
    }
    try {
      const data = await postInquiryReply(selectedInquiry._id, trimmed);
      setSelectedInquiry(data);
      mergeIntoList(data);
      setReplyMessage('');
      void fetchInquiries();
      toast.success('Sent');
    } catch (err) {
      console.error(err);
      toast.error('Could not send message');
    }
  };

  const isUnread = (inq: Inquiry) => {
    if (user?.role === 'OWNER') return ownerHasUnread(inq);
    return renterHasUnread(inq);
  };

  const realtimeInquiryId = selectedInquiry?._id;
  const realtimeOk = Boolean(realtimeInquiryId && !isDemoInquiryId(realtimeInquiryId));

  useInquiryRealtime(realtimeInquiryId, realtimeOk, () => {
    if (realtimeInquiryId) void loadThread(realtimeInquiryId, { silent: true });
  });

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-100px)] overflow-hidden bg-slate-200/80 dark:bg-slate-950 animate-fade-in max-w-7xl mx-auto w-full rounded-none md:rounded-2xl md:my-2 md:shadow-xl border-0 md:border border-border dark:border-slate-700">
      {/* Conversation list */}
      <div
        className={`w-full md:w-[min(100%,380px)] lg:w-[400px] shrink-0 bg-white dark:bg-darksurface border-r border-border dark:border-slate-700 flex flex-col overflow-hidden ${selectedInquiry ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-4 border-b border-border dark:border-slate-700 bg-white dark:bg-darksurface shrink-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <h2 className="text-lg font-bold text-brandNavy dark:text-white">Chats</h2>
              <p className="text-xs text-textSecondary dark:text-darkmuted">Owners & renters</p>
            </div>
            <BackNavButton fallbackTo="/" />
          </div>
          {showDemoMessages && <DemoBanner />}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : fetchFailed ? (
            <div className="p-8 text-center text-textSecondary text-sm">Could not load messages. Try again later.</div>
          ) : displayInquiries.length === 0 ? (
            <div className="p-8 text-center text-textSecondary text-sm">No conversations yet.</div>
          ) : (
            <div className="divide-y divide-border/80 dark:divide-slate-700">
              {displayInquiries.map((inq) => {
                const preview = getThreadPreview(inq);
                const unread = isUnread(inq);
                return (
                  <div
                    key={inq._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(inq)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelect(inq);
                    }}
                    className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex gap-3 ${
                      selectedInquiry?._id === inq._id ? 'bg-brandTeal/10 border-l-4 border-brandTeal' : ''
                    } ${unread ? 'font-medium' : ''}`}
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-border dark:border-slate-600 relative shadow-sm">
                      <img
                        src={
                          typeof inq.property === 'object' && inq.property?.images?.[0]?.url
                            ? inq.property.images[0].url
                            : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
                        }
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      {unread && (
                        <span
                          className="absolute top-1 right-1 min-w-[10px] h-2.5 px-1 bg-brandTeal rounded-full border-2 border-white dark:border-darksurface"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h4 className="text-textPrimary dark:text-slate-100 truncate pr-2 font-semibold text-sm">
                          {user?.role === 'OWNER'
                            ? typeof inq.renter === 'object'
                              ? inq.renter.fullName
                              : 'Renter'
                            : typeof inq.property === 'object'
                              ? inq.property.title
                              : 'Property'}
                        </h4>
                        <span className="text-[10px] text-textSecondary whitespace-nowrap">
                          {new Date(preview.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-2 ${unread ? 'text-brandNavy dark:text-slate-200' : 'text-textSecondary'}`}>
                        {preview.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#e9eef5] dark:bg-slate-900 relative ${
          !selectedInquiry ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedInquiry ? (
          <>
            {/* Chat header */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-darksurface/95 backdrop-blur-md shadow-sm z-10">
              <button
                type="button"
                className="md:hidden p-2 -ml-2 rounded-lg text-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setSelectedInquiry(null)}
                aria-label="Back to conversations"
              >
                ←
              </button>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brandTeal to-brandNavy flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                {otherPartyName(selectedInquiry, user?.role)
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-brandNavy dark:text-white truncate">
                    {otherPartyName(selectedInquiry, user?.role)}
                  </h3>
                  {realtimeOk && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brandTeal bg-brandTeal/15 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-brandTeal animate-pulse" aria-hidden />
                      Live
                    </span>
                  )}
                </div>
                <p className="text-xs text-textSecondary dark:text-darkmuted truncate">{propertyTitle(selectedInquiry)}</p>
              </div>
              {typeof selectedInquiry.owner === 'object' && selectedInquiry.owner?.phone && user?.role === 'RENTER' && (
                <a
                  href={`tel:${selectedInquiry.owner.phone}`}
                  className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-border dark:border-slate-600 text-brandTeal hover:bg-slate-50 dark:hover:bg-slate-800"
                  aria-label="Call"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>

            {threadError && (
              <div className="px-4 py-2 text-sm text-red-700 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-900">
                {threadError}
              </div>
            )}

            {/* Messages */}
            <div
              className={`flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 min-h-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.4)_0%,transparent_40%),radial-gradient(ellipse_at_top,rgba(15,124,125,0.06),transparent_50%)] dark:bg-none`}
            >
              <div
                className={`max-w-3xl mx-auto space-y-4 ${threadLoading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <MessageBubble
                  sent={user?.role === 'RENTER'}
                  timestamp={new Date(selectedInquiry.createdAt).toLocaleString()}
                >
                  {selectedInquiry.message}
                </MessageBubble>

                {selectedInquiry.replies?.map((reply) => {
                  const isMe = replyIsMe(reply, selectedInquiry, user);
                  return (
                    <MessageBubble
                      key={reply._id ?? `${replySenderId(reply)}-${reply.createdAt}`}
                      sent={isMe}
                      showDelivered={isMe}
                      timestamp={new Date(reply.createdAt).toLocaleString()}
                    >
                      {reply.message}
                    </MessageBubble>
                  );
                })}
                <div ref={threadEndRef} />
              </div>
            </div>

            {/* Composer */}
            <div className="shrink-0 p-3 sm:p-4 bg-white/90 dark:bg-darksurface/95 border-t border-slate-200 dark:border-slate-700 backdrop-blur-md">
              <form onSubmit={handleReply} className="max-w-3xl mx-auto flex gap-2 items-end">
                <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 shadow-inner focus-within:ring-2 focus-within:ring-brandTeal/30 focus-within:border-brandTeal/50 transition-shadow">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type a message…"
                    maxLength={500}
                    className="w-full bg-transparent px-4 py-3 text-sm rounded-2xl outline-none text-textPrimary dark:text-slate-100 placeholder:text-textSecondary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="h-12 w-12 shrink-0 rounded-2xl bg-brandTeal text-white shadow-lg hover:bg-brandTealDark disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Send"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
              <p className="text-center text-[11px] text-textSecondary mt-2 max-w-3xl mx-auto">
                {replyMessage.trim().length}/500 · Messages sync in real time when the API is connected
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-textSecondary p-8 bg-slate-100/50 dark:bg-slate-900/50">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-semibold text-brandNavy dark:text-slate-200">Your messages</p>
            <p className="text-sm text-center mt-1 max-w-xs">Pick a conversation on the left or contact an owner from a listing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;
