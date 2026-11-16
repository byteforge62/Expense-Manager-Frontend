import { describe, expect, test, vi } from "vitest";
import {
  createIdempotencyKey,
  createSingleFlight,
  ensureIdempotencyKey,
  isAuthExemptRequest,
  isFinancialMutation,
  isRetryableNetworkError,
  shouldRetryMethod,
} from "../components/Utils/httpPolicy";

describe("retry policy by HTTP method", () => {
  test("retries only safe methods", () => {
    expect(shouldRetryMethod("get")).toBe(true);
    expect(shouldRetryMethod("GET")).toBe(true);
    expect(shouldRetryMethod("head")).toBe(true);
  });

  test("never retries financial writes", () => {
    for (const method of ["post", "put", "patch", "delete"]) {
      expect(shouldRetryMethod(method)).toBe(false);
    }
  });

  test("treats only real network failures as retryable", () => {
    expect(isRetryableNetworkError({ message: "Network Error" })).toBe(true);
    expect(isRetryableNetworkError({ code: "ECONNABORTED" })).toBe(true);
    expect(isRetryableNetworkError({ message: "timeout of 120000ms exceeded" })).toBe(true);

    // A server error is not a network failure.
    expect(isRetryableNetworkError({ response: { status: 500 } })).toBe(false);
    expect(isRetryableNetworkError({ message: "Request failed with status code 400", response: {} })).toBe(false);
  });
});

describe("financial mutation detection", () => {
  test.each([
    "/expense",
    "/income",
    "/budget",
    "/bill/abc/settle",
    "/transaction",
    "/recurring/toggle/abc",
    "/api/expense",
  ])("treats %s as a financial mutation", (url) => {
    expect(isFinancialMutation({ url, method: "post" })).toBe(true);
  });

  test("ignores reads and non-financial writes", () => {
    expect(isFinancialMutation({ url: "/expense", method: "get" })).toBe(false);
    expect(isFinancialMutation({ url: "/user/login", method: "post" })).toBe(false);
    expect(isFinancialMutation({ url: "/user/upload-profile/abc", method: "post" })).toBe(false);
  });
});

describe("idempotency key lifecycle", () => {
  test("generates a key that satisfies the backend format", () => {
    const key = createIdempotencyKey();
    expect(key).toMatch(/^[A-Za-z0-9._:-]{8,128}$/);
    expect(createIdempotencyKey()).not.toBe(key);
  });

  test("attaches one key per logical mutation and reuses it on retry", () => {
    const config = { url: "/expense", method: "post", headers: {} };

    const first = ensureIdempotencyKey(config);
    expect(first).toBeTruthy();
    expect(config.headers["Idempotency-Key"]).toBe(first);

    // A retry of the same request object must not mint a new key.
    const second = ensureIdempotencyKey(config);
    expect(second).toBe(first);
    expect(config.headers["Idempotency-Key"]).toBe(first);
  });

  test("does not key reads or non-financial requests", () => {
    const read = { url: "/expenses/me", method: "get", headers: {} };
    const signup = { url: "/user", method: "post", headers: {} };

    expect(ensureIdempotencyKey(read)).toBeNull();
    expect(ensureIdempotencyKey(signup)).toBeNull();
    expect(read.headers["Idempotency-Key"]).toBeUndefined();
    expect(signup.headers["Idempotency-Key"]).toBeUndefined();
  });

  test("respects a key supplied by the caller", () => {
    const config = {
      url: "/income",
      method: "post",
      headers: { "Idempotency-Key": "caller-provided-key" },
    };

    expect(ensureIdempotencyKey(config)).toBe("caller-provided-key");
  });
});

describe("auth-exempt requests", () => {
  test("never refreshes on auth endpoints", () => {
    for (const url of ["/user/login", "/user/logout", "/user/refresh-token", "/user/resetpassword"]) {
      expect(isAuthExemptRequest({ url, method: "post" })).toBe(true);
    }
  });

  test("refreshes ordinary API calls", () => {
    expect(isAuthExemptRequest({ url: "/expenses/me", method: "get" })).toBe(false);
    expect(isAuthExemptRequest({ url: "/expense/abc", method: "delete" })).toBe(false);
  });
});

describe("single-flight coordination", () => {
  test("five concurrent callers share one operation", async () => {
    let calls = 0;
    const operation = createSingleFlight(async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "token";
    });

    const results = await Promise.all(Array.from({ length: 5 }, () => operation()));

    expect(calls).toBe(1);
    expect(results).toEqual(["token", "token", "token", "token", "token"]);
  });

  test("allows a new operation after the previous one settles", async () => {
    const operation = createSingleFlight(vi.fn().mockResolvedValueOnce("first").mockResolvedValueOnce("second"));

    expect(await operation()).toBe("first");
    expect(await operation()).toBe("second");
  });

  test("clears the in-flight promise on failure so a retry can run", async () => {
    const failing = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce("ok");
    const operation = createSingleFlight(failing);

    await expect(operation()).rejects.toThrow("boom");
    expect(await operation()).toBe("ok");
    expect(failing).toHaveBeenCalledTimes(2);
  });
});
