import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
