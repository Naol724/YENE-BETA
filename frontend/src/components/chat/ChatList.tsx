import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Search, 
  MessageSquare, 
  CheckCheck,
  Home,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from '../../store';
import api from '../../utils/api';
import BackNavButton from '../BackNavButton';

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
  message: string;
  replies: Array<{
    _id: string;
    sender: { _id: string; fullName: string };
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  renterLastReadAt?: string;
  ownerLastReadAt?: string;
}

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchInquiries = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      const endpoint = user.role === 'OWNER' ? '/inquiries/received' : '/inquiries/my-inquiries';
      const response = await api.get(endpoint);
      setInquiries(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [isAuthenticated, user]);

  const getOtherParticipant = (inquiry: Inquiry) => {
    if (!user) return null;
    
    if (user.role === 'OWNER') {
      return {
        name: inquiry.renter.fullName,
        phone: inquiry.renter.phone,
        id: inquiry.renter._id
      };
    } else {
      return {
        name: inquiry.owner.fullName,
        phone: inquiry.owner.phone,
        id: inquiry.owner._id
      };
    }
  };

  const getLastMessage = (inquiry: Inquiry) => {
    if (inquiry.replies.length > 0) {
      const lastReply = inquiry.replies[inquiry.replies.length - 1];
      return {
        message: lastReply.message,
        sender: lastReply.sender.fullName,
        time: lastReply.createdAt,
        isOwn: lastReply.sender._id === user?.id
      };
    }
    return {
      message: inquiry.message,
      sender: inquiry.renter.fullName,
      time: inquiry.createdAt,
      isOwn: false
    };
  };

  const isUnread = (inquiry: Inquiry) => {
    if (!user) return false;
    
    const lastMessage = getLastMessage(inquiry);
    if (lastMessage.isOwn) return false;
    
    if (user.role === 'OWNER') {
      return !inquiry.ownerLastReadAt || new Date(lastMessage.time) > new Date(inquiry.ownerLastReadAt);
    } else {
      return !inquiry.renterLastReadAt || new Date(lastMessage.time) > new Date(inquiry.renterLastReadAt);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const participant = getOtherParticipant(inquiry);
    const matchesSearch = !searchTerm || 
      participant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.property.location.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && isUnread(inquiry)) ||
      (filter === 'archived' && inquiry.status === 'Archived');
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = inquiries.filter(isUnread).length;

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <BackNavButton fallbackTo="/" />
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex space-x-2 mt-3">
            {(['all', 'unread', 'archived'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === filterOption
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'all' && 'All'}
                {filterOption === 'unread' && 'Unread'}
                {filterOption === 'archived' && 'Archived'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No messages found' : 'No messages yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start a conversation by contacting property owners'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/search')}
                className="btn-primary"
              >
                Browse Properties
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInquiries.map((inquiry) => {
              const participant = getOtherParticipant(inquiry);
              const lastMessage = getLastMessage(inquiry);
              const unread = isUnread(inquiry);
              
              return (
                <Link
                  key={inquiry._id}
                  to={`/chat/${inquiry._id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-3">
                    <div className="flex items-start space-x-3">
                      {/* Property Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={inquiry.property.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                          alt={inquiry.property.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {participant?.name}
                            </h3>
                            {unread && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(lastMessage.time)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-1">
                          <Home className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-600 truncate">
                            {inquiry.property.title}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 truncate">
                            {lastMessage.isOwn && 'You: '}{lastMessage.message}
                          </p>
                          <div className="flex items-center space-x-1">
                            {unread ? (
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                New
                              </span>
                            ) : (
                              <CheckCheck className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Property Location */}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {inquiry.property.location.area}, {inquiry.property.location.city}
                          </span>
                          <span className="text-xs text-primary font-medium">
                            ETB {inquiry.property.pricing.pricePerMonth.toLocaleString()}/mo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
