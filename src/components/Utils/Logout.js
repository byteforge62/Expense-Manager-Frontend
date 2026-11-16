import { store } from "../../redux/store";
import { logoutSession } from "../../redux/slices/authSlice";
import { clearLegacyAuthStorage, redirectToLogin } from "./session";

/**
 * The one logout implementation.
 *
 * Order matters: local session state is cleared synchronously (so private
 * routes stop rendering and no stale bearer token can be attached to a later
 * request), then the backend revokes the refresh-token session, then the
 * browser is sent to the login screen. A failed revoke can never leave the SPA
 * authenticated, and repeated clicks share one revoke request.
 */
export const logout = () => {
  clearLegacyAuthStorage();

  // dispatch(logoutSession()) clears Redux synchronously before the request.
  const pending = store.dispatch(logoutSession());

  redirectToLogin();

  return pending;
};
