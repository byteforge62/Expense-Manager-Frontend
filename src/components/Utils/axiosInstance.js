import axios from "axios";
import { startLoading, stopLoading } from "../../store/slices/uiSlice";
import { logout, updateToken } from "../../store/slices/authSlice";
import { clearLegacyAuthStorage, redirectToLogin } from "./session";
import {
  createSingleFlight,
  ensureIdempotencyKey,
  isAuthExemptRequest,
  isRetryableNetworkError,
  shouldRetryMethod,
} from "./httpPolicy";

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

// A lost response is retried once, and only for methods that are safe to repeat.
const NETWORK_RETRY_DELAY_MS = 2000;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

const readAccessToken = (response) =>
  response?.data?.data?.token || response?.data?.token;

const requestRefresh = async () => {
  // Raw axios (not this instance): the refresh endpoint must never re-enter
  // the 401 interceptor, and it authenticates with the httpOnly cookie.
  const response = await axios.post(
    `${API_BASE_URL}/user/refresh-token`,
    {},
    { withCredentials: true },
  );

  const token = readAccessToken(response);

  if (!token) {
    throw new Error("Token refresh did not return an access token");
  }

  store?.dispatch(updateToken(token));

  return token;
};

/**
 * One refresh request for however many requests received a 401 at once.
 * Every caller awaits the same promise, so token rotation cannot race.
 */
export const refreshAccessToken = createSingleFlight(requestRefresh);

/** Retries a request once the shared refresh has produced a new token. */
export const retryAfterRefresh = async (config) => {
  await refreshAccessToken();
  return axiosInstance(config);
};

const releaseGlobalLoader = (config) => {
  if (store && config?._globalLoading) {
    config._globalLoading = false;
    store.dispatch(stopLoading());
  }
};

/**
 * Ends the client session: Redux first (private routes stop rendering and the
 * request interceptor stops attaching a token), then storage and redirect.
 */
const endSession = () => {
  store?.dispatch(logout());
  clearLegacyAuthStorage();
  redirectToLogin();
};

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

    // 3. Financial mutations carry an idempotency key so a retry replays the
    //    original result instead of creating a second record.
    ensureIdempotencyKey(config);

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

    if (!config) {
      return Promise.reject(error);
    }

    // --- CASE 1: TOKEN EXPIRED (401) ---
    // One shared refresh, then a single retry. Auth endpoints are excluded so
    // a bad password can never trigger a refresh/redirect loop.
    if (response?.status === 401 && !config._retry && !isAuthExemptRequest(config)) {
      config._retry = true;
      releaseGlobalLoader(config);

      try {
        return await retryAfterRefresh(config);
      } catch (refreshError) {
        // Refresh failed (refresh token also expired): end the session once.
        endSession();
        return Promise.reject(refreshError);
      }
    }

    // --- CASE 2: NETWORK/TIMEOUT ERRORS ---
    // Retried only for safe methods. A write whose response was lost may have
    // already been applied, so it is surfaced to the caller instead.
    if (
      !config._networkRetry &&
      shouldRetryMethod(config.method) &&
      isRetryableNetworkError(error)
    ) {
      config._networkRetry = true;
      releaseGlobalLoader(config);
      await new Promise((resolve) => setTimeout(resolve, NETWORK_RETRY_DELAY_MS));
      return axiosInstance(config);
    }

    // Hide the loader if an error happens
    releaseGlobalLoader(config);
    return Promise.reject(error);
  },
);

export default axiosInstance;
