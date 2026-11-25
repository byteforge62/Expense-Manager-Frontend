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
    BarChart: DataChart,
    LineChart: DataChart,
    Bar: Chart,
    Line: Chart,
    XAxis: Chart,
    YAxis: Chart,
    CartesianGrid: Chart,
    Legend: Chart,
    Tooltip: Chart,
    ResponsiveContainer: Chart,
    ReferenceLine: ({ y, label }) => (
      <div data-testid="avg-line" data-y={y}>
        {label?.value}
      </div>
    ),
  };
});

import authReducer from "../store/slices/authSlice";
import incomeReducer from "../store/slices/incomeSlice";
import expensesReducer from "../store/slices/expensesSlice";
import { UserIncome } from "../components/User/Income/UserIncome";

const JAN = "2025-01-15T00:00:00.000Z";
const FEB = "2025-02-10T00:00:00.000Z";

const income = (overrides = {}) => ({
  _id: "inc-1",
  amount: 1000,
  source: "Salary",
  date: JAN,
  ...overrides,
});

const expense = (overrides = {}) => ({
  _id: "exp-1",
  amount: 400,
  date: JAN,
  ...overrides,
});

const recurring = (overrides = {}) => ({
  _id: "rec-1",
  name: "Monthly retainer",
  amount: 2500,
  frequency: "monthly",
  startDate: JAN,
  ...overrides,
});

const makeStore = () => {
  const auth = authReducer(undefined, { type: "@@init" });
  return configureStore({
    reducer: {
      auth: authReducer,
      income: incomeReducer,
      expenses: expensesReducer,
    },
    preloadedState: {
      auth: { ...auth, user: { _id: "user-1", name: "Ada" } },
    },
  });
};

const renderIncome = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <UserIncome />
      </MemoryRouter>
    </Provider>,
  );

const mockApi = ({ incomes = [], expenses = [], recurrings = [] } = {}) => {
  get.mockImplementation((url) => {
    if (url === "/incomes/me") return Promise.resolve({ data: { data: incomes } });
    if (url === "/expenses/me") return Promise.resolve({ data: { data: expenses } });
    if (url === "/recurring/me") return Promise.resolve({ data: { data: recurrings } });
    return Promise.resolve({ data: { data: [] } });
  });
};

const callsTo = (url) => get.mock.calls.filter(([requested]) => requested === url).length;

const inr = (value) => `₹${value.toLocaleString("en-IN")}`;
const inrDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** Default fixture: 1,500 in, 400 out, 73.33% efficiency, one recurring schedule. */
const mockHappyPath = () =>
  mockApi({
    incomes: [
      income({ _id: "inc-1", amount: 1000, source: "Salary", date: JAN }),
      income({ _id: "inc-2", amount: 500, source: "Freelance Retainer", date: FEB }),
    ],
    expenses: [expense({ amount: 400 })],
    recurrings: [recurring()],
  });

const waitForSummary = async () => {
  expect(await screen.findByText("Total Wealth")).toBeInTheDocument();
};

describe("UserIncome", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    del.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("renders the header and every income section on one page without tabs", async () => {
    mockHappyPath();
    renderIncome();
    await waitForSummary();

    expect(screen.getByRole("heading", { name: "Income" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Review income sources and trends, and manage recurring income.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Income/i })).toBeInTheDocument();

    expect(screen.getByText("Wealth Optimization Insights")).toBeInTheDocument();
    expect(screen.getByText("Monthly Cash Flow")).toBeInTheDocument();
    expect(screen.getByText("Financial Records")).toBeInTheDocument();
    expect(screen.getByText("Recurring income")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  test("shows the loading shimmer while the income slice is pending", async () => {
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    get.mockImplementation(() => pending);

    const { container } = renderIncome();

    await waitFor(() =>
      expect(
        container.querySelectorAll('div[class*="animate-[shimmer"]').length,
      ).toBe(5),
    );
    expect(screen.queryByText("Total Wealth")).toBeNull();

    release({ data: { data: [] } });
    await waitForSummary();
  });

  test("renders summary totals and the exact savings-rate formatting", async () => {
    mockHappyPath();
    renderIncome();
    await waitForSummary();

    expect(screen.getByText(inr(1500))).toBeInTheDocument();
    expect(screen.getByText(inr(400))).toBeInTheDocument();
    expect(screen.getByText(inr(1100))).toBeInTheDocument();
    // ((1500 - 400) / 1500) * 100 = 73.33 -> kept as the existing string.
    expect(screen.getByText("73.33%")).toBeInTheDocument();
  });

  test("renders zeroed summary and empty states when both collections are empty", async () => {
    mockApi();
    renderIncome();
    await waitForSummary();

    expect(screen.getAllByText(inr(0))).toHaveLength(3);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).toBeNull();
    expect(screen.getByText("Income ledger is empty")).toBeInTheDocument();
    expect(screen.getByText("No active schedules")).toBeInTheDocument();
  });

  test("keeps the three savings-rate tip tiers", async () => {
    mockApi({ incomes: [income({ amount: 1000 })], expenses: [expense({ amount: 900 })] });
    const low = renderIncome();
    expect(
      await screen.findByText(
        "Your savings rate is below 20%. Consider auditing small recurring expenses.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("10.00%")).toBeInTheDocument();
    low.unmount();

    mockApi({ incomes: [income({ amount: 1000 })], expenses: [expense({ amount: 700 })] });
    const mid = renderIncome();
    expect(
      await screen.findByText(
        "Excellent! Your savings rate is healthy. Consider an emergency fund.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("30.00%")).toBeInTheDocument();
    mid.unmount();

    mockApi({ incomes: [income({ amount: 1000 })], expenses: [expense({ amount: 100 })] });
    renderIncome();
    expect(
      await screen.findByText("Super saver! You are building wealth rapidly. Keep it up!"),
    ).toBeInTheDocument();
    expect(screen.getByText("90.00%")).toBeInTheDocument();
  });

  test("buckets months by index across years and skips invalid dates", async () => {
    mockApi({
      incomes: [
        income({ _id: "a", amount: 1000, date: "2024-01-05T00:00:00.000Z" }),
        income({ _id: "b", amount: 500, date: JAN }),
        income({ _id: "c", amount: 300, date: FEB }),
        income({ _id: "d", amount: 999, date: "not-a-date" }),
      ],
      expenses: [],
    });
    renderIncome();
    await waitForSummary();

    const [bar] = await screen.findAllByTestId("chart");
    const months = JSON.parse(bar.getAttribute("data-json"));

    // Twelve year-agnostic buckets; Jan 2024 and Jan 2025 both land in "Jan".
    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ month: "Jan", income: 1500, expense: 0 });
    expect(months[1]).toEqual({ month: "Feb", income: 300, expense: 0 });
    expect(
      months.reduce((sum, month) => sum + month.income, 0),
    ).toBe(1800); // the invalid-dated 999 was skipped
  });

  test("keeps every income section mounted on the same page", async () => {
    mockHappyPath();
    renderIncome();
    await waitForSummary();

    expect(screen.getByText("Monthly Cash Flow")).toBeInTheDocument();
    expect(screen.getByText("Income Projection & Baseline")).toBeInTheDocument();
    expect(screen.getByText("Financial Records")).toBeInTheDocument();
    expect(screen.getByText("Recurring income")).toBeInTheDocument();
    expect(screen.getByText("Total Wealth")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  test("feeds both charts and the average-income reference line", async () => {
    mockHappyPath();
    renderIncome();
    await waitForSummary();

    const charts = await screen.findAllByTestId("chart");
    expect(charts).toHaveLength(2);

    const barData = JSON.parse(charts[0].getAttribute("data-json"));
    const lineData = JSON.parse(charts[1].getAttribute("data-json"));

    expect(barData[0]).toEqual({ month: "Jan", income: 1000, expense: 400 });
    expect(barData[1]).toEqual({ month: "Feb", income: 500, expense: 0 });
    expect(lineData[0]).toEqual({ month: "Jan", amount: 1000 });

    const average = await screen.findByTestId("avg-line");
    // 1500 / 12 = 125, labelled through the existing rounding.
    expect(average).toHaveAttribute("data-y", "125");
    expect(average).toHaveTextContent("AVG ₹0K");
  });

  test("renders income records with source styling and en-IN dates", async () => {
    mockHappyPath();
    renderIncome();
    await waitForSummary();

    expect(await screen.findByText("2 Entries")).toBeInTheDocument();
    const records = screen.getByText("Financial Records").closest("section");
    expect(within(records).getByText(inr(1000))).toBeInTheDocument();
    expect(within(records).getByText(inr(500))).toBeInTheDocument();
    expect(within(records).getByText(inrDate(JAN))).toBeInTheDocument();
    expect(within(records).getByText(inrDate(FEB))).toBeInTheDocument();

    // Known source keeps its configured styling; unknown sources print raw.
    expect(screen.getByText("Salary")).toHaveClass("text-emerald-500");
    expect(screen.getByText("Freelance Retainer")).toHaveClass(
      "text-[var(--text-muted)]",
    );
  });

  test("deletes an income record and refetches both collections", async () => {
    mockHappyPath();
    del.mockResolvedValue({ data: {} });
    renderIncome();
    await waitForSummary();

    const card = (await screen.findByText("Salary")).closest("li");
    fireEvent.click(within(card).getByRole("button"));

    await waitFor(() => expect(del).toHaveBeenCalledWith("/income/inc-1"));
    await waitFor(() => expect(callsTo("/incomes/me")).toBe(2));
    // Deleting income does not change expenses, so they are not refetched.
    expect(callsTo("/expenses/me")).toBe(1);
  });

  test("creates an income entry with the exact payload and resets the form", async () => {
    mockHappyPath();
    post.mockResolvedValue({ status: 201, data: { data: {} } });
    renderIncome();
    await waitForSummary();

    fireEvent.click(screen.getByRole("button", { name: /Add Income/i }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.change(within(dialog).getByPlaceholderText("0.00"), {
      target: { value: "800" },
    });
    fireEvent.change(within(dialog).getByDisplayValue("Select channel"), {
      target: { value: "Salary" },
    });
    fireEvent.change(dialog.querySelector('input[type="date"]'), {
      target: { value: "2025-03-01" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /AUTHORIZE ENTRY/i }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/income", {
        amount: 800,
        source: "Salary",
        date: "2025-03-01",
      }),
    );
    await waitFor(() => expect(callsTo("/incomes/me")).toBe(2));

    // Success closes the dialog and clears the form for the next entry.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: /Add Income/i }));
    const reopened = await screen.findByRole("dialog");
    expect(within(reopened).getByPlaceholderText("0.00")).toHaveValue(null);
  });

  test("blocks the income dialog submit while required fields are empty", async () => {
    mockHappyPath();
    renderIncome();
    await waitForSummary();

    fireEvent.click(screen.getByRole("button", { name: /Add Income/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /AUTHORIZE ENTRY/i }));

    await waitFor(() => expect(within(dialog).getAllByText("Required")).toHaveLength(3));
    expect(post).not.toHaveBeenCalled();
    expect(callsTo("/incomes/me")).toBe(1);
  });

  test("creates a recurring income with the exact payload and frequency casing", async () => {
    mockHappyPath();
    post.mockResolvedValue({ status: 201, data: { data: {} } });
    renderIncome();
    await waitForSummary();

    const form = (await screen.findByText("PROVISION NEW AUTOMATION")).closest("form");

    fireEvent.change(within(form).getByPlaceholderText("Wealth description"), {
      target: { value: "Consulting" },
    });
    fireEvent.change(within(form).getByPlaceholderText("Revenue (₹)"), {
      target: { value: "2500" },
    });
    fireEvent.change(within(form).getByRole("combobox"), {
      target: { name: "frequency", value: "Yearly" },
    });
    fireEvent.change(form.querySelector('input[type="date"]'), {
      target: { value: "2025-04-01" },
    });
    fireEvent.change(within(form).getByPlaceholderText("Classification (LOB)"), {
      target: { value: "Consulting" },
    });
    fireEvent.click(within(form).getByRole("button", { name: /ACTIVATE TASK/i }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/recurring", {
        title: "Consulting",
        amount: 2500,
        category: "Consulting",
        type: "INCOME",
        frequency: "yearly",
        nextDate: "2025-04-01",
      }),
    );
    await waitFor(() => expect(callsTo("/recurring/me")).toBe(2));
  });

  test("lists recurring schedules with their count and deletes one", async () => {
    mockHappyPath();
    del.mockResolvedValue({ data: {} });
    renderIncome();
    await waitForSummary();

    expect(await screen.findByText("1 RUNNING")).toBeInTheDocument();
    const active = screen
      .getByText("Active Revenue Operations")
      .closest("section");
    expect(within(active).getByText("Monthly retainer")).toBeInTheDocument();
    expect(within(active).getByText(inr(2500))).toBeInTheDocument();
    expect(within(active).getByText(inrDate(JAN))).toBeInTheDocument();

    const row = within(active).getByText("Monthly retainer").closest("li");
    fireEvent.click(within(row).getAllByRole("button")[1]);

    await waitFor(() => expect(del).toHaveBeenCalledWith("/recurring/rec-1"));
    await waitFor(() => expect(callsTo("/recurring/me")).toBe(2));
    expect(callsTo("/incomes/me")).toBe(1);
  });

  test("keeps the existing console-only failure behaviour", async () => {
    mockHappyPath();
    post.mockRejectedValue(new Error("400 Bad Request"));
    renderIncome();
    await waitForSummary();

    fireEvent.click(screen.getByRole("button", { name: /Add Income/i }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.change(within(dialog).getByPlaceholderText("0.00"), {
      target: { value: "800" },
    });
    fireEvent.change(within(dialog).getByDisplayValue("Select channel"), {
      target: { value: "Salary" },
    });
    fireEvent.change(dialog.querySelector('input[type="date"]'), {
      target: { value: "2025-03-01" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /AUTHORIZE ENTRY/i }));

    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        "Failed to record income:",
        expect.any(Error),
      ),
    );
    // No refetch and the dialog stays open, exactly as before.
    expect(callsTo("/incomes/me")).toBe(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("issues exactly one request per endpoint on mount", async () => {
    mockHappyPath();
    renderIncome();
    await waitForSummary();

    await waitFor(() => expect(callsTo("/recurring/me")).toBe(1));
    expect(callsTo("/incomes/me")).toBe(1);
    expect(callsTo("/expenses/me")).toBe(1);
    expect(get).toHaveBeenCalledTimes(3);
    expect(callsTo("/recurring/upcoming")).toBe(0);
  });
});
