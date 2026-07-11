import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io, type Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import type { RootState } from '../store';
import { AUTH_STORAGE_KEY, getSocketOrigin } from '../utils/api';
import api from '../utils/api';
import {
  ownerHasUnread,
  renterHasUnread,
  type Inquiry,
} from '../services/inquiries';

export type MessageNotificationPayload = {
  inquiryId: string;
  type: 'reply' | 'new_inquiry';
  preview?: string;
  fromName?: string;
  propertyTitle?: string;
};

type MessageNotificationsContextValue = {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
  clearUnread: () => void;
};

const MessageNotificationsContext = createContext<MessageNotificationsContextValue>({
  unreadCount: 0,
  refreshUnread: async () => {},
  clearUnread: () => {},
});

export function useMessageNotifications() {
  return useContext(MessageNotificationsContext);
}

function inboxPathForRole(role?: string) {
  return role === 'OWNER' ? '/owner/inquiries' : '/inquiries';
}

function isViewingInbox(pathname: string, role?: string) {
  if (role === 'OWNER') {
    return pathname.startsWith('/owner/inquiries');
  }
  return pathname.startsWith('/inquiries') || pathname.startsWith('/chat');
}

export function MessageNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, token } = useSelector((s: RootState) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;
  const roleRef = useRef(user?.role);
  roleRef.current = user?.role;

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }
    try {
      if (user.role === 'OWNER') {
        const { data } = await api.get<{ success: boolean; data: Inquiry[] }>(
          '/inquiries/received'
        );
        const list = data.data || [];
        setUnreadCount(list.filter(ownerHasUnread).length);
      } else if (user.role === 'RENTER') {
        const { data } = await api.get<{ success: boolean; data: Inquiry[] }>(
          '/inquiries/my-inquiries'
        );
        const list = data.data || [];
        setUnreadCount(list.filter(renterHasUnread).length);
      } else {
        setUnreadCount(0);
      }
    } catch {
      /* ignore transient errors */
    }
  }, [isAuthenticated, user]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  // Refresh when user opens inbox routes
  useEffect(() => {
    if (isViewingInbox(location.pathname, user?.role)) {
      refreshUnread();
    }
  }, [location.pathname, user?.role, refreshUnread]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let authToken = token;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as { token?: string }) : null;
      if (parsed?.token) authToken = parsed.token;
    } catch {
      /* use redux token */
    }

    const socket: Socket = io(getSocketOrigin(), {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
    });

    const onNotification = (payload: MessageNotificationPayload) => {
      if (!payload?.inquiryId) return;

      setUnreadCount((n) => n + 1);

      const viewingThisThread =
        pathnameRef.current.includes(payload.inquiryId) ||
        pathnameRef.current.endsWith(`/inquiries/${payload.inquiryId}`) ||
        pathnameRef.current.endsWith(`/chat/${payload.inquiryId}`);

      if (viewingThisThread) {
        refreshUnread();
        return;
      }

      const title =
        payload.type === 'new_inquiry'
          ? `New inquiry from ${payload.fromName || 'a renter'}`
          : `New message from ${payload.fromName || 'someone'}`;
      const body = payload.preview
        ? `${payload.propertyTitle ? `${payload.propertyTitle}: ` : ''}${payload.preview}`
        : payload.propertyTitle || 'Open your inbox to reply';

      toast(
        (t) => (
          <button
            type="button"
            className="text-left w-full"
            onClick={() => {
              toast.dismiss(t.id);
              const base = inboxPathForRole(roleRef.current);
              navigate(
                roleRef.current === 'OWNER'
                  ? `${base}/${payload.inquiryId}`
                  : base
              );
            }}
          >
            <p className="font-semibold text-sm text-textPrimary">{title}</p>
            <p className="text-xs text-textSecondary mt-0.5 line-clamp-2">{body}</p>
          </button>
        ),
        { duration: 6000, id: `msg-${payload.inquiryId}` }
      );
    };

    socket.on('message:notification', onNotification);

    return () => {
      socket.off('message:notification', onNotification);
      socket.disconnect();
    };
  }, [isAuthenticated, token, navigate, refreshUnread]);

  const value = useMemo(
    () => ({ unreadCount, refreshUnread, clearUnread }),
    [unreadCount, refreshUnread, clearUnread]
  );

  return (
    <MessageNotificationsContext.Provider value={value}>
      {children}
    </MessageNotificationsContext.Provider>
  );
}
