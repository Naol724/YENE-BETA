import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Send, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import type { Inquiry } from '../services/inquiries';
import {
  fetchInquiryThread,
  postInquiryReply,
  getThreadPreview,
  ownerHasUnread,
  renterHasUnread
} from '../services/inquiries';

const POLL_MS = 20000;

const Inquiries: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

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
      setInquiries(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    if (!selectedInquiry?._id) return;

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
    if (!selectedInquiry?._id) return;
    const onFocus = () => {
      loadThread(selectedInquiry._id, { silent: true });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [selectedInquiry?._id, loadThread]);

  const handleSelect = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    void loadThread(inq._id);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyMessage.trim();
    if (!trimmed || !selectedInquiry) return;
    if (trimmed.length > 500) return;
    try {
      const data = await postInquiryReply(selectedInquiry._id, trimmed);
      setSelectedInquiry(data);
      mergeIntoList(data);
      setReplyMessage('');
      fetchInquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const isUnread = (inq: Inquiry) => {
    if (user?.role === 'OWNER') return ownerHasUnread(inq);
    return renterHasUnread(inq);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] pb-16 md:pb-0 overflow-hidden bg-surface animate-fade-in">
      <div
        className={`w-full md:w-1/3 bg-white border-r border-border overflow-y-auto ${selectedInquiry ? 'hidden md:block' : 'block'}`}
      >
        <div className="p-4 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>

        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center text-textSecondary">No messages yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {inquiries.map((inq) => {
              const preview = getThreadPreview(inq);
              const unread = isUnread(inq);
              return (
                <div
                  key={inq._id}
                  onClick={() => handleSelect(inq)}
                  className={`p-4 cursor-pointer hover:bg-surface transition-colors flex gap-3 ${
                    selectedInquiry?._id === inq._id ? 'bg-primary/5 border-l-4 border-primary' : ''
                  } ${unread ? 'font-medium' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-border relative">
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
                        className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-white"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className="text-textPrimary truncate pr-2 font-semibold">
                        {user?.role === 'OWNER'
                          ? typeof inq.renter === 'object'
                            ? inq.renter.fullName
                            : 'Renter'
                          : typeof inq.property === 'object'
                            ? inq.property.title
                            : 'Property'}
                      </h4>
                      <span className="text-[10px] text-textSecondary whitespace-nowrap">
                        {new Date(preview.at).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-1 ${unread ? 'text-textPrimary' : 'text-textSecondary'}`}>
                      {preview.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className={`flex-1 flex flex-col bg-slate-50 relative ${!selectedInquiry ? 'hidden md:flex' : 'flex'}`}
      >
        {selectedInquiry ? (
          <>
            <div className="h-16 border-b border-border bg-white flex items-center px-4 md:px-6 shadow-sm z-10">
              <button
                type="button"
                className="md:hidden mr-4 p-2 text-textSecondary"
                onClick={() => setSelectedInquiry(null)}
              >
                ← Back
              </button>
              <div className="font-semibold">
                {user?.role === 'OWNER'
                  ? typeof selectedInquiry.renter === 'object'
                    ? selectedInquiry.renter.fullName
                    : 'Renter'
                  : typeof selectedInquiry.owner === 'object'
                    ? selectedInquiry.owner.fullName
                    : 'Owner'}
              </div>
            </div>

            {threadError && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-100">{threadError}</div>
            )}

            <div
              className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 ${threadLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <div className="flex justify-start">
                <div className="bg-white border border-border p-4 rounded-xl rounded-tl-none shadow-sm max-w-[80%]">
                  <p className="text-textPrimary">{selectedInquiry.message}</p>
                  <span className="text-xs text-textSecondary mt-2 block">
                    {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedInquiry.replies?.map((reply) => {
                const senderId =
                  typeof reply.sender === 'object' && reply.sender && '_id' in reply.sender
                    ? String((reply.sender as { _id: string })._id)
                    : String(reply.sender);
                const isMe = senderId === String(user?.id);
                return (
                  <div key={reply._id ?? `${senderId}-${reply.createdAt}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`p-4 rounded-xl shadow-sm max-w-[80%] ${
                        isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-border rounded-tl-none'
                      }`}
                    >
                      <p>{reply.message}</p>
                      <span
                        className={`text-xs mt-2 block ${isMe ? 'text-blue-100' : 'text-textSecondary'}`}
                      >
                        {new Date(reply.createdAt).toLocaleString()}
                        {isMe && <CheckCircle2 className="inline h-3 w-3 ml-1" />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white border-t border-border mt-auto">
              <form onSubmit={handleReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type a reply..."
                  maxLength={500}
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="btn-primary w-12 !px-0 rounded-full disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
              <p className="text-xs text-textSecondary mt-1">{replyMessage.trim().length}/500</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-textSecondary flex-col">
            <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;
