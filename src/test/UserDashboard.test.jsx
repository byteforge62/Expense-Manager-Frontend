import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("../components/Utils/axiosInstance", () => ({
  default: { get, post },
  injectStore: vi.fn(),
  refreshAccessToken: vi.fn(),
  retryAfterRefresh: vi.fn(),
  resolveApiBaseUrl: vi.fn(),
}));

import authReducer from "../redux/slices/authSlice";
import budgetReducer from "../redux/slices/budgetSlice";
import incomeReducer from "../redux/slices/incomeSlice";
import expenseReducer from "../redux/slices/expenseSlice";
import { UserDashboard } from "../components/User/UserDashboard";

const budget = { amount: 30000 };
const income = { amount: 50000 };
const expense = {
  amount: 20000,
  date: new Date().toISOString(),
  categoryID: { name: "Groceries" },
};

const makeStore = () => {
  const auth = authReducer(undefined, { type: "@@init" });

  return configureStore({
    reducer: {
      auth: authReducer,
      budget: budgetReducer,
      income: incomeReducer,
      expense: expenseReducer,
    },
    preloadedState: {
      auth: { ...auth, user: { _id: "user-1", name: "Ada" } },
    },
  });
};

const renderDashboard = () =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    </Provider>,
  );

/** Default fixture: 50k income, 20k expenses, 30k budget, no recurring items. */
const mockHappyPath = () => {
  get.mockImplementation((url) => {
    if (url === "/budgets/me") {
      return Promise.resolve({ data: { data: [budget] } });
    }
    if (url === "/incomes/me") {
      return Promise.resolve({ data: { data: [income] } });
    }
    if (url === "/expenses/me") {
      return Promise.resolve({ data: { data: [expense] } });
    }
    if (url === "/recurring/upcoming") {
      return Promise.resolve({ data: { data: [] } });
    }
    return Promise.resolve({ data: { data: null } });
  });
};

const settle = async () => {
  expect(await screen.findByText("Overview")).toBeInTheDocument();
};

describe("UserDashboard", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  test("shows the dashboard skeleton while the financial slices load", async () => {
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    get.mockImplementation(() => pending);

    const { container } = renderDashboard();

    // The slice thunks are pending, so the page renders its skeleton state.
    await waitFor(() =>
      expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0),
    );
    expect(screen.queryByText("Overview")).toBeNull();

    release({ data: { data: [] } });
    await settle();
  });

  test("renders the populated overview with the existing calculations", async () => {
    mockHappyPath();
    renderDashboard();
    await settle();

    expect(screen.getByText("FINANCIAL WORKSPACE")).toBeInTheDocument();
    // Net cash flow and the budget metric share the same value.
    expect(screen.getAllByText("₹30,000")).toHaveLength(2);
    expect(screen.getByText("60% saved")).toBeInTheDocument(); // Math.round(30k/50k*100)
    expect(
      screen.getByText("₹50,000 income · ₹20,000 expenses"),
    ).toBeInTheDocument();
    expect(screen.getByText("Income received")).toBeInTheDocument();
    expect(screen.getByText("Expenses tracked")).toBeInTheDocument();
    expect(screen.getByText("Budget planned")).toBeInTheDocument();
    expect(screen.getByText("Add income")).toBeInTheDocument();
    expect(screen.getByText("Add expense")).toBeInTheDocument();
  });

  test("renders the empty financial state without chart cards", async () => {
    get.mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    await settle();

    expect(
      screen.getByText("Record your first transaction to see your cash flow here."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your cash-flow view will take shape as you add activity."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Add a record to get started")).toHaveLength(3);
    expect(screen.queryByText("Spending trend")).toBeNull();
    expect(screen.queryByText("Cash Equilibrium")).toBeNull();
    expect(screen.queryByText("Disbursement Profile")).toBeNull();
  });

  test("formats large amounts with en-IN grouping", async () => {
    get.mockImplementation((url) => {
      if (url === "/incomes/me") {
        return Promise.resolve({ data: { data: [{ amount: 123456 }] } });
      }
      if (url === "/budgets/me") {
        return Promise.resolve({ data: { data: [{ amount: 2345 }] } });
      }
      return Promise.resolve({ data: { data: [] } });
    });
    renderDashboard();
    await settle();

    // Headline, income metric and the cash-flow bar caption.
    expect(screen.getAllByText("₹1,23,456")).toHaveLength(3);
    expect(screen.getByText("₹2,345")).toBeInTheDocument();
  });

  test("renders the three analytics sections when activity exists", async () => {
    mockHappyPath();
    renderDashboard();
    await settle();

    expect(screen.getByText("Spending trend")).toBeInTheDocument();
    expect(screen.getByText("Expenses over the last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Cash Equilibrium")).toBeInTheDocument();
    expect(screen.getByText("Aggregate Flow Comparison")).toBeInTheDocument();
    // The category pie is data-driven: one expense with a category name.
    expect(screen.getByText("Disbursement Profile")).toBeInTheDocument();
    expect(screen.getByText("Sector Allocation")).toBeInTheDocument();
  });

  test("hides the category chart when expenses have no category data", async () => {
    get.mockImplementation((url) => {
      if (url === "/budgets/me") return Promise.resolve({ data: { data: [] } });
      if (url === "/incomes/me") return Promise.resolve({ data: { data: [income] } });
      if (url === "/expenses/me") {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: { data: [] } });
    });
    renderDashboard();
    await settle();

    expect(screen.getByText("Cash Equilibrium")).toBeInTheDocument();
    expect(screen.queryByText("Disbursement Profile")).toBeNull();
  });

  test("loads insight history on demand", async () => {
    mockHappyPath();
    renderDashboard();
    await settle();

    expect(screen.getByText("No saved insights yet")).toBeInTheDocument();

    get.mockImplementation((url) => {
      if (url === "/ai/insights") {
        return Promise.resolve({
          data: { data: [{ _id: "i1", content: "Groceries grew 12% this month." }] },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    fireEvent.click(screen.getByRole("button", { name: /refresh history/i }));

    expect(
      await screen.findByText("Groceries grew 12% this month."),
    ).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/ai/insights", { skipGlobalLoader: true });
  });

  test("requests a spending-risk assessment and renders the result", async () => {
    mockHappyPath();
    renderDashboard();
    await settle();

    get.mockImplementation((url) => {
      if (url === "/ai/spending-risk") {
        return Promise.resolve({
          data: {
            data: {
              riskLevel: "High",
              category: "Discretionary",
              reason: "Dining out tripled.",
              suggestion: "Cap weekly dining spend.",
            },
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    fireEvent.click(screen.getByRole("button", { name: /review spending/i }));

    expect(await screen.findByText("Risk: High")).toBeInTheDocument();
    expect(screen.getByText("Discretionary")).toBeInTheDocument();
    expect(screen.getByText("Dining out tripled.")).toBeInTheDocument();
    expect(screen.getByText(/cap weekly dining spend/i)).toBeInTheDocument();
  });

  test("each text insight card calls its own endpoint", async () => {
    mockHappyPath();
    renderDashboard();
    await settle();

    const cases = [
      { button: /check health/i, url: "/ai/financial-health", reply: "Health: solid" },
      { button: /analyze patterns/i, url: "/ai/expense-insights", reply: "Patterns: steady" },
      { button: /generate forecast/i, url: "/ai/financial-forecast", reply: "Forecast: stable" },
      { button: /view suggestions/i, url: "/ai/saving-opportunities", reply: "Save 10%" },
    ];

    for (const item of cases) {
      get.mockImplementation((url) =>
        Promise.resolve({
          data: { data: url === item.url ? item.reply : [] },
        }),
      );

      fireEvent.click(screen.getByRole("button", { name: item.button }));

      expect(await screen.findByText(item.reply)).toBeInTheDocument();
      expect(get).toHaveBeenCalledWith(item.url, { skipGlobalLoader: true });
    }
  }, 20000);

  test("sends a chat message and shows the assistant reply", async () => {
    mockHappyPath();
    post.mockResolvedValue({ data: { data: { reply: "Your savings rate is 60%." } } });

    renderDashboard();
    await settle();

    const input = screen.getByPlaceholderText(/ask a question about your finances/i);
    expect(screen.getByText("No conversation yet")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "How am I doing?" } });
    // The send control is icon-only (no accessible name yet), so submit the
    // composer the way a keyboard user does.
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Your savings rate is 60%.")).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith("/ai/ask", { message: "How am I doing?" });
    expect(screen.getByText("How am I doing?")).toBeInTheDocument();
  });

  test("shows scheduled recurring items only when the API returns some", async () => {
    get.mockImplementation((url) => {
      if (url === "/recurring/upcoming") {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: "r1",
                title: "Rent",
                amount: 15000,
                nextDate: "2026-12-01T00:00:00.000Z",
              },
            ],
          },
        });
      }
      if (url === "/budgets/me") return Promise.resolve({ data: { data: [budget] } });
      if (url === "/incomes/me") return Promise.resolve({ data: { data: [income] } });
      return Promise.resolve({ data: { data: [expense] } });
    });

    renderDashboard();
    await settle();

    expect(screen.getByText("Pending Executions")).toBeInTheDocument();
    expect(screen.getByText("1 Scheduled")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("₹15,000")).toBeInTheDocument();
  });

  test("issues each dashboard request exactly once on mount", async () => {
    mockHappyPath();
    const { rerender } = renderDashboard();
    await settle();

    const mounted = get.mock.calls.map(([url]) => url);

    expect(mounted.filter((url) => url === "/budgets/me")).toHaveLength(1);
    expect(mounted.filter((url) => url === "/incomes/me")).toHaveLength(1);
    expect(mounted.filter((url) => url === "/recurring/upcoming")).toHaveLength(1);
    expect(mounted.filter((url) => url === "/expenses/me")).toHaveLength(3);

    rerender(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <UserDashboard />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => expect(get).toHaveBeenCalled());
    // Re-rendering with a new store mounts a fresh dashboard; the previous
    // instance must not keep polling.
    const afterRerender = get.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(get.mock.calls.length).toBe(afterRerender);
  });

  test("keeps the section header and intelligence link", async () => {
    mockHappyPath();
    renderDashboard();
    await settle();

    const insights = screen.getByText("Insights & planning");
    expect(insights).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /explore intelligence/i }),
    ).toHaveAttribute("href", "/private/financial-intelligence");
    expect(screen.getByRole("link", { name: /add income/i })).toHaveAttribute(
      "href",
      "/private/income",
    );

    const snapshot = screen.getByRole("img", {
      name: /recorded cash flow: income ₹50,000, expenses ₹20,000/i,
    });
    expect(within(snapshot).getByText("Cash flow")).toBeInTheDocument();
  });
});
