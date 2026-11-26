import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  createRequestCache,
  isCacheableRequest,
  requestCacheKey,
} from "../components/Utils/requestCache";

const response = (body) => ({ status: 200, data: body, headers: {}, config: {} });

describe("request cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("answers a repeated read without calling the network again", async () => {
    const cache = createRequestCache({ ttlMs: 30_000 });
    const fetcher = vi.fn(async () => response({ total: 1 }));

    const first = await cache.getOrFetch("u1|/expenses/me|[]", fetcher);
    const second = await cache.getOrFetch("u1|/expenses/me|[]", fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  test("collapses concurrent reads of the same key into one request", async () => {
    const cache = createRequestCache();
    let resolveFetch;
    const fetcher = vi.fn(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    );

    const first = cache.getOrFetch("u1|/incomes/me|[]", fetcher);
    const second = cache.getOrFetch("u1|/incomes/me|[]", fetcher);

    // Let the first caller start its loader, then settle both shared promises.
    await Promise.resolve();
    resolveFetch(response({ total: 2 }));

    const [a, b] = await Promise.all([first, second]);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  test("expires entries after the TTL and refetches", async () => {
    const cache = createRequestCache({ ttlMs: 1_000 });
    const fetcher = vi.fn(async () => response({ total: 3 }));

    await cache.getOrFetch("u1|/budgets/me|[]", fetcher);
    vi.advanceTimersByTime(1_001);
    await cache.getOrFetch("u1|/budgets/me|[]", fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  test("does not cache failures", async () => {
    const cache = createRequestCache();
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(response({ total: 4 }));

    await expect(cache.getOrFetch("u1|/bills/me|[]", fetcher)).rejects.toThrow(
      "offline",
    );

    const retry = await cache.getOrFetch("u1|/bills/me|[]", fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(retry.data).toEqual({ total: 4 });
  });

  test("clear() drops every entry so a write is visible immediately", async () => {
    const cache = createRequestCache();
    const fetcher = vi.fn(async () => response({ total: 5 }));

    await cache.getOrFetch("u1|/expenses/me|[]", fetcher);
    cache.clear();
    await cache.getOrFetch("u1|/expenses/me|[]", fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(cache.size()).toBe(1);
  });
});

describe("cacheable request policy", () => {
  test("accepts signed-in reads, including admin lists", () => {
    expect(isCacheableRequest({ method: "get", url: "/expenses/me" })).toBe(true);
    expect(isCacheableRequest({ method: "GET", url: "/users" })).toBe(true);
    expect(
      isCacheableRequest({ method: "get", url: "/purchases/me", params: { page: 1 } }),
    ).toBe(true);
  });

  test("never caches writes, session endpoints or opt-outs", () => {
    expect(isCacheableRequest({ method: "post", url: "/expense" })).toBe(false);
    expect(isCacheableRequest({ method: "get", url: "/user/me" })).toBe(false);
    expect(isCacheableRequest({ method: "get", url: "/realtime" })).toBe(false);
    expect(isCacheableRequest({ method: "get", url: "/expenses/me", cache: false })).toBe(false);
  });

  test("scopes keys per user and ignores parameter order", () => {
    const key = requestCacheKey({
      userId: "u1",
      url: "/purchases/me",
      params: { page: 2, limit: 20 },
    });

    expect(key).toBe(
      requestCacheKey({
        userId: "u1",
        url: "/purchases/me",
        params: { limit: 20, page: 2 },
      }),
    );
    expect(key).not.toBe(
      requestCacheKey({ userId: "u2", url: "/purchases/me", params: { page: 2, limit: 20 } }),
    );
    expect(requestCacheKey({ userId: undefined, url: "/expenses/me" })).toBeNull();
  });
});
