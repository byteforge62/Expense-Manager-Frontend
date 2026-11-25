import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../components/Utils/axiosInstance", () => ({
  default: {
    post,
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
  injectStore: vi.fn(),
  refreshAccessToken: vi.fn(),
  retryAfterRefresh: vi.fn(),
  resolveApiBaseUrl: vi.fn(),
}));

import { ForgotPassword } from "../ForgotPassword";
import { ResetPassword } from "../ResetPassword";

const renderAt = (path, element, routePath) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/forgot-password" element={<div>Forgot Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

const renderForgot = () =>
  renderAt("/forgot-password", <ForgotPassword />, "/forgot-password");

const renderReset = (token = "token-abc123") =>
  renderAt(
    `/reset-password/${token}`,
    <ResetPassword />,
    "/reset-password/:token",
  );

const submitButton = (name) =>
  screen.getByRole("button", { name: new RegExp(name, "i") });

describe("Forgot password page", () => {
  beforeEach(() => {
    post.mockReset();
  });

  test("validates the email before calling the API", async () => {
    renderForgot();

    fireEvent.click(submitButton("Send Reset Link"));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  test("rejects a malformed email", async () => {
    renderForgot();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(submitButton("Send Reset Link"));

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  test("submits the normalized email to the forgot-password endpoint", async () => {
    post.mockResolvedValue({ status: 200, data: { success: true } });
    renderForgot();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "  Ada@Example.com " },
    });
    fireEvent.click(submitButton("Send Reset Link"));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(post).toHaveBeenCalledWith("/user/forgotpassword", {
      email: "ada@example.com",
    });
  });

  test("shows a generic confirmation that cannot reveal whether the account exists", async () => {
    post.mockResolvedValue({ status: 200, data: { success: true } });
    renderForgot();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "someone@example.com" },
    });
    fireEvent.click(submitButton("Send Reset Link"));

    const confirmation = await screen.findByText(/if an account exists for that email/i);
    expect(confirmation).toBeInTheDocument();
    expect(screen.queryByText(/no account|not found|does not exist/i)).toBeNull();
  });

  test("offers the development reset link when email delivery is unavailable", async () => {
    const devResetUrl = "http://localhost:5174/reset-password/dev-token-123";
    post.mockResolvedValue({
      status: 200,
      data: { success: true, data: { devResetUrl } },
    });
    renderForgot();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "someone@example.com" },
    });
    fireEvent.click(submitButton("Send Reset Link"));

    expect(
      await screen.findByText(/email delivery is unavailable/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open reset link/i })).toHaveAttribute(
      "href",
      devResetUrl,
    );
  });

  test("links back to the sign-in page", () => {
    renderForgot();

    expect(screen.getByRole("link", { name: /back to sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});

describe("Reset password page", () => {
  beforeEach(() => {
    post.mockReset();
  });

  const fillPasswords = (password, confirmation = password) => {
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: password },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: confirmation },
    });
  };

  test("reads the token from the route and submits it", async () => {
    post.mockResolvedValue({ status: 200, data: { success: true } });
    renderReset("route-token-xyz");

    fillPasswords("NewPass123");
    fireEvent.click(submitButton("Reset Password"));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(post).toHaveBeenCalledWith("/user/resetpassword", {
      token: "route-token-xyz",
      password: "NewPass123",
    });
  });

  test("rejects mismatched passwords without calling the API", async () => {
    renderReset();

    fillPasswords("NewPass123", "Different456");
    fireEvent.click(submitButton("Reset Password"));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  test("enforces the password policy locally", async () => {
    renderReset();

    fillPasswords("weakpass", "weakpass");
    fireEvent.click(submitButton("Reset Password"));

    expect(
      await screen.findByText(/must contain uppercase, lowercase and a number/i),
    ).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  test("shows the confirmation and a route to sign in after success", async () => {
    post.mockResolvedValue({ status: 200, data: { success: true } });
    renderReset();

    fillPasswords("NewPass123");
    fireEvent.click(submitButton("Reset Password"));

    expect(await screen.findByText("Password updated")).toBeInTheDocument();

    fireEvent.click(submitButton("Continue to Sign In"));

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  test("displays an expired or invalid link error from the server", async () => {
    post.mockRejectedValue({
      response: {
        status: 400,
        data: { success: false, message: "This password reset link is invalid or has expired" },
      },
    });
    renderReset();

    fillPasswords("NewPass123");
    fireEvent.click(submitButton("Reset Password"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/invalid or has expired/i);
    // The form stays available so the user can retry with a fresh link.
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
  });

  test("reports a generic failure when the server errors", async () => {
    post.mockRejectedValue({ response: { status: 500, data: {} } });
    renderReset();

    fillPasswords("NewPass123");
    fireEvent.click(submitButton("Reset Password"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/could not reset your password/i);
  });
});
