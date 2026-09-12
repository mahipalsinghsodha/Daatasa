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
const _readToken = (key) => {
  const v = localStorage.getItem(key);
  // Guard against the string "null" or "undefined" being stored
  return (v && v !== 'null' && v !== 'undefined') ? v : null;
};

let _accessToken = _readToken('accessToken');

export const setAccessToken = (token) => {
  _accessToken = token || null;
  if (token && token !== 'null') {
    localStorage.setItem('accessToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:token_updated', { detail: { token: _accessToken } }));
  }
};

export const setRefreshToken = (token) => {
  if (token && token !== 'null') {
    localStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

export const getRefreshToken = () => _readToken('refreshToken');

export const getAccessToken = () => _accessToken;

let refreshPromise = null;

export const refreshAuthToken = () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token available'));
  }

  if (!refreshPromise) {
    const baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
    // Using raw axios to prevent circular request/response interceptors & token header pollution
    refreshPromise = axios
      .post(
        `${baseURL}/api/auth/refresh`,
        { refreshToken },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      )
      .then((res) => {
        const { token, refreshToken: newRefreshToken } = res.data || {};
        if (token) setAccessToken(token);
        if (newRefreshToken) setRefreshToken(newRefreshToken);
        return res;
      })
      .catch((err) => {
        // Clear tokens on failed refresh
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:forced_logout', {
              detail: { reason: 'Your session has expired. Please login again.' },
            })
          );
        }
        return Promise.reject(err);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Always attach latest token from memory
    if (_accessToken) {
      if (config.headers?.set) {
        config.headers.set('Authorization', `Bearer ${_accessToken}`);
      } else {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${_accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (401 → auto-refresh → retry) ───────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error (server down, ECONNREFUSED, etc.) — do NOT attempt token refresh.
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    // Only intercept 401 (Unauthorized) errors
    // Skip: already retried, refresh endpoint itself, login/register endpoints
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') &&
      !originalRequest.url?.includes('/api/auth/login') &&
      !originalRequest.url?.includes('/api/auth/register')
    ) {
      // If there is no refresh token stored, fail immediately without sending useless requests
      if (!getRefreshToken()) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // All concurrent 401s share this single promise!
        const res = await refreshAuthToken();
        const newToken = res.data?.token || _accessToken;

        if (newToken) {
          if (originalRequest.headers?.set) {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
          } else {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
        }

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;