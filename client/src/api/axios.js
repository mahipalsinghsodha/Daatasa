// frontend/src/api/axios.js
// Axios instance with:
//   ✅ 401 auto-refresh interceptor with retry queue
//   ✅ Token and refresh token stored in localStorage
//   ✅ Dispatches 'auth:logout' event when refresh fails

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000'),
  withCredentials: true,
  timeout: 15000,
});

// ─── In-memory token store ────────────────────────────────────────────────────
// This module is a singleton, so the token persists across components
// without being accessible from browser devtools/localStorage
let _accessToken = localStorage.getItem('accessToken');

export const setAccessToken = (token) => {
  _accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const getAccessToken = () => _accessToken;

let refreshPromise = null;

export const refreshAuthToken = () => {
  if (!refreshPromise) {
    const refreshToken = getRefreshToken();
    refreshPromise = api.post('/api/auth/refresh', { refreshToken }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Always attach latest token from memory
    if (_accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (401 → auto-refresh → retry) ───────────────────────
let isRefreshing = false;
let failedQueue  = []; // Queue of { resolve, reject } for requests waiting on refresh

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 (Unauthorized) errors
    // Skip: already retried, refresh endpoint itself, login/register endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') &&
      !originalRequest.url?.includes('/api/auth/login') &&
      !originalRequest.url?.includes('/api/auth/register')
    ) {
      if (isRefreshing) {
        // Queue this request to retry once refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt token refresh using shared singleton promise
        const res = await refreshAuthToken();
        const { token, refreshToken } = res.data;

        setAccessToken(token);
        if (refreshToken) setRefreshToken(refreshToken);
        processQueue(null, token);

        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        processQueue(refreshError, null);
        setAccessToken(null);
        setRefreshToken(null);

        // Dispatch global logout event (AuthContext listens to this)
        window.dispatchEvent(new CustomEvent('auth:forced_logout'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;