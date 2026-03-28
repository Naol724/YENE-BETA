import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  const state = JSON.parse(localStorage.getItem('persist:root') || '{}');
  if (state.auth) {
    const auth = JSON.parse(state.auth);
    if (auth.token && config.headers) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  }
  return config;
});

export default api;
