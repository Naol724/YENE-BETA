import { configureStore, type Middleware } from '@reduxjs/toolkit';
import authReducer, { login, logout, type AuthState } from './authSlice';
import { AUTH_STORAGE_KEY } from '../utils/api';

function loadPersistedAuth(): AuthState | undefined {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    const { token, user } = JSON.parse(raw) as {
      token?: string;
      user?: AuthState['user'];
    };
    if (token && user?.id) {
      return { user, token, isAuthenticated: true };
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

const authPersistenceMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  if (login.match(action)) {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: action.payload.token,
        user: action.payload.user,
      })
    );
  } else if (logout.match(action)) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return result;
};

const persistedAuth = loadPersistedAuth();

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: persistedAuth ? { auth: persistedAuth } : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authPersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
