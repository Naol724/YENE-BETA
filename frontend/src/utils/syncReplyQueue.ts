import api from './api';

const QUEUE_KEY = 'owner-reply-queue';

export async function flushReplyQueue(): Promise<void> {
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return;
  let list: { inquiryId: string; message: string }[];
  try {
    list = JSON.parse(raw);
  } catch {
    localStorage.removeItem(QUEUE_KEY);
    return;
  }
  const remaining: typeof list = [];
  for (const item of list) {
    try {
      await api.post(`/inquiries/${item.inquiryId}/reply`, { message: item.message });
    } catch {
      remaining.push(item);
    }
  }
  if (remaining.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  else localStorage.removeItem(QUEUE_KEY);
}
