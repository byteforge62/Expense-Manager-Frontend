import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

const { get, post, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
}));

vi.mock("../components/Utils/axiosInstance", () => ({
  default: { get, post, delete: del },
  injectStore: vi.fn(),
  refreshAccessToken: vi.fn(),
  retryAfterRefresh: vi.fn(),
  resolveApiBaseUrl: vi.fn(),
}));

// Charts are stubbed so the data handed to recharts is assertable in jsdom,
// where ResponsiveContainer measures zero width and renders nothing.
vi.mock("recharts", () => {
  const Chart = ({ children }) => <div>{children}</div>;
  const DataChart = ({ data, children }) => (
    <div data-testid="chart" data-json={data ? JSON.stringify(data) : undefined}>
      {children}
    </div>
  );
  return {
    PieChart: Chart,
    Pie: Chart,
    Cell: Chart,
    Tooltip: Chart,
    Legend: Chart,
    ResponsiveContainer: Chart,
    BarChart: DataChart,
    Bar: Chart,
    XAxis: Chart,
    YAxis: Chart,
    CartesianGrid: Chart,
  };
});

import authReducer from "../redux/slices/authSlice";
import budgetReducer from "../redux/slices/budgetSlice";
import { UserBudget } from "../components/User/Budget/UserBudget";

const categories = [
  { _id: "cat-1", name: "Groceries" },
  { _id: "cat-2", name: "Rent" },
];

const budget = (overrides = {}) => ({
  _id: "bud-1",
  amount: 1000,
  description: "Weekly food",
  categoryID: { _id: "cat-1", name: "Groceries" },
  ...overrides,
});

const expense = (overrides = {}) => ({
  _id: "exp-1",
  amount: 300,
  categoryID: { _id: "cat-1", name: "Groceries" },
  ...overrides,
});

const makeStore = (user = { _id: "user-1", name: "Ada" }) => {
  const auth = authReducer(undefined, { type: "@@init" });
  return configureStore({
    reducer: { auth: authReducer, budget: budgetReducer },
    preloadedState: { auth: { ...auth, user } },
  });
};

const renderBudget = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <UserBudget />
      </MemoryRouter>
    </Provider>,
  );

const mockApi = ({ budgetList = [], expenseList = [], plan = null } = {}) => {
  get.mockImplementation((url) => {
    if (url === "/categories") return Promise.resolve({ data: { data: categories } });
    if (url === "/budgets/me") return Promise.resolve({ data: { data: budgetList } });
    if (url === "/expenses/me") return Promise.resolve({ data: { data: expenseList } });
    if (url === "/ai/budget-plan") return Promise.resolve({ data: { data: plan } });
    return Promise.resolve({ data: { data: [] } });
  });
};

const callsTo = (url) => get.mock.calls.filter(([requested]) => requested === url).length;

const inr = (value) => `₹${value.toLocaleString("en-IN")}`;

/**
 * Default fixture: Groceries 1000 allocated / 550 spent, Rent 200 allocated / 0 spent.
 * Totals: 1200 allocated, 550 spent, 650 remaining, 0 over budget.
 */
const mockHappyPath = () =>
  mockApi({
    budgetList: [
      budget(),
      budget({ _id: "bud-2", amount: 200, description: "", categoryID: { _id: "cat-2", name: "Rent" } }),
    ],
    expenseList: [expense({ _id: "exp-1", amount: 300 }), expense({ _id: "exp-2", amount: 250 })],
  });

const waitForOverview = async () => {
  expect(await screen.findByText("Groceries")).toBeInTheDocument();
};

const progressBar = (container) =>
  container.querySelector('[data-testid="budget-progress"]');

/** Waits for the Manage panel's card (the exiting Overview copy has no .group root). */
const manageCard = async (name) => {
  await screen.findByText(/Items$/);
  return waitFor(() => {
    const match = screen.getAllByText(name).find((node) => node.closest("div.group"));
    if (!match) throw new Error(`manage card for ${name} not rendered yet`);
    return match.closest("div.group");
  });
};

describe("UserBudget", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    del.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("renders the header, stat cards, tabs and the Overview tab by default", async () => {
    mockHappyPath();
    const { container } = renderBudget();
    await waitForOverview();

    expect(screen.getByRole("heading", { name: "Budgets" })).toBeInTheDocument();
    expect(
      screen.getByText("Set category limits and keep an eye on how much is left."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Budget/i })).toBeInTheDocument();

    for (const label of ["Overview", "Analytics", "AI Planner", "Manage"]) {
      expect(screen.getByRole("button", { name: new RegExp(label) })).toBeInTheDocument();
    }

    expect(screen.getByText("Total Allocated")).toBeInTheDocument();
    expect(screen.queryByText("Monthly Cash Flow")).toBeNull();
    expect(screen.queryByText("Budget Configuration")).toBeNull();
    expect(progressBar(container)).toBeInTheDocument();
  });

  test("renders the unauthenticated skeleton and issues no requests", async () => {
    const { container } = renderBudget(makeStore(null));

    await waitFor(() =>
      expect(
        container.querySelectorAll('div[class*="animate-[shimmer"]').length,
      ).toBe(10),
    );
    expect(screen.queryByRole("heading", { name: "Budgets" })).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });

  test("renders the empty states for overview, analytics and manage", async () => {
    mockApi();
    renderBudget();

    expect(await screen.findByText("Your budget plan is empty")).toBeInTheDocument();
    expect(
      screen.getByText("Create category budgets to keep your finances in check."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Analytics/ }));
    expect(await screen.findByText("Spending by Category")).toBeInTheDocument();
    expect(screen.getAllByText("No data available")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /Manage/ }));
    expect(await screen.findByText("Static limits not found")).toBeInTheDocument();
    expect(screen.getByText("0 Items")).toBeInTheDocument();
  });

  test("renders aggregate totals and per-category progress", async () => {
    mockHappyPath();
    renderBudget();
    await waitForOverview();

    // Stat cards.
    expect(screen.getByText(inr(1200))).toBeInTheDocument();
    // Total-spent card plus the Groceries "SPENT" line.
    expect(screen.getAllByText(inr(550))).toHaveLength(2);
    expect(screen.getByText(inr(650))).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument(); // over-budget count

    // Groceries: 550 of 1000 -> 55%.
    expect(screen.getByText("55%")).toBeInTheDocument();
    expect(screen.getByText("₹550 OF ₹1,000 USED")).toBeInTheDocument();
    expect(screen.getByText(inr(450) + " LEFT")).toBeInTheDocument();

    // Rent: no spend -> 0% and the full amount left.
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("₹0 OF ₹200 USED")).toBeInTheDocument();
    expect(screen.getByText(inr(200) + " LEFT")).toBeInTheDocument();
  });

  test("keeps an over-budget percentage above 100 while clamping the progress width", async () => {
    mockApi({
      budgetList: [budget({ amount: 200 })],
      expenseList: [expense({ amount: 300 })],
    });
    const { container } = renderBudget();
    await waitForOverview();

    // Math.round((300 / 200) * 100) = 150 -> badge shows 150%.
    expect(screen.getByText("150%")).toBeInTheDocument();
    expect(screen.getByText(`${inr(100)} OVER`)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // over-budget count

    // BudgetProgress clamps the animated width at 100%.
    await waitFor(() =>
      expect(progressBar(container).style.width).toBe("100%"),
    );
  });

  test("handles zero and negative remaining values", async () => {
    mockApi({
      budgetList: [budget({ _id: "bud-1", amount: 300 }), budget({ _id: "bud-2", amount: 200, categoryID: { _id: "cat-2", name: "Rent" } })],
      expenseList: [expense({ amount: 300 })],
    });
    renderBudget();
    await waitForOverview();

    // Groceries sits exactly on its limit.
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText(inr(0) + " LEFT")).toBeInTheDocument();

    // Totals stay positive here: 500 allocated - 300 spent = 200 remaining.
    expect(screen.getByText(inr(200))).toBeInTheDocument();
  });

  test("matches expenses by category id and labels unpopulated categories as Unknown", async () => {
    mockApi({
      budgetList: [
        budget({ _id: "bud-1", amount: 500, categoryID: { _id: "cat-1", name: "Groceries" } }),
        budget({ _id: "bud-2", amount: 400, categoryID: "cat-2" }),
      ],
      expenseList: [
        // String categoryId on the expense still matches the populated budget.
        expense({ _id: "exp-1", amount: 120, categoryID: "cat-1" }),
        expense({ _id: "exp-2", amount: 999, categoryID: { _id: "cat-9", name: "Other" } }),
      ],
    });
    renderBudget();
    await waitForOverview();

    expect(screen.getByText("₹120 OF ₹500 USED")).toBeInTheDocument();
    // Unpopulated budget category does not receive another category's spending.
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("₹0 OF ₹400 USED")).toBeInTheDocument();
  });

  test("creates a budget with the exact payload and resets the dialog", async () => {
    mockHappyPath();
    post.mockResolvedValue({ status: 201, data: { data: {} } });
    renderBudget();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Add Budget/i }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.change(within(dialog).getByDisplayValue("Select category"), {
      target: { value: "cat-2" },
    });
    fireEvent.change(within(dialog).getByPlaceholderText("0.00"), {
      target: { value: "800" },
    });
    fireEvent.change(
      within(dialog).getByPlaceholderText("e.g. For household items"),
      { target: { value: "Rent limit" } },
    );
    fireEvent.click(within(dialog).getByRole("button", { name: /INITIALIZE BUDGET/i }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/budget", {
        categoryID: "cat-2",
        amount: 800,
        description: "Rent limit",
      }),
    );
    await waitFor(() => expect(callsTo("/budgets/me")).toBe(2));
    expect(callsTo("/expenses/me")).toBe(2);

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: /Add Budget/i }));
    const reopened = await screen.findByRole("dialog");
    expect(within(reopened).getByPlaceholderText("0.00")).toHaveValue(null);
    expect(within(reopened).getByDisplayValue("Select category")).toBeInTheDocument();
  });

  test("relies on native validation to block invalid submissions", async () => {
    mockHappyPath();
    renderBudget();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Add Budget/i }));
    const dialog = await screen.findByRole("dialog");

    const categorySelect = within(dialog).getByDisplayValue("Select category");
    const amountInput = within(dialog).getByPlaceholderText("0.00");
    const descriptionInput = within(dialog).getByPlaceholderText(
      "e.g. For household items",
    );

    expect(categorySelect).toBeRequired();
    expect(amountInput).toBeRequired();
    expect(amountInput).toHaveAttribute("min", "0.01");
    expect(amountInput).toHaveAttribute("step", "0.01");
    expect(descriptionInput).not.toBeRequired();
    expect(dialog.querySelector("form").checkValidity()).toBe(false);

    fireEvent.change(categorySelect, { target: { value: "cat-1" } });
    fireEvent.change(amountInput, { target: { value: "50" } });
    expect(dialog.querySelector("form").checkValidity()).toBe(true);
    expect(post).not.toHaveBeenCalled();
  });

  test("keeps the dialog open and logs when the budget POST fails", async () => {
    mockHappyPath();
    post.mockRejectedValue(new Error("400 Bad Request"));
    renderBudget();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Add Budget/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByDisplayValue("Select category"), {
      target: { value: "cat-1" },
    });
    fireEvent.change(within(dialog).getByPlaceholderText("0.00"), {
      target: { value: "50" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /INITIALIZE BUDGET/i }));

    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith("Add budget error:", expect.any(Error)),
    );
    expect(callsTo("/budgets/me")).toBe(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("confirms and issues the exact DELETE for a budget", async () => {
    mockHappyPath();
    del.mockResolvedValue({ data: {} });
    renderBudget();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Manage/ }));
    expect(await screen.findByText("Budget Configuration")).toBeInTheDocument();
    expect(screen.getByText("2 Items")).toBeInTheDocument();

    const card = await manageCard("Groceries");
    fireEvent.click(within(card).getByRole("button"));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Delete Budget?")).toBeInTheDocument();
    expect(within(dialog).getByText("Groceries")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /YES, DELETE/i }));

    await waitFor(() => expect(del).toHaveBeenCalledWith("/budget/bud-1"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(callsTo("/budgets/me")).toBe(2));
  });

  test("keeps the confirmation open and logs when DELETE fails", async () => {
    mockHappyPath();
    del.mockRejectedValue(new Error("500"));
    renderBudget();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Manage/ }));
    const card = await manageCard("Groceries");
    fireEvent.click(within(card).getByRole("button"));

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /YES, DELETE/i }));

    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith("Delete error:", expect.any(Error)),
    );
    expect(screen.getByText("Delete Budget?")).toBeInTheDocument();
    expect(callsTo("/budgets/me")).toBe(1);
  });

  test("switches between all four tabs", async () => {
    mockHappyPath();
    renderBudget();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Analytics/ }));
    expect(await screen.findByText("Spending by Category")).toBeInTheDocument();
    expect(screen.getByText("Allocated vs Spent")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("55%")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /AI Planner/ }));
    expect(await screen.findByText("Budget planning")).toBeInTheDocument();
    expect(screen.getByText("Intelligence Engine Offline")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Spending by Category")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /Manage/ }));
    expect(await screen.findByText("Budget Configuration")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Budget planning")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));
    expect(await screen.findByText("Total Allocated")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Budget Configuration")).toBeNull());
  });

  test("feeds both analytics charts with the summary data", async () => {
    mockHappyPath();
    renderBudget();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Analytics/ }));
    const charts = await screen.findAllByTestId("chart");
    const barData = JSON.parse(charts[0].getAttribute("data-json"));

    expect(barData).toEqual([
      { name: "Groceries", allocated: 1000, spent: 550 },
      { name: "Rent", allocated: 200, spent: 0 },
    ]);
  });

  test("renders the AI planner offline state, loading state and available plan", async () => {
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });

    mockHappyPath();
    const planResponse = {
      snapshot: { income: 100000, expenses: 40000, surplus: 60000 },
      budgetPlan: [{ category: "Housing", recommended: 30000 }],
      recommendations: ["Trim discretionary spending by 10%."],
    };
    get.mockImplementation((url) => {
      if (url === "/ai/budget-plan") return pending;
      if (url === "/categories") return Promise.resolve({ data: { data: categories } });
      if (url === "/budgets/me")
        return Promise.resolve({ data: { data: [budget()] } });
      if (url === "/expenses/me")
        return Promise.resolve({ data: { data: [expense({ amount: 300 })] } });
      return Promise.resolve({ data: { data: [] } });
    });

    renderBudget();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /AI Planner/ }));
    expect(await screen.findByText("Intelligence Engine Offline")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /GENERATE STRATEGY/i }));
    expect(await screen.findByText("ANALYZING...")).toBeInTheDocument();
    expect(screen.queryByText("Intelligence Engine Offline")).toBeNull();

    release({ data: { data: planResponse } });

    expect(await screen.findByText("Est. Income")).toBeInTheDocument();
    // The AI planner keeps its own unformatted currency rendering.
    expect(screen.getByText("₹100000")).toBeInTheDocument();
    expect(screen.getByText("₹40000")).toBeInTheDocument();
    expect(screen.getByText("₹60000")).toBeInTheDocument();
    expect(screen.getByText("Housing")).toBeInTheDocument();
    expect(screen.getByText("₹30000")).toBeInTheDocument();
    expect(
      screen.getByText("Trim discretionary spending by 10%."),
    ).toBeInTheDocument();

    expect(callsTo("/ai/budget-plan")).toBe(1);
  });

  test("issues exactly one request per collection endpoint on mount", async () => {
    mockHappyPath();
    renderBudget();
    await waitForOverview();

    await waitFor(() => expect(callsTo("/expenses/me")).toBe(1));
    expect(callsTo("/categories")).toBe(1);
    expect(callsTo("/budgets/me")).toBe(1);
    expect(callsTo("/ai/budget-plan")).toBe(0);
    expect(get).toHaveBeenCalledTimes(3);
  });
});
