import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { AUTH_STORAGE_KEY, getSocketOrigin } from '../utils/api';

/**
 * Subscribes to server push when another party replies on an inquiry thread (Socket.IO).
 */
export function useInquiryRealtime(
  inquiryId: string | undefined,
  enabled: boolean,
  onThreadUpdated: () => void
): void {
  const callbackRef = useRef(onThreadUpdated);
  callbackRef.current = onThreadUpdated;

  useEffect(() => {
    if (!enabled || !inquiryId) return;

    let token: string | undefined;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      token = raw ? (JSON.parse(raw) as { token?: string }).token : undefined;
    } catch {
      return;
    }
    if (!token) return;

    const socket: Socket = io(getSocketOrigin(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const onUpdated = (payload: { inquiryId?: string }) => {
      if (payload?.inquiryId === inquiryId) {
        callbackRef.current();
      }
    };

    socket.on('connect', () => {
      socket.emit('join-inquiry', inquiryId, () => {});
    });

    socket.on('inquiry:updated', onUpdated);

    return () => {
      socket.emit('leave-inquiry', inquiryId);
      socket.off('inquiry:updated', onUpdated);
      socket.disconnect();
    };
  }, [enabled, inquiryId]);
}
