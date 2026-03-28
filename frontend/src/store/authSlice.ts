import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'RENTER' | 'OWNER';
  isApproved?: boolean;
}

/** Map API role to renter vs owner; non-owner roles become renter. */
export function normalizeApiUser(u: {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isApproved?: boolean;
}): User {
  return {
    id: String(u.id),
    fullName: u.fullName,
    email: u.email,
    role: u.role === 'OWNER' ? 'OWNER' : 'RENTER',
    isApproved: u.isApproved,
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
