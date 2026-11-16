/**
 * Session helpers shared by the logout flow and the Axios interceptor.
 *
 * Deliberately dependency-free: both callers import this module, so it must not
 * import the store or the Axios instance (that would create a require cycle).
 */

/** Keys written by the legacy auth context / older builds. */
export const LEGACY_AUTH_KEYS = ["id", "role", "token", "user"];

export const clearLegacyAuthStorage = () => {
  try {
    LEGACY_AUTH_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); session state
    // in Redux is still cleared by the caller.
  }
};

let redirecting = false;

/**
 * Sends the browser to the login screen at most once per session.
 *
 * Guards against redirect loops when several failed requests try to end the
 * session simultaneously. `resetRedirectGuard` runs when a new session starts.
 */
export const redirectToLogin = () => {
  if (typeof window === "undefined" || redirecting) {
    return false;
  }

  const path = window.location?.pathname || "";

  if (path === "/login") {
    return false;
  }

  redirecting = true;
  window.location.assign("/login");
  return true;
};

/** Called when a new session is established, so the next logout may redirect. */
export const resetRedirectGuard = () => {
  redirecting = false;
};
