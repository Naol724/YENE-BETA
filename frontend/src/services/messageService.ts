import api from '../utils/api';
import type { Inquiry } from './inquiries';
import { fetchInquiryThread, postInquiryReply } from './inquiries';

export async function fetchConversations(role: 'OWNER' | 'RENTER' | undefined) {
  const url = role === 'OWNER' ? '/inquiries/received' : '/inquiries/my-inquiries';
  const res = await api.get<{ data: Inquiry[] }>(url);
  return res.data.data;
}

export async function fetchThread(inquiryId: string) {
  return fetchInquiryThread(inquiryId);
}

export async function sendReply(inquiryId: string, message: string) {
  return postInquiryReply(inquiryId, message);
}
