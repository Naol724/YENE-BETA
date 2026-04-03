import api from '../utils/api';

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'RENTER' | 'OWNER';
};

export async function loginRequest(email: string, password: string) {
  return api.post<{ success: boolean; token: string; user: unknown; message?: string }>('/auth/login', {
    email,
    password,
  });
}

export async function registerRequest(payload: RegisterPayload) {
  return api.post<{ success: boolean; token: string; user: unknown; message?: string }>('/auth/register', payload);
}

export async function forgotPasswordRequest(email: string) {
  return api.post('/auth/forgot-password', { email });
}

export async function verifyEmailRequest(email: string, otp: string) {
  return api.post<{ success: boolean; message?: string }>('/auth/verify-email', { email, otp });
}
