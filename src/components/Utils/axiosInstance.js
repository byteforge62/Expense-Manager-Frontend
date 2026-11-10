import axios from "axios";
import { startLoading, stopLoading } from "../../redux/ui/uiSlice";
import { logout, updateToken } from "../../redux/auth/authSlice";

/**
 * --- AXIOS GLOBAL CONFIGURATION ---
 * We use a custom instance to handle common logic like headers,
 * auth tokens, and automatic error handling.
 */

let store;

// Hack: We need the Redux store to dispatch actions from here
export const injectStore = (_store) => {
  store = _store;
};

export const resolveApiBaseUrl = (baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api") => {
  const rawBaseUrl = String(baseUrl || "http://localhost:3001/api").trim();
  const cleanedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
  return cleanedBaseUrl.endsWith("/api") ? cleanedBaseUrl : `${cleanedBaseUrl}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST INTERCEPTOR ---
// Runs before every single request we make
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Show the global loading spinner unless told otherwise
    if (store && !config.skipGlobalLoader) {
      config._globalLoading = true;
      store.dispatch(startLoading(config.loadingText));
    }

    // 2. Attach the JWT token if we have one in state
    const token = store?.getState()?.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Hide loader if request setup fails
    if (store && error.config?._globalLoading) {
      store.dispatch(stopLoading());
    }
    return Promise.reject(error);
  },
);

// --- RESPONSE INTERCEPTOR ---
// Runs after every response or error from the server
axiosInstance.interceptors.response.use(
  (response) => {
    // Hide loader on success
    if (store && response.config?._globalLoading) {
      store.dispatch(stopLoading());
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Check if the request is an authentication-related or public request
    const isAuthRequest = config.url?.includes("/login") ||
                          config.url?.includes("/forgotpassword") ||
                          config.url?.includes("/resetpassword") ||
                          config.url?.includes("/logout") ||
                          (config.url?.endsWith("/user") && config.method?.toLowerCase() === "post");

    // --- CASE 1: TOKEN EXPIRED (401) ---
    // If we get a 401, we try to refresh the token once before giving up
    if (response?.status === 401 && !config._retry && !isAuthRequest) {
      config._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/user/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newToken = refreshRes.data.token;
        if (newToken && store) {
          store.dispatch(updateToken(newToken));
        }

        // Retry the original request with the new token
        return axiosInstance(config);
      } catch (refreshError) {
        // Refresh failed (refresh token also expired), kick user to login
        if (store) {
          store.dispatch(logout());
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // --- CASE 2: NETWORK/TIMEOUT ERRORS ---
    // If the server is just slow or down, we try one more time after a short delay
    if (config && !config._retry) {
      config._retry = true;
      const message = error.message || "";
      const isTimeout =
        message.includes("timeout") || error.code === "ECONNABORTED";
      const isNetworkError =
        message.includes("Network Error") || !error.response;

      if (isTimeout || isNetworkError) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return axiosInstance(config);
      }
    }

    // Always hide the loader if an error happens
    if (store && config?._globalLoading) {
      store.dispatch(stopLoading());
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

