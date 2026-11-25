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

// Charts are stubbed so the data handed to recharts is assertable in jsdom.
vi.mock("recharts", () => {
  const Chart = ({ children }) => <div>{children}</div>;
  const DataChart = ({ data, children }) => (
    <div data-testid="chart" data-json={data ? JSON.stringify(data) : undefined}>
      {children}
    </div>
  );
  return {
    BarChart: DataChart,
    PieChart: Chart,
    Bar: Chart,
    // <Pie> is what actually receives the category data in the source tree.
    Pie: DataChart,
    Cell: Chart,
    Tooltip: Chart,
    XAxis: Chart,
    YAxis: Chart,
    CartesianGrid: Chart,
    ResponsiveContainer: Chart,
  };
});

import authReducer from "../store/slices/authSlice";
import expensesReducer from "../store/slices/expensesSlice";
import categoryReducer from "../store/slices/categorySlice";
import { UserExpenses } from "../components/User/Expense/UserExpenses";

const categories = [
  { _id: "cat-1", name: "Groceries" },
  { _id: "cat-2", name: "Transport" },
];

/** Stable dates: mid-month at local noon so the UTC conversion keeps the same day. */
const thisMonthIso = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 15, 12).toISOString();
};
const lastYearIso = () => {
  const now = new Date();
  return new Date(now.getFullYear() - 1, now.getMonth(), 15, 12).toISOString();
};

const expense = (overrides = {}) => ({
  _id: "exp-1",
  amount: 1000,
  date: thisMonthIso(),
  description: "Groceries run",
  categoryID: { _id: "cat-1", name: "Groceries" },
  ...overrides,
});

const makeStore = (user = { _id: "user-1", name: "Ada" }) => {
  const auth = authReducer(undefined, { type: "@@init" });
  return configureStore({
    reducer: {
      auth: authReducer,
      expenses: expensesReducer,
      category: categoryReducer,
    },
    preloadedState: { auth: { ...auth, user } },
  });
};

const renderExpenses = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <UserExpenses />
      </MemoryRouter>
    </Provider>,
  );

const mockApi = ({ recent = [], all = [] } = {}) => {
  get.mockImplementation((url) => {
    if (url === "/categories") return Promise.resolve({ data: { data: categories } });
    if (url === "/expenses/recent") return Promise.resolve({ data: { data: recent } });
    if (url === "/expenses/me") return Promise.resolve({ data: { data: all } });
    return Promise.resolve({ data: { data: [] } });
  });
};

const callsTo = (url) => get.mock.calls.filter(([requested]) => requested === url).length;
const lastParams = (url) => {
  const calls = get.mock.calls.filter(([requested]) => requested === url);
  return calls[calls.length - 1]?.[1]?.params;
};

const inr = (value) => `₹${value.toLocaleString("en-IN")}`;

/** Default fixture: current-month 1000 + last-year 500 + invalid-date 300. */
const mockHappyPath = () =>
  mockApi({
    recent: [
      // /expenses/recent is unpopulated, so this category never resolves.
      expense({ _id: "rec-1", amount: 250, description: "Coffee", categoryID: "cat-1" }),
      expense({
        _id: "rec-2",
        amount: 400,
        description: "Fuel",
        categoryID: { _id: "cat-2", name: "Transport" },
      }),
    ],
    all: [
      expense({ _id: "exp-1", amount: 1000, description: "Groceries run" }),
      expense({
        _id: "exp-2",
        amount: 500,
        date: lastYearIso(),
        description: "Last year rent",
        categoryID: { _id: "cat-2", name: "Rent" },
      }),
      expense({
        _id: "exp-3",
        amount: 300,
        date: "not-a-date",
        description: "Undated",
      }),
    ],
  });

const waitForOverview = async () => {
  expect(await screen.findByText("Recent Expenses")).toBeInTheDocument();
};

describe("UserExpenses", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    del.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  test("renders the header, the spend statement and every section on one page", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    expect(screen.getByRole("heading", { name: "Expenses" })).toBeInTheDocument();
    expect(
      screen.getByText("Review spending by category, date, and amount."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Expense/i })).toBeInTheDocument();

    // No tab strip: every section is mounted together.
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Overview/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Analytics/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Records/ })).toBeNull();

    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    expect(screen.getByText("Monthly trend")).toBeInTheDocument();
    expect(screen.getByText("Spending Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Financial Ledger")).toBeInTheDocument();
    expect(screen.getByText("Recent Expenses")).toBeInTheDocument();
    expect(screen.getByText("2 Entries")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
  });

  test("renders every empty state at once", async () => {
    mockApi();
    renderExpenses();
    await waitForOverview();

    expect(screen.getByText("No recent expenses found.")).toBeInTheDocument();
    expect(screen.getByText("0 Entries")).toBeInTheDocument();
    expect(screen.getByText("Your records are empty")).toBeInTheDocument();
    expect(screen.getByText("0 Records")).toBeInTheDocument();
    expect(screen.getByText("No categorization data available.")).toBeInTheDocument();
  });

  test("computes totals, average, top category and chart data with the existing windows", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    // Totals cover every row, including last year's and the invalid-date row.
    expect(screen.getByText(inr(1800))).toBeInTheDocument();
    // (1000 + 500 + 300) / 3 = 600
    expect(screen.getByText(inr(600))).toBeInTheDocument();
    // This-month figure also appears as a ledger row amount.
    expect(screen.getAllByText(inr(1000)).length).toBeGreaterThanOrEqual(1);
    // Groceries 1300 > Rent 500 (the invalid-date row still counts here).
    expect(screen.getAllByText("Groceries").length).toBeGreaterThan(0);

    const [bar, pie] = await screen.findAllByTestId("chart");

    const trend = JSON.parse(bar.getAttribute("data-json"));
    expect(trend).toHaveLength(12);
    const monthIndex = new Date().getMonth();
    expect(trend[monthIndex].amount).toBe(1000); // only the current-year row
    expect(trend.reduce((sum, m) => sum + m.amount, 0)).toBe(1000);

    const breakdown = JSON.parse(pie.getAttribute("data-json"));
    expect(breakdown).toEqual([
      { name: "Groceries", value: 1300 },
      { name: "Rent", value: 500 },
    ]);
  });

  test("creates an expense with the exact payload and refetches both lists", async () => {
    mockHappyPath();
    post.mockResolvedValue({ status: 201, data: { data: {} } });
    renderExpenses();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Add Expense/i }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.change(within(dialog).getByDisplayValue("Select category"), {
      target: { value: "cat-2" },
    });
    fireEvent.change(within(dialog).getByPlaceholderText("0.00"), {
      target: { value: "450.5" },
    });
    fireEvent.change(dialog.querySelector('input[type="date"]'), {
      target: { value: "2025-05-04" },
    });
    fireEvent.change(
      within(dialog).getByPlaceholderText("Coffee, Rent, Fuel..."),
      { target: { value: "Bus pass" } },
    );
    fireEvent.click(within(dialog).getByRole("button", { name: /ADD EXPENSE/i }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/expense", {
        categoryID: "cat-2",
        amount: 450.5,
        date: "2025-05-04",
        description: "Bus pass",
      }),
    );

    await waitFor(() => expect(callsTo("/expenses/recent")).toBe(2));
    expect(callsTo("/expenses/me")).toBe(2);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // The submit lock is released and the dialog can be reopened afterwards.
    fireEvent.click(screen.getByRole("button", { name: /Add Expense/i }));
    const reopened = await screen.findByRole("dialog");
    expect(within(reopened).getByRole("button", { name: /ADD EXPENSE/i })).toBeEnabled();
  });

  test("exposes no edit affordance in the ledger", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    expect(await screen.findByText("3 Records")).toBeInTheDocument();

    expect(screen.queryByText(/edit/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
    const rows = screen.getAllByTitle("Delete Record");
    expect(rows).toHaveLength(3);
    // The ledger rows hold nothing but the delete control.
    const ledger = document.querySelector(".divide-y");
    expect(ledger.querySelectorAll("button")).toHaveLength(3);
    for (const button of rows) {
      expect(ledger.contains(button)).toBe(true);
    }
  });

  test("deletes only after confirmation and refetches both lists", async () => {
    mockHappyPath();
    del.mockResolvedValue({ data: {} });
    renderExpenses();
    await waitForOverview();

    await screen.findByText("3 Records");

    fireEvent.click(screen.getAllByTitle("Delete Record")[0]);
    expect(confirm).toHaveBeenCalledWith("Delete this expense permanently?");
    await waitFor(() => expect(del).toHaveBeenCalledWith("/expense/exp-1"));
    await waitFor(() => expect(callsTo("/expenses/me")).toBe(2));
    expect(callsTo("/expenses/recent")).toBe(2);
  });

  test("does nothing when the delete confirmation is cancelled", async () => {
    mockHappyPath();
    confirm.mockReturnValue(false);
    renderExpenses();
    await waitForOverview();

    fireEvent.click((await screen.findAllByTitle("Delete Record"))[0]);

    expect(confirm).toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
    expect(callsTo("/expenses/me")).toBe(1);
  });

  test("sends the category filter as an exact query parameter", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    const categorySelect = await screen.findByDisplayValue("All Categories");

    fireEvent.change(categorySelect, { target: { value: "cat-1" } });

    await waitFor(() => expect(lastParams("/expenses/me")).toEqual({ categoryID: "cat-1" }));
    // Filters now drive only the ledger read: categories and the recent strip
    // are reference data and are not refetched on every filter edit.
    expect(callsTo("/categories")).toBe(1);
    expect(callsTo("/expenses/recent")).toBe(1);
  });

  test("applies the date presets and custom range exactly as implemented", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    const preset = await screen.findByDisplayValue("All Time");

    // Mirrors the component's own (timezone-sensitive) computation.
    const now = new Date();
    const isoDay = (date) => date.toISOString().split("T")[0];

    fireEvent.change(preset, { target: { value: "thisMonth" } });
    await waitFor(() =>
      expect(lastParams("/expenses/me")).toEqual({
        startDate: isoDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: isoDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      }),
    );

    fireEvent.change(screen.getByDisplayValue("This Month"), {
      target: { value: "last3Months" },
    });
    await waitFor(() =>
      expect(lastParams("/expenses/me")).toEqual({
        startDate: isoDay(new Date(now.getFullYear(), now.getMonth() - 3, 1)),
        endDate: isoDay(new Date()),
      }),
    );

    fireEvent.change(screen.getByDisplayValue("Last 3 Months"), {
      target: { value: "custom" },
    });
    const dateInputs = Array.from(document.querySelectorAll('input[type="date"]'));
    expect(dateInputs).toHaveLength(2);

    const [startInput, endInput] = dateInputs;
    fireEvent.change(startInput, { target: { value: "2024-01-01" } });
    fireEvent.change(endInput, { target: { value: "2024-03-31" } });

    await waitFor(() =>
      expect(lastParams("/expenses/me")).toEqual({
        startDate: "2024-01-01",
        endDate: "2024-03-31",
      }),
    );
  });

  test("re-runs the ledger read once per filter edit and sends no pagination params", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    const minInput = await screen.findByPlaceholderText("Min ₹");

    fireEvent.change(minInput, { target: { value: "1" } });

    await waitFor(() => expect(lastParams("/expenses/me")).toEqual({ minAmount: "1" }));
    expect(callsTo("/categories")).toBe(1);
    expect(callsTo("/expenses/recent")).toBe(1);
    expect(callsTo("/expenses/me")).toBe(2);

    // Legacy list mode: the page never sends page/limit/search/sortBy.
    for (const [, config] of get.mock.calls.filter(([url]) => url === "/expenses/me")) {
      const keys = Object.keys(config?.params ?? {});
      for (const key of keys) {
        expect(["startDate", "endDate", "categoryID", "minAmount", "maxAmount"]).toContain(key);
      }
    }
  });

  test("has no upload input and no recurring controls", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Add Expense/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector('input[type="file"]')).toBeNull();
    expect(within(dialog).queryByText(/upload/i)).toBeNull();
    expect(within(dialog).queryByText(/recurring/i)).toBeNull();

    fireEvent.click(within(dialog).getAllByRole("button")[0]);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await screen.findByText("3 Records");
    expect(screen.queryByText(/recurring/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /recurring/i })).toBeNull();
  });

  test("blocks an empty submission with the existing messages", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Add Expense/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /ADD EXPENSE/i }));

    expect(await within(dialog).findByText("Please select a category")).toBeInTheDocument();
    expect(within(dialog).getByText("Amount is required")).toBeInTheDocument();
    expect(within(dialog).getByText("Date is required")).toBeInTheDocument();
    expect(within(dialog).getByText("Description is required")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
    expect(callsTo("/expenses/me")).toBe(1);
  });

  test("keeps the dialog open and logs when the POST fails", async () => {
    mockHappyPath();
    post.mockRejectedValue(new Error("400 Bad Request"));
    renderExpenses();
    await waitForOverview();

    fireEvent.click(screen.getByRole("button", { name: /Add Expense/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByDisplayValue("Select category"), {
      target: { value: "cat-1" },
    });
    fireEvent.change(within(dialog).getByPlaceholderText("0.00"), {
      target: { value: "50" },
    });
    fireEvent.change(dialog.querySelector('input[type="date"]'), {
      target: { value: "2025-05-04" },
    });
    fireEvent.change(within(dialog).getByPlaceholderText("Coffee, Rent, Fuel..."), {
      target: { value: "Snacks" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /ADD EXPENSE/i }));

    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith("Submission failed:", expect.any(Error)),
    );
    expect(callsTo("/expenses/me")).toBe(1);
    expect(callsTo("/expenses/recent")).toBe(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("opens the dialog from every existing trigger without leaving the page", async () => {
    mockApi();
    renderExpenses();
    await waitForOverview();

    // Header action.
    fireEvent.click(screen.getByRole("button", { name: /Add Expense/i }));
    let dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("New Expense")).toBeInTheDocument();
    fireEvent.click(within(dialog).getAllByRole("button")[0]);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // Recent list empty-state CTA.
    fireEvent.click(screen.getByRole("button", { name: /\+ Add New Expense/i }));
    dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getAllByRole("button")[0]);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // Ledger empty-state CTA and the ledger header button both open it too.
    fireEvent.click(screen.getByRole("button", { name: /REGISTER EXPENSE/i }));
    dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getAllByRole("button")[0]);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /NEW RECORD/i }));
    dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getAllByRole("button")[0]);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // Still the same single page: no view switch happened.
    expect(screen.getByText("Financial Ledger")).toBeInTheDocument();
    expect(screen.getByText("Recent Expenses")).toBeInTheDocument();
  });

  test("issues one request per endpoint on mount, in the existing order", async () => {
    mockHappyPath();
    renderExpenses();
    await waitForOverview();

    await waitFor(() => expect(callsTo("/expenses/me")).toBe(1));
    expect(get.mock.calls.map(([url]) => url)).toEqual([
      "/categories",
      "/expenses/recent",
      "/expenses/me",
    ]);
    expect(get.mock.calls[2][1]).toEqual({ params: {} });
  });

  test("renders zero amounts and keeps unpopulated recent categories as Uncategorized", async () => {
    mockApi({
      recent: [
        expense({ _id: "rec-1", amount: 0, description: "Free sample", categoryID: "cat-1" }),
        expense({ _id: "rec-2", amount: 0, description: "Gift", categoryID: null }),
      ],
      all: [
        expense({ _id: "exp-1", amount: 0, description: "Free sample" }),
        expense({
          _id: "exp-2",
          amount: 0,
          date: "not-a-date",
          description: "Undated zero",
          categoryID: null,
        }),
      ],
    });
    renderExpenses();
    await waitForOverview();

    expect(screen.getAllByText(inr(0)).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("2 Entries")).toBeInTheDocument();
    expect(screen.getAllByText("Uncategorized")).toHaveLength(2);

    const [bar, pie] = await screen.findAllByTestId("chart");
    expect(JSON.parse(bar.getAttribute("data-json"))).toHaveLength(12);
    // Both zero rows fall into "Other" because one category is unpopulated.
    expect(JSON.parse(pie.getAttribute("data-json"))).toEqual([
      { name: "Groceries", value: 0 },
      { name: "Other", value: 0 },
    ]);
  });
});
