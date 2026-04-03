import api from '../utils/api';

export interface InquiryUserRef {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface InquiryPropertyRef {
  _id: string;
  title: string;
  images?: { url?: string; public_id?: string; isMain?: boolean }[];
  pricing?: { pricePerMonth?: number };
  location?: { city?: string; area?: string };
  status?: string;
}

export interface InquiryReply {
  _id?: string;
  sender: string | InquiryUserRef;
  message: string;
  createdAt: string;
}

export type InquiryStatus = 'Pending' | 'Read' | 'Responded';

export interface Inquiry {
  _id: string;
  property: string | InquiryPropertyRef;
  renter: string | InquiryUserRef;
  owner: string | InquiryUserRef;
  message: string;
  status: InquiryStatus;
  replies: InquiryReply[];
  renterLastReadAt?: string;
  ownerLastReadAt?: string;
  createdAt: string;
  updatedAt: string;
}

function idOf(ref: string | { _id?: string } | undefined): string {
  if (!ref) return '';
  if (typeof ref === 'string') return ref;
  return String(ref._id ?? '');
}

/** Owner: new or renter-follow-up — matches backend status rules. */
export function ownerHasUnread(inquiry: Inquiry): boolean {
  return inquiry.status === 'Pending';
}

/** Renter: owner sent a reply after renter last opened thread (GET). */
export function renterHasUnread(inquiry: Inquiry): boolean {
  const ownerId = idOf(inquiry.owner);
  let lastOwnerTs = 0;
  for (const r of inquiry.replies || []) {
    if (idOf(r.sender as InquiryUserRef) === ownerId) {
      const t = new Date(r.createdAt).getTime();
      if (t > lastOwnerTs) lastOwnerTs = t;
    }
  }
  if (!lastOwnerTs) return false;
  const readAt = inquiry.renterLastReadAt ? new Date(inquiry.renterLastReadAt).getTime() : 0;
  return lastOwnerTs > readAt;
}

export function getThreadPreview(inquiry: Inquiry): { text: string; at: string } {
  const replies = inquiry.replies || [];
  if (replies.length === 0) {
    return { text: inquiry.message, at: inquiry.createdAt };
  }
  const last = replies[replies.length - 1];
  return { text: last.message, at: last.createdAt };
}

export async function fetchInquiryThread(id: string): Promise<Inquiry> {
  const res = await api.get<{ success: boolean; data: Inquiry }>(`/inquiries/${id}`);
  return res.data.data;
}

export async function postInquiryReply(id: string, message: string): Promise<Inquiry> {
  const res = await api.post<{ success: boolean; data: Inquiry }>(`/inquiries/${id}/reply`, {
    message
  });
  return res.data.data;
}
