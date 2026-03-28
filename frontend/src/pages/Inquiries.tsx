import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Send, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../utils/api';

const Inquiries: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const url = user?.role === 'OWNER' ? '/inquiries/received' : '/inquiries/my-inquiries';
      const res = await api.get(url);
      setInquiries(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedInquiry) return;
    try {
      const res = await api.post(`/inquiries/${selectedInquiry._id}/reply`, { message: replyMessage });
      setSelectedInquiry(res.data.data);
      setReplyMessage('');
      fetchInquiries(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] pb-16 md:pb-0 overflow-hidden bg-surface animate-fade-in">
      {/* Inquiries List */}
      <div className={`w-full md:w-1/3 bg-white border-r border-border overflow-y-auto ${selectedInquiry ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        {loading ? (
          <div className="p-4 space-y-4">
            {[1,2,3].map(n => <div key={n} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center text-textSecondary">
            No messages yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {inquiries.map((inq) => (
              <div 
                key={inq._id} 
                onClick={() => setSelectedInquiry(inq)}
                className={`p-4 cursor-pointer hover:bg-surface transition-colors flex gap-3 ${selectedInquiry?._id === inq._id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-border">
                  <img src={inq.property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-textPrimary truncate pr-2">
                       {user?.role === 'OWNER' ? inq.renter?.fullName : inq.property?.title}
                    </h4>
                    <span className="text-[10px] text-textSecondary whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-textSecondary line-clamp-1">{inq.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-50 relative ${!selectedInquiry ? 'hidden md:flex' : 'flex'}`}>
        {selectedInquiry ? (
          <>
            <div className="h-16 border-b border-border bg-white flex items-center px-4 md:px-6 shadow-sm z-10">
              <button 
                className="md:hidden mr-4 p-2 text-textSecondary"
                onClick={() => setSelectedInquiry(null)}
              >
                ← Back
              </button>
              <div className="font-semibold">
                {user?.role === 'OWNER' ? selectedInquiry.renter?.fullName : selectedInquiry.owner?.fullName}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* Initial Message */}
              <div className="flex justify-start">
                <div className="bg-white border border-border p-4 rounded-xl rounded-tl-none shadow-sm max-w-[80%]">
                  <p className="text-textPrimary">{selectedInquiry.message}</p>
                  <span className="text-xs text-textSecondary mt-2 block">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Replies */}
              {selectedInquiry.replies?.map((reply: any) => {
                const isMe = reply.sender === user?.id;
                return (
                  <div key={reply._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-xl shadow-sm max-w-[80%] ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-border rounded-tl-none'}`}>
                      <p>{reply.message}</p>
                      <span className={`text-xs mt-2 block ${isMe ? 'text-blue-100' : 'text-textSecondary'}`}>
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
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Type a reply..." 
                  className="input-field flex-1"
                />
                <button type="submit" disabled={!replyMessage.trim()} className="btn-primary w-12 !px-0 rounded-full disabled:opacity-50">
                  <Send className="h-5 w-5" />
                </button>
              </form>
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
