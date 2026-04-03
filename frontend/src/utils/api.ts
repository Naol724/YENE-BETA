import axios from 'axios';

/** Single source for API base (must end with `/api`). */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
}

/** Socket.IO origin (same host/port as the API, no `/api` path). */
export function getSocketOrigin(): string {
  try {
    return new URL(getApiBaseUrl()).origin;
  } catch {
    return 'http://localhost:5000';
  }
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

const AUTH_STORAGE_KEY = 'renatal_auth';

// Interceptor to add token
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw && config.headers) {
      const { token } = JSON.parse(raw) as { token?: string };
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    /* ignore */
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = String(error.config?.url ?? '');
      const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthAttempt) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        const path = window.location.pathname;
        if (!path.startsWith('/login') && !path.startsWith('/register')) {
          window.location.replace(`/login?session=expired`);
        }
      }
    }
    return Promise.reject(error);
  }
);

export { AUTH_STORAGE_KEY };

export default api;
