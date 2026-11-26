/**
 * Short-lived in-memory cache for read-only API responses.
 *
 * The app has no data-fetching library: pages read through Redux thunks and a
 * few direct axios calls. Moving between pages (dashboard -> expenses ->
 * income -> dashboard) re-issued the same GETs every time, and several pages
 * request the same collections when they mount. This cache collapses those
 * repeats - and concurrent duplicates - into one request per unique read,
 * which is what the browser and the API actually pay for.
 *
 * Rules that keep it safe:
 * - GET only, and only for a signed-in user, so keys are user scoped.
 * - Auth/session endpoints are never cached.
 * - Any successful write clears the cache, so a mutation is visible at once.
 * - Failures are never cached, and every entry can be rebuilt from the API.
 */

const DEFAULT_TTL_MS = 30_000;
const MAX_ENTRIES = 200;

/** Prefixes whose responses depend on the session or are single-use. */
const EXCLUDED_PATHS = ["/user", "/realtime"];

const normalizeMethod = (method) => String(method || "get").toLowerCase();

const pathOf = (url) => String(url || "").split("?")[0];

export const isCacheableRequest = (config) => {
  if (!config || normalizeMethod(config.method) !== "get") {
    return false;
  }

  // `cache: false` / `skipCache` lets a caller force a fresh read.
  if (config.cache === false || config.skipCache) {
    return false;
  }

  const path = pathOf(config.url);

  return !EXCLUDED_PATHS.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
};

/** Deterministic signature of the query string, independent of key order. */
const stableParams = (params = {}) =>
  JSON.stringify(
    Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== null)
      .sort()
      .map((key) => [key, params[key]]),
  );

/**
 * A null key means "do not cache": anonymous reads have no safe scope, and an
 * id-less session must never share entries with the next signed-in user.
 */
export const requestCacheKey = ({ userId, url, params } = {}) => {
  if (!userId) {
    return null;
  }

  return `${userId}|${pathOf(url)}|${stableParams(params)}`;
};

export const createRequestCache = ({
  ttlMs = DEFAULT_TTL_MS,
  maxEntries = MAX_ENTRIES,
  now = Date.now,
} = {}) => {
  const entries = new Map();
  const pending = new Map();

  const read = (key) => {
    if (!key) {
      return undefined;
    }

    const entry = entries.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= now()) {
      entries.delete(key);
      return undefined;
    }

    return entry.value;
  };

  const write = (key, value) => {
    if (!key) {
      return;
    }

    // Re-insert so eviction always drops the least recently written entry.
    entries.delete(key);
    entries.set(key, { value, expiresAt: now() + ttlMs });

    while (entries.size > maxEntries) {
      entries.delete(entries.keys().next().value);
    }
  };

  const clear = () => {
    entries.clear();
  };

  const size = () => entries.size;

  /**
   * Returns the cached value, joins the request already in flight for the
   * same key, or runs `fetcher` once and stores its result. Rejections are
   * propagated and never stored.
   */
  const getOrFetch = async (key, fetcher) => {
    if (!key) {
      return fetcher();
    }

    const cached = read(key);

    if (cached !== undefined) {
      return cached;
    }

    const inFlight = pending.get(key);

    if (inFlight) {
      return inFlight;
    }

    const request = Promise.resolve()
      .then(fetcher)
      .then((value) => {
        write(key, value);
        return value;
      })
      .finally(() => {
        pending.delete(key);
      });

    pending.set(key, request);

    return request;
  };

  return { read, write, clear, size, getOrFetch };
};

const configuredTtl = Number(import.meta.env?.VITE_HTTP_CACHE_TTL_MS);

export const requestCache = createRequestCache({
  ttlMs:
    Number.isFinite(configuredTtl) && configuredTtl > 0
      ? configuredTtl
      : DEFAULT_TTL_MS,
});

export { DEFAULT_TTL_MS, MAX_ENTRIES };
