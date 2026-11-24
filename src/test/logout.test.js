import { beforeEach, describe, expect, test, vi } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../components/Utils/axiosInstance", () => ({
  default: { post, get: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
  injectStore: vi.fn(),
  refreshAccessToken: vi.fn(),
  retryAfterRefresh: vi.fn(),
  resolveApiBaseUrl: vi.fn(),
}));

import { logout } from "../components/Utils/Logout";
import { loginSuccess } from "../store/slices/authSlice";
import { store } from "../store/store";
import { resetRedirectGuard } from "../components/Utils/session";

const signIn = () => {
  store.dispatch(
    loginSuccess({
      user: { _id: "u1", name: "Ada", role: "User" },
      role: "User",
      token: "token-123",
    }),
  );
};

describe("logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetRedirectGuard();
    post.mockReset().mockResolvedValue({ data: { success: true } });

    // Legacy keys written by older builds.
    localStorage.setItem("id", "u1");
    localStorage.setItem("role", "User");
  });

  test("clears every client-side authentication storage key", () => {
    signIn();
    localStorage.setItem("id", "u1");
    localStorage.setItem("role", "User");

    logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("id")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("role")).toBeNull();
  });

  test("clears Redux authentication state synchronously", () => {
    signIn();
    expect(store.getState().auth.isAuthenticated).toBe(true);

    logout();

    const auth = store.getState().auth;
    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
    expect(auth.role).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
  });

  test("revokes the refresh-token session through the backend", () => {
    signIn();

    logout();

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/user/logout");
  });

  test("repeated clicks issue a single revoke request", () => {
    signIn();

    logout();
    logout();
    logout();

    expect(post).toHaveBeenCalledTimes(1);
  });

  test("a failing revoke request cannot leave the user authenticated", async () => {
    signIn();
    post.mockRejectedValue(new Error("offline"));

    await expect(logout()).resolves.toBeUndefined();

    expect(store.getState().auth.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  test("redirects to login once", () => {
    signIn();

    logout();
    logout();

    expect(window.location.assign).toHaveBeenCalledTimes(1);
    expect(window.location.assign).toHaveBeenCalledWith("/login");
  });
});
