import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { normalizeFinancialIntelligenceResponse } from "../components/Utils/financialIntelligenceAdapter";

const { getOverview } = vi.hoisted(() => ({ getOverview: vi.fn() }));
vi.mock("../components/Utils/financialIntelligenceApi", () => ({
  getFinancialIntelligenceOverview: getOverview,
}));

vi.mock("recharts", () => {
  const MockChart = ({ children }) => <div>{children}</div>;
  return {
    Area: MockChart,
    AreaChart: MockChart,
    Bar: MockChart,
    BarChart: MockChart,
    CartesianGrid: MockChart,
    Cell: MockChart,
    Legend: MockChart,
    Pie: MockChart,
    PieChart: MockChart,
    ResponsiveContainer: MockChart,
    Tooltip: MockChart,
    XAxis: MockChart,
    YAxis: MockChart,
  };
});

import FinancialIntelligencePage from "../components/User/FinancialIntelligencePage";

const createOverview = (score = 76) =>
  normalizeFinancialIntelligenceResponse({
    generatedAt: "2026-11-10T00:00:00.000Z",
    dataConfidence: { level: "medium", method: "Samples", samples: {}, limitations: [] },
    metrics: {
      period: { startDate: "2026-08-12T00:00:00.000Z", endDate: "2026-11-10T00:00:00.000Z", days: 90 },
      counts: {},
      totals: { income: 2500, expenses: 1200, netCashFlow: 1300, savingsRate: 0.52, expenseToIncomeRatio: 0.48 },
      spending: { dailyTotals: [{ date: "2026-11-01", amount: 120 }], categoryTotals: {} },
      income: { dailyTotals: [] },
      cashFlow: { monthly: [{ month: "2026-11", income: 2500, expenses: 1200, netCashFlow: 1300 }], positiveMonths: 1, observedMonths: 1 },
      obligations: {},
      categoryBreakdown: [{ category: "Food", transactionCount: 2, amount: 1200, shareOfSpending: 1 }],
      comparison: {},
    },
    behavior: {
      observations: [{ type: "spending-trend", category: null, observed: 1200, baseline: 1000, delta: 200, changePercent: 20, summary: "Spending rose compared with last period." }],
      weekdayPatterns: { current: {}, previous: {} },
    },
    anomalies: [{ type: "large-transaction", title: "Unusually large transaction", amount: 800, baseline: 100, severity: "high", reason: "A payment exceeded its baseline." }],
    anomalySummary: { count: 1, eligibleTransactionCategories: 1 },
    financialHealth: { score, label: "Stable", components: {}, missingData: [] },
    recommendations: [{ id: "review", type: "risk-mitigation", title: "Review the payment", description: "Check the payment against a receipt.", priority: "high", confidenceLevel: "medium", estimatedFinancialImpact: null }],
    rules: [
      { ruleId: "unusual-transaction", status: "triggered", explanation: "Anomaly detected.", threshold: null, priority: 80, severity: "high" },
      { ruleId: "cash-flow-risk", status: "not-evaluated", explanation: "No forecast was supplied.", threshold: null, priority: 0, severity: "critical" },
      { ruleId: "savings-rate", status: "clear", explanation: "Savings rate is on target.", threshold: null, priority: 0, severity: "medium" },
    ],
    ruleSummary: { total: 3, evaluated: 2, triggered: 1, notEvaluated: 1, bySeverity: {} },
  });

describe("FinancialIntelligencePage", () => {
  beforeEach(() => {
    getOverview.mockReset();
  });

  test("renders normalized health, anomaly, recommendation, and rule status data", async () => {
    getOverview.mockResolvedValue(createOverview());

    render(<FinancialIntelligencePage />);

    expect(await screen.findByText("Unusually large transaction")).toBeInTheDocument();
    expect(screen.getByText("76")).toBeInTheDocument();
    expect(screen.getByText("Review the payment")).toBeInTheDocument();
    expect(screen.getByText("triggered")).toBeInTheDocument();
    expect(screen.getByText("not evaluated")).toBeInTheDocument();
    expect(screen.getByText("clear")).toBeInTheDocument();
    expect(screen.getByText(/Spending rose compared with last period/)).toBeInTheDocument();
  });

  test("keeps the previous overview visible while refresh is pending and replaces it on success", async () => {
    let resolveRefresh;
    getOverview
      .mockResolvedValueOnce(createOverview(76))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRefresh = resolve;
          }),
      );

    render(<FinancialIntelligencePage />);
    expect(await screen.findByText("76")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /refresh overview/i }));
    expect(screen.getByRole("button", { name: /refreshing/i })).toBeDisabled();
    expect(screen.getByText("76")).toBeInTheDocument();

    resolveRefresh(createOverview(90));
    await waitFor(() => expect(screen.getByText("90")).toBeInTheDocument());
  });

  test("shows retryable API failures and then renders the recovered overview", async () => {
    getOverview
      .mockRejectedValueOnce(new Error("Service temporarily unavailable"))
      .mockResolvedValueOnce(createOverview());

    render(<FinancialIntelligencePage />);
    expect(await screen.findByText("Service temporarily unavailable")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Review the payment")).toBeInTheDocument();
  });

  test("retains loaded data and exposes retry after a refresh failure", async () => {
    getOverview
      .mockResolvedValueOnce(createOverview(76))
      .mockRejectedValueOnce(new Error("Refresh unavailable"));

    render(<FinancialIntelligencePage />);
    expect(await screen.findByText("76")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /refresh overview/i }));
    expect(await screen.findByText(/Refresh unavailable/)).toBeInTheDocument();
    expect(screen.getByText("76")).toBeInTheDocument();
    expect(screen.getByText(/Showing the last successfully loaded overview/)).toBeInTheDocument();
  });

  test("renders designed empty states for absent analysis results", async () => {
    const emptyOverview = createOverview();
    emptyOverview.anomalies = [];
    emptyOverview.recommendations = [];
    emptyOverview.rules = [];
    getOverview.mockResolvedValue(emptyOverview);

    render(<FinancialIntelligencePage />);

    expect(await screen.findByText("No unusual activity")).toBeInTheDocument();
    expect(screen.getByText("No recommendations")).toBeInTheDocument();
    expect(screen.getByText("No adaptive rules")).toBeInTheDocument();
  });

  test("distinguishes unavailable result collections from empty findings", async () => {
    const unavailableOverview = createOverview();
    unavailableOverview.anomalies = null;
    unavailableOverview.recommendations = null;
    unavailableOverview.rules = null;
    getOverview.mockResolvedValue(unavailableOverview);

    render(<FinancialIntelligencePage />);

    expect(await screen.findByText("Anomaly data unavailable")).toBeInTheDocument();
    expect(screen.getByText("Recommendation data unavailable")).toBeInTheDocument();
    expect(screen.getByText("Rule data unavailable")).toBeInTheDocument();
  });
});
