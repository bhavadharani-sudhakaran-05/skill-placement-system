import axios from 'axios';

let rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
if (rawApiUrl.endsWith('/')) rawApiUrl = rawApiUrl.slice(0, -1);
if (!rawApiUrl.endsWith('/api')) rawApiUrl = `${rawApiUrl}/api`;

export const API_BASE_URL = rawApiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token and handle FormData
api.interceptors.request.use(
  (config) => {
    // If payload is FormData, remove Content-Type so browser can set boundary automatically
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }

    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        // Ignore parse error
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on login/register attempts — let the caller handle the error
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
