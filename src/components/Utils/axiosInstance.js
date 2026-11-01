
import axios from "axios";
import { startLoading, stopLoading } from "../../redux/ui/uiSlice";

let store;
let refreshPromise = null;

const API_BASE_URL = "https://learn-25-node-1.onrender.com/api";
const REFRESH_URL = `${API_BASE_URL}/user/refresh-token`;

const SAFE_RETRY_METHODS = new Set(["get", "head", "options"]);

export const injectStore = (_store) => {
  store = _store;
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const isAuthRequest = (url = "", method = "get") => {
  const normalizedUrl = url.toLowerCase();
  const normalizedMethod = method.toLowerCase();

  return (
    normalizedUrl.includes("/login") ||
    normalizedUrl.includes("/forgotpassword") ||
    normalizedUrl.includes("/resetpassword") ||
    normalizedUrl.includes("/logout") ||
    normalizedUrl.includes("/refresh-token") ||
    (normalizedUrl.endsWith("/user") && normalizedMethod === "post")
  );
};

const stopGlobalLoader = (config) => {
  if (store && config?._globalLoading) {
    store.dispatch(stopLoading());
    config._globalLoading = false;
  }
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        REFRESH_URL,
        {},
        {
          withCredentials: true,
          timeout: 120000,
        },
      )
      .then(async (response) => {
        const newToken = response.data?.token;

        if (!newToken) {
          throw new Error("Refresh response did not contain an access token.");
        }

        if (store) {
          const { updateToken } = await import("../../redux/auth/authSlice");
          store.dispatch(updateToken(newToken));
        }

        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    if (store && !config.skipGlobalLoader && !config._globalLoading) {
      config._globalLoading = true;
      store.dispatch(startLoading(config.loadingText));
    }

    const token = store?.getState()?.auth?.token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    stopGlobalLoader(error.config);
    return Promise.reject(error);
  },
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => {
    stopGlobalLoader(response.config);
    return response;
  },
  async (error) => {
    const config = error.config;
    const response = error.response;

    if (!config) {
      return Promise.reject(error);
    }

    const method = (config.method || "get").toLowerCase();

    // CASE 1: ACCESS TOKEN EXPIRED
    if (
      response?.status === 401 &&
      !config._authRetry &&
      !isAuthRequest(config.url, method)
    ) {
      config._authRetry = true;

      try {
        const newToken = await refreshAccessToken();

        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(config);
      } catch (refreshError) {
        // Only clear the session when the refresh token is rejected.
        if (
          refreshError.response?.status === 401 ||
          refreshError.response?.status === 403
        ) {
          if (store) {
            const { logout } = await import("../../redux/auth/authSlice");
            store.dispatch(logout());
          }

          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            window.location.href = "/login";
          }
        }

        stopGlobalLoader(config);
        return Promise.reject(refreshError);
      }
    }

    // CASE 2: NETWORK/TIMEOUT RETRY
    // Only retry safe HTTP methods to avoid duplicate mutations.
    const message = error.message || "";

    const isTimeout =
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      message.toLowerCase().includes("timeout");

    const isNetworkError =
      !response && error.code !== "ERR_CANCELED";

    const shouldRetry =
      SAFE_RETRY_METHODS.has(method) &&
      !config._networkRetry &&
      (isTimeout || isNetworkError);

    if (shouldRetry) {
      config._networkRetry = true;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      return axiosInstance(config);
    }

    // CASE 3: FINAL ERROR
    stopGlobalLoader(config);
    return Promise.reject(error);
  },
);

export default axiosInstance;
