/**
 * HTTP policy used by the shared Axios instance.
 *
 * Kept as pure functions so the retry and idempotency rules can be unit-tested
 * without a network stack, and so the interceptor stays readable.
 */

const SAFE_RETRY_METHODS = new Set(["get", "head"]);

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

/**
 * Financial record collections. A mutation touching one of these creates or
 * changes money records, so it may only be retried with an idempotency key.
 */
const FINANCIAL_COLLECTIONS = [
  "expense",
  "income",
  "budget",
  "bill",
  "transaction",
  "recurring",
  "purchases",
  "purchase-intelligence",
];

/** Auth endpoints that must never trigger a token refresh / redirect loop. */
const AUTH_EXEMPT_PATHS = [
  "/login",
  "/forgotpassword",
  "/resetpassword",
  "/logout",
  "/refresh-token",
];

export const normalizeMethod = (method) =>
  String(method || "get").toLowerCase();

/**
 * Only idempotent-by-specification methods are retried automatically after a
 * timeout or network failure. A lost response on a write could otherwise mean
 * the write happened and the retry creates a second record.
 */
export const shouldRetryMethod = (method) =>
  SAFE_RETRY_METHODS.has(normalizeMethod(method));

export const isMutatingMethod = (method) =>
  MUTATING_METHODS.has(normalizeMethod(method));

/** Strips the origin, the `/api` prefix and any query string. */
export const normalizePath = (url) => {
  const path = String(url || "").split("?")[0].replace(/^https?:\/\/[^/]+/, "");
  return path.startsWith("/api/") ? path.slice(4) : path;
};

export const isFinancialMutation = (config) => {
  if (!isMutatingMethod(config?.method)) {
    return false;
  }

  const path = normalizePath(config?.url);
  const segment = path.split("/")[1] || "";

  return FINANCIAL_COLLECTIONS.includes(segment);
};

/** A request whose 401 must not be answered with a refresh attempt. */
export const isAuthExemptRequest = (config) => {
  const path = normalizePath(config?.url);

  if (AUTH_EXEMPT_PATHS.some((exempt) => path.includes(exempt))) {
    return true;
  }

  // Account creation is unauthenticated but is not an auth endpoint by name.
  return normalizeMethod(config?.method) === "post" && path === "/user";
};

/** Timeout / offline / DNS style failures — the request may or may not have run. */
export const isRetryableNetworkError = (error) => {
  if (error?.response) {
    return false;
  }

  const message = String(error?.message || "");
  const code = error?.code;

  return (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    message.includes("timeout") ||
    message.includes("Network Error")
  );
};

export const createIdempotencyKey = () => {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const readHeader = (headers, name) => {
  if (!headers) {
    return undefined;
  }

  if (typeof headers.get === "function") {
    return headers.get(name) ?? undefined;
  }

  return headers[name];
};

const writeHeader = (config, name, value) => {
  if (config.headers && typeof config.headers.set === "function") {
    config.headers.set(name, value);
    return;
  }

  config.headers = config.headers || {};
  config.headers[name] = value;
};

/**
 * Attaches an idempotency key to a financial mutation exactly once.
 *
 * The key lives on the request config, so every retry of the same logical call
 * (network retry or post-refresh retry) re-sends the identical key and the
 * backend can replay its stored response instead of writing a second record.
 */
export const ensureIdempotencyKey = (config, generate = createIdempotencyKey) => {
  const existing = readHeader(config?.headers, "Idempotency-Key");

  if (existing) {
    return existing;
  }

  if (!isFinancialMutation(config)) {
    return null;
  }

  const key = generate();
  writeHeader(config, "Idempotency-Key", key);

  return key;
};

/**
 * Collapses concurrent calls into one in-flight promise.
 *
 * Used for token refresh: five parallel 401 responses produce a single
 * `/user/refresh-token` request, and every caller awaits the same result.
 */
export const createSingleFlight = (operation) => {
  let inFlight = null;

  return (...args) => {
    if (!inFlight) {
      inFlight = Promise.resolve()
        .then(() => operation(...args))
        .finally(() => {
          inFlight = null;
        });
    }

    return inFlight;
  };
};
