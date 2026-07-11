import axios from 'axios';
import { store } from '../store';
import { login, logout } from '../store/authSlice';

/** Single source for API base (must end with `/api`). */
export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (url && String(url).trim()) return String(url).trim();

  // Never crash the whole SPA for a missing env var — fall back in all modes.
  console.warn(
    'VITE_API_URL is not set. Falling back to http://localhost:5000/api. Set it in frontend/.env for production.'
  );
  return 'http://localhost:5000/api';
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
  timeout: 60000, // uploads can take longer than JSON calls
});

const AUTH_STORAGE_KEY = 'renatal_auth';

// Interceptor to add token and set the right Content-Type
api.interceptors.request.use((config) => {
  // FormData must use multipart boundary set by the browser — never force JSON.
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData) {
    if (config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete (config.headers as Record<string, unknown>)['Content-Type'];
        delete (config.headers as Record<string, unknown>)['content-type'];
      }
    }
  } else if (config.headers && !config.headers['Content-Type'] && !config.headers['content-type']) {
    config.headers['Content-Type'] = 'application/json';
  }

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

// Store for refresh token requests to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = String(error.config?.url ?? '');
      const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token');
      
      if (!isAuthAttempt && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Try to refresh the token
          const raw = localStorage.getItem(AUTH_STORAGE_KEY);
          if (raw) {
            const { refreshToken } = JSON.parse(raw) as { refreshToken?: string };
            if (refreshToken) {
              const response = await api.post('/auth/refresh-token', { refreshToken });
              
              if (response.data.success) {
                // Update stored tokens
                const authData = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
                authData.token = response.data.token;
                authData.refreshToken = response.data.refreshToken;
                authData.user = response.data.user;
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
                
                // Update Redux store
                store.dispatch(login({ 
                  user: response.data.user, 
                  token: response.data.token,
                  refreshToken: response.data.refreshToken,
                }));
                
                // Update the original request header
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                
                // Process queued requests
                processQueue(null, response.data.token);
                
                // Retry the original request
                return api(originalRequest);
              }
            }
          }
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          processQueue(refreshError, null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          store.dispatch(logout());
          
          const path = window.location.pathname;
          if (!path.startsWith('/login') && !path.startsWith('/register')) {
            window.location.replace(`/login?session=expired`);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export { AUTH_STORAGE_KEY };

export default api;
