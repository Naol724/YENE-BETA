import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { 
  Send, 
  ArrowLeft, 
  User, 
  Home, 
  Check, 
  CheckCheck,
  Clock,
  Phone,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from '../../store';
import api from '../../utils/api';
import { getSocketOrigin } from '../../utils/api';
import BackNavButton from '../BackNavButton';

interface Message {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    role: string;
  };
  message: string;
  createdAt: string;
}

interface Inquiry {
  _id: string;
  property: {
    _id: string;
    title: string;
    images: { url: string }[];
    location: { city: string; area: string };
    pricing: { pricePerMonth: number };
  };
  owner: { _id: string; fullName: string; phone: string };
  renter: { _id: string; fullName: string; phone: string };
  status: string;
  replies: Message[];
  createdAt: string;
}

const ChatInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [inquiry?.replies, scrollToBottom]);

  useEffect(() => {
    if (!id || !isAuthenticated || !user) return;

    const newSocket = io(getSocketOrigin(), {
      auth: { token: api.defaults.headers.Authorization?.replace('Bearer ', '') }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-inquiry', id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('inquiry:updated', (data) => {
      if (data.inquiryId === id) {
        fetchInquiry();
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-inquiry', id);
      newSocket.disconnect();
    };
  }, [id, isAuthenticated, user]);

  const fetchInquiry = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/inquiries/${id}`);
      setInquiry(response.data.data);
    } catch (error) {
      console.error('Failed to fetch inquiry:', error);
      toast.error('Failed to load conversation');
      navigate('/inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiry();
  }, [id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sending || !id) return;
    
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 1 || trimmedMessage.length > 500) {
      toast.error('Message must be between 1 and 500 characters');
      return;
    }

    setSending(true);
    try {
      await api.post(`/inquiries/${id}/reply`, { message: trimmedMessage });
      setMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const isOwnMessage = (message: Message) => {
    return message.sender._id === user?.id;
  };

  const getParticipantName = () => {
    if (!inquiry || !user) return '';
    
    if (user.role === 'OWNER') {
      return inquiry.renter.fullName;
    } else {
      return inquiry.owner.fullName;
    }
  };

  const getParticipantPhone = () => {
    if (!inquiry || !user) return '';
    
    if (user.role === 'OWNER') {
      return inquiry.renter.phone;
    } else {
      return inquiry.owner.phone;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Conversation not found</p>
            <button
              onClick={() => navigate('/inquiries')}
              className="btn-primary"
            >
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BackNavButton fallbackTo="/inquiries" />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{getParticipantName()}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`inline-flex items-center ${isConnected ? 'text-green-500' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                  <span>•</span>
                  <span>{getParticipantPhone()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Property Info */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <img
              src={inquiry.property.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
              alt={inquiry.property.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm">{inquiry.property.title}</h3>
              <p className="text-xs text-gray-500">
                {inquiry.property.location.area}, {inquiry.property.location.city}
              </p>
              <p className="text-xs font-medium text-primary">
                ETB {inquiry.property.pricing.pricePerMonth.toLocaleString()}/month
              </p>
            </div>
            <button
              onClick={() => navigate(`/house/${inquiry.property._id}`)}
              className="text-xs text-primary hover:underline"
            >
              View Property
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {inquiry.replies.map((reply, index) => {
          const isOwn = isOwnMessage(reply);
          const showDate = index === 0 || 
            formatDate(reply.createdAt) !== formatDate(inquiry.replies[index - 1].createdAt);
          
          return (
            <div key={reply._id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{reply.message}</p>
                  </div>
                  <div className={`flex items-center mt-1 space-x-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatTime(reply.createdAt)}</span>
                    {isOwn && (
                      <span className="text-blue-500">
                        <CheckCheck className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-4 py-3 bg-white">
        <form onSubmit={sendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={1}
              maxLength={500}
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
