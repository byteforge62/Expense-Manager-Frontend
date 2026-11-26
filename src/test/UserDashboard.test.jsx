import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

import authReducer, { loginSuccess } from "../store/slices/authSlice";
import budgetReducer from "../store/slices/budgetSlice";
import incomeReducer from "../store/slices/incomeSlice";
import expensesReducer from "../store/slices/expensesSlice";
import { UserDashboard } from "../components/User/UserDashboard";

const budget = { _id: "bud-1", amount: 30000 };
const income = {
  _id: "inc-1",
  amount: 50000,
  date: new Date().toISOString(),
};
const expense = {
  _id: "exp-1",
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
      expenses: expensesReducer,
    },
    preloadedState: {
      auth: { ...auth, user: { _id: "user-1", name: "Ada" } },
    },
  });
};

const dashboardTree = (store) => (
  <Provider store={store}>
    <MemoryRouter>
      <UserDashboard />
    </MemoryRouter>
  </Provider>
);

const renderDashboard = () => render(dashboardTree(makeStore()));

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

    expect(
      screen.getByRole("heading", { name: "Overview" }),
    ).toBeInTheDocument();
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

  test("shows recent purchases beside their impact on this month", async () => {
    get.mockImplementation((url) => {
      if (url === "/budgets/me") return Promise.resolve({ data: { data: [budget] } });
      if (url === "/incomes/me") return Promise.resolve({ data: { data: [income] } });
      if (url === "/expenses/me") {
        return Promise.resolve({ data: { data: [expense] } });
      }
      if (url === "/purchases/summary") {
        return Promise.resolve({
          data: {
            data: {
              totals: {
                purchaseCount: 2,
                totalSpend: 5000,
                itemCount: 3,
                averageSpend: 2500,
              },
              byMerchant: [{ merchant: "Amazon", spend: 5000, count: 2 }],
              byMonth: [],
              largest: [{ _id: "p1", name: "Sony Headphones", totalAmount: 4999 }],
              recent: [],
            },
          },
        });
      }
      if (url === "/purchases/me") {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: "p1",
                name: "Sony Headphones",
                merchant: "Amazon",
                totalAmount: 4999,
                quantity: 1,
                purchaseDate: new Date().toISOString(),
              },
              {
                _id: "p2",
                name: "USB Cable",
                merchant: "Flipkart",
                totalAmount: 1,
                quantity: 2,
                purchaseDate: new Date().toISOString(),
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    renderDashboard();
    await settle();

    expect(await screen.findByText("Impact this month")).toBeInTheDocument();
    expect(screen.getByText("Recent purchases")).toBeInTheDocument();
    expect(screen.getByText("USB Cable")).toBeInTheDocument();
    expect(
      screen.getAllByText(/2 purchases · 3 items/).length,
    ).toBeGreaterThan(0);
    // 5,000 of the 50,000 income recorded this month.
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("Against ₹50,000 income")).toBeInTheDocument();
    const purchaseLinks = screen.getAllByRole("link", {
      name: /open purchase log/i,
    });
    expect(purchaseLinks.length).toBeGreaterThan(0);
    purchaseLinks.forEach((link) =>
      expect(link).toHaveAttribute("href", "/private/purchases"),
    );
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
    expect(screen.queryByText("Inflow and outflow")).toBeNull();
    expect(screen.queryByText("Spending by category")).toBeNull();
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
    expect(screen.getByText("Inflow and outflow")).toBeInTheDocument();
    expect(screen.getByText("Income against expenses")).toBeInTheDocument();
    // The category pie is data-driven: one expense with a category name.
    expect(screen.getByText("Spending by category")).toBeInTheDocument();
    expect(screen.getByText("Where this month went")).toBeInTheDocument();
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

    expect(screen.getByText("Inflow and outflow")).toBeInTheDocument();
    expect(screen.queryByText("Spending by category")).toBeNull();
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

  test("disables the composer while empty or pending and reports a failed send", async () => {
    mockHappyPath();
    post.mockRejectedValue(new Error("Network Error"));
    renderDashboard();
    await settle();

    const chatCard = screen
      .getByText("Financial assistant")
      .closest(".MuiCard-root");
    const send = within(chatCard).getByRole("button");
    const input = screen.getByPlaceholderText(/ask a question about your finances/i);

    expect(send).toBeDisabled();

    fireEvent.change(input, { target: { value: "Where did my money go?" } });
    expect(send).not.toBeDisabled();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(
      await screen.findByText("Communication failed. Please check your network."),
    ).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith("/ai/ask", { message: "Where did my money go?" });

    // The composer is cleared and usable again after the failure.
    await waitFor(() => expect(input).toHaveValue(""));
    expect(send).toBeDisabled();
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

  test("initialization issues 7 requests: the financial slices plus bills and purchases", async () => {
    mockHappyPath();
    renderDashboard();
    await settle();

    const calls = get.mock.calls.map(([url]) => url);

    // Exact issue order of the init effect: budget pair, income pair, the
    // full-expense thunk, then the recurring fetch.
    expect(calls.slice(0, 7)).toEqual([
      "/budgets/me",
      "/incomes/me",
      "/expenses/me",
      "/recurring/upcoming",
      "/bills/me",
      "/purchases/summary",
      "/purchases/me",
    ]);

    expect(calls.filter((url) => url === "/budgets/me")).toHaveLength(1);
    expect(calls.filter((url) => url === "/incomes/me")).toHaveLength(1);
    expect(calls.filter((url) => url === "/recurring/upcoming")).toHaveLength(1);
    expect(calls.filter((url) => url === "/bills/me")).toHaveLength(1);
    expect(calls.filter((url) => url === "/purchases/summary")).toHaveLength(1);
    expect(calls.filter((url) => url === "/purchases/me")).toHaveLength(1);

    // Expenses are read once and shared: the budget and income slices no
    // longer keep their own copies of /expenses/me.
    const expenseCalls = get.mock.calls.filter(([url]) => url === "/expenses/me");
    expect(expenseCalls).toHaveLength(1);
    expect(expenseCalls.filter(([, config]) => config?.params)).toHaveLength(1);

    // Three financial reads, then recurring, bills and purchase planning.
    expect(calls).toHaveLength(7);
  });

  test("makes no further requests after unmount", async () => {
    mockHappyPath();
    const { unmount } = renderDashboard();
    await settle();

    const before = get.mock.calls.length;
    unmount();
    await act(async () => {});
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(get.mock.calls.length).toBe(before);
  });

  test("a fresh render after unmount re-initializes the dashboard", async () => {
    mockHappyPath();
    const first = renderDashboard();
    await settle();
    first.unmount();

    // A brand new instance with its own store: the counts must double exactly.
    render(dashboardTree(makeStore()));
    await waitFor(() =>
      expect(
        get.mock.calls.filter(([url]) => url === "/budgets/me"),
      ).toHaveLength(2),
    );

    const urls = get.mock.calls.map(([url]) => url);
    expect(urls.filter((url) => url === "/incomes/me")).toHaveLength(2);
    expect(urls.filter((url) => url === "/expenses/me")).toHaveLength(2);
    expect(urls.filter((url) => url === "/recurring/upcoming")).toHaveLength(2);
    expect(urls.filter((url) => url === "/bills/me")).toHaveLength(2);
    expect(urls.filter((url) => url === "/purchases/summary")).toHaveLength(2);
    expect(urls.filter((url) => url === "/purchases/me")).toHaveLength(2);
    // 7 reads per mount, two independent mounts.
    expect(urls).toHaveLength(14);
  });

  test("re-rendering the same dashboard adds no requests", async () => {
    mockHappyPath();
    const store = makeStore();
    const { rerender } = render(dashboardTree(store));
    await settle();

    const before = get.mock.calls.length;
    rerender(dashboardTree(store));
    await new Promise((resolve) => setTimeout(resolve, 50));

    // userId and dispatch are unchanged, so the init effect must not re-run.
    expect(get.mock.calls.length).toBe(before);
  });

  test("changing the signed-in user re-initializes exactly once", async () => {
    mockHappyPath();
    const store = makeStore();
    render(dashboardTree(store));
    await settle();

    expect(
      get.mock.calls.filter(([url]) => url === "/budgets/me"),
    ).toHaveLength(1);

    await act(async () => {
      store.dispatch(
        loginSuccess({ user: { _id: "user-2" }, role: "User", token: "t" }),
      );
    });

    await waitFor(() =>
      expect(
        get.mock.calls.filter(([url]) => url === "/budgets/me"),
      ).toHaveLength(2),
    );
    // The effect re-ran once for the new userId: 7 more requests, not a loop.
    expect(get.mock.calls).toHaveLength(14);
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
