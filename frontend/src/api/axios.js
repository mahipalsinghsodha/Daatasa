import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // optional (only if you use cookies/auth)
});

// ── Auto-attach token to every request ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Global error handler — show API error messages as toasts ──────────────────
api.interceptors.response.use(
  (response) => response, // pass through successful responses
  (error) => {
    // Extract the error message from the API response
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    // Don't toast for cancelled requests or network errors during navigation
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Don't toast for stock issue responses (409) — handled by Checkout modal
    if (error.response?.status === 409 && error.response?.data?.allItems) {
      return Promise.reject(error);
    }

    // Show the error in a toast (avoid duplicates for the same message)
    toast.error(message, {
      toastId: message, // prevents duplicate toasts with same message
      autoClose: 4000,
    });

    // Still reject so individual catch blocks can handle specific logic
    return Promise.reject(error);
  }
);

export default api;