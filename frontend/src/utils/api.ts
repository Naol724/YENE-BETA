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

export { AUTH_STORAGE_KEY };

export default api;
