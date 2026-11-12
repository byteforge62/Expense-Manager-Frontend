import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders as render } from "./test-utils";
import { MemoryRouter } from "react-router-dom";
import { Login } from "../Login";
import { beforeEach, expect, vi } from "vitest";
import { AuthProvider } from "../context/AuthContext";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("../components/Utils/axiosInstance", () => ({
  default: { post },
}));

describe("Login Component", () => {
  beforeEach(() => {
    post.mockReset();
    localStorage.clear();
  });

  test("renders Login Form", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
  });

  test("accepts the backend's nested login response and stores the session", async () => {
    const user = {
      _id: "user-123",
      email: "pat@example.com",
      role: "User",
    };
    post.mockResolvedValue({
      status: 200,
      data: {
        success: true,
        message: "Login Successfully",
        data: { token: "access-token", user },
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/user/login", {
        email: user.email,
        password: "Password123",
      });
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(user);
      expect(localStorage.getItem("token")).toBe("access-token");
    });
  });
});
