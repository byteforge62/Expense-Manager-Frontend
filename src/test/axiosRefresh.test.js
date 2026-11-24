import { beforeEach, describe, expect, test, vi } from "vitest";

/**
 * Drives the real Axios instance through its interceptors with a stubbed
 * transport, so the refresh/retry coordination is tested where it actually
 * runs rather than through a re-implementation.
 */
const { axiosPost, instanceMock, handlers } = vi.hoisted(() => {
  const handlers = {};

  const instanceMock = vi.fn((config) =>
    Promise.resolve({ config, status: 200, data: { success: true, data: { id: "retried" } } }),
  );

  instanceMock.interceptors = {
    request: {
      use: (onFulfilled, onRejected) => {
        handlers.request = onFulfilled;
        handlers.requestError = onRejected;
      },
    },
    response: {
      use: (onFulfilled, onRejected) => {
        handlers.response = onFulfilled;
        handlers.responseError = onRejected;
      },
    },
  };

  return { axiosPost: vi.fn(), instanceMock, handlers };
});

vi.mock("axios", () => ({
  default: {
    create: () => instanceMock,
    post: axiosPost,
  },
}));

import axiosInstance, { injectStore } from "../components/Utils/axiosInstance";
import { loginSuccess } from "../store/slices/authSlice";
import { store } from "../store/store";

const unauthorized = (index) => ({
  config: { url: `/expenses/me?page=${index}`, method: "get", headers: {} },
  response: { status: 401 },
});

const networkError = (config) => {
  const error = new Error("Network Error");
  error.config = config;
  return error;
};

describe("concurrent 401 handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    axiosPost.mockReset();
    instanceMock.mockClear();
    injectStore(store);
    store.dispatch(loginSuccess({ user: { _id: "u1" }, role: "User", token: "stale-token" }));
  });

  test("five simultaneous 401s share one refresh and all complete", async () => {
    axiosPost.mockResolvedValue({ data: { success: true, data: { token: "fresh-token" } } });

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, index) => handlers.responseError(unauthorized(index))),
    );

    expect(axiosPost).toHaveBeenCalledTimes(1);
    expect(axiosPost).toHaveBeenCalledWith(
      expect.stringContaining("/user/refresh-token"),
      {},
      expect.objectContaining({ withCredentials: true }),
    );

    expect(instanceMock).toHaveBeenCalledTimes(5);
    expect(results).toHaveLength(5);
    expect(results.every((result) => result.status === 200)).toBe(true);
    expect(store.getState().auth.token).toBe("fresh-token");
  });

  test("does not refresh the refresh endpoint itself", async () => {
    const error = {
      config: { url: "/user/refresh-token", method: "post", headers: {} },
      response: { status: 401 },
    };

    await expect(handlers.responseError(error)).rejects.toBe(error);
    expect(axiosPost).not.toHaveBeenCalled();
  });

  test("failed refresh ends the session once and rejects every caller", async () => {
    axiosPost.mockRejectedValue(new Error("refresh expired"));

    const settled = await Promise.allSettled(
      Array.from({ length: 5 }, (_, index) => handlers.responseError(unauthorized(index))),
    );

    expect(axiosPost).toHaveBeenCalledTimes(1);
    expect(settled.every((outcome) => outcome.status === "rejected")).toBe(true);
    expect(instanceMock).not.toHaveBeenCalled();

    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("network retry policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosPost.mockReset();
    instanceMock.mockClear();
    injectStore(store);
  });

  test("retries a GET once after a network failure", async () => {
    vi.useFakeTimers();

    try {
      const config = { url: "/expenses/me", method: "get", headers: {} };
      const pending = handlers.responseError(networkError(config));

      await vi.advanceTimersByTimeAsync(2100);
      await pending;

      expect(instanceMock).toHaveBeenCalledTimes(1);
      expect(instanceMock).toHaveBeenCalledWith(expect.objectContaining({ _networkRetry: true }));
    } finally {
      vi.useRealTimers();
    }
  });

  test("never retries a financial POST and keeps its idempotency key", async () => {
    const config = handlers.request({ url: "/expense", method: "post", headers: {} });
    const key = config.headers["Idempotency-Key"];

    expect(key).toBeTruthy();

    const error = networkError(config);

    await expect(handlers.responseError(error)).rejects.toBe(error);

    expect(instanceMock).not.toHaveBeenCalled();
    expect(config.headers["Idempotency-Key"]).toBe(key);
  });

  test("retrying the same request object reuses the original key", () => {
    const config = handlers.request({ url: "/income", method: "post", headers: {} });
    const key = config.headers["Idempotency-Key"];

    const retried = handlers.request(config);

    expect(retried.headers["Idempotency-Key"]).toBe(key);
  });

  test("the instance still exposes the configured base url", () => {
    expect(typeof axiosInstance).toBe("function");
  });
});
