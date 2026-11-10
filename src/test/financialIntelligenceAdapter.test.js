import { describe, expect, test } from "vitest";
import { normalizeFinancialIntelligenceResponse } from "../components/Utils/financialIntelligenceAdapter";

const validPayload = {
  generatedAt: "2026-11-10T00:00:00.000Z",
  dataConfidence: {
    level: "medium",
    method: "Sample-size thresholds",
    samples: { expenseTransactions: 8, periodDays: 90 },
    limitations: [],
  },
  metrics: {
    period: { startDate: "2026-08-12T00:00:00.000Z", endDate: "2026-11-10T00:00:00.000Z", days: 90 },
    counts: { incomeTransactions: 2, expenseTransactions: 8, incomeReceiptDays: 2, budgetRecords: 0, pendingBills: 0, recurringSchedules: 0 },
    totals: { income: 2500, expenses: 1200, netCashFlow: 1300, savingsRate: 0.52, expenseToIncomeRatio: 0.48 },
    spending: {
      averageDailySpending: 13.3,
      medianDailySpending: 0,
      spendingFrequency: 0.08,
      spendingVolatility: 20,
      spendingCoefficientOfVariation: 1.5,
      dailyTotals: [{ date: "2026-11-01", amount: 120 }],
      categoryTotals: { Food: 1200 },
    },
    income: { averageDailyIncome: 27, incomeStability: 0.8, stabilityMethod: "Receipt-day CV", dailyTotals: [] },
    cashFlow: { monthly: [{ month: "2026-11", income: 2500, expenses: 1200, netCashFlow: 1300, daysCovered: 10, daysInMonth: 30, complete: false }], positiveMonths: 1, observedMonths: 1 },
    obligations: {
      totalBudget: 0,
      budgetMatchedSpending: 0,
      budgetUtilization: null,
      budgetBreakdown: [],
      pendingBills: 0,
      recurringMonthlyExpenses: 0,
      monthlyEquivalentIncome: 0,
      recurringCommitmentRatio: null,
      unclassifiedRecurringSchedules: 0,
    },
    categoryBreakdown: [{ category: "Food", transactionCount: 8, amount: 1200, shareOfSpending: 1 }],
    comparison: { period: { startDate: "2026-05-14T00:00:00.000Z", endDate: "2026-08-11T00:00:00.000Z", days: 90 }, baselineIncome: 2000, baselineExpenses: 1000, totalIncomeChange: 25, totalExpensesChange: 20, savingsRateChange: 0.02, averageDailySpendingChange: 20 },
  },
  behavior: {
    observations: [{ type: "spending-trend", category: null, observed: 1200, baseline: 1000, delta: 200, changePercent: 20, summary: "Spending rose." }],
    categoryChanges: {},
    spendingConsistency: { coefficientOfVariation: 1.5, level: "higher", observedDays: 90, explanation: "Higher variability" },
    incomeConsistency: { coefficient: 0.8, level: "higher", receiptDays: 2, explanation: "Stable" },
    weekdayPatterns: { current: {}, previous: {} },
    window: { currentStart: "2026-08-12T00:00:00.000Z", currentEnd: "2026-11-10T00:00:00.000Z" },
  },
  anomalies: [{ type: "large-transaction", title: "Large payment", date: "2026-11-02T00:00:00.000Z", amount: 800, baseline: 100, deviation: 700, deviationPercent: 700, method: "Median/MAD", severity: "high", reason: "Above baseline." }],
  anomalySummary: { count: 1, minimumTransactionBaseline: 5, minimumDailyBaseline: 14, insufficientBaseline: false, eligibleTransactionCategories: 1, baselinePeriod: null },
  financialHealth: { score: 76, label: "Stable", scoreRange: "0-100", scoringWeights: { savingsRate: 30 }, availableWeight: 60, components: { savingsRate: { weight: 30, score: 90, value: 0.52, observed: "Good", explanation: "Measured" } }, observedRisk: {}, inferredRisk: {}, missingData: [], method: "Weighted average" },
  recommendations: [{ id: "review", type: "risk-mitigation", title: "Review payment", description: "Check the payment.", priority: "high", evidence: {}, method: "Existing anomaly", estimatedFinancialImpact: null, confidenceLevel: "medium", nextStep: "Check receipt." }],
  rules: [{ ruleId: "unusual-transaction", type: "unusual-transaction", condition: "Review unusual transactions", threshold: null, severity: "high", priority: 80, status: "triggered", triggered: true, explanation: "One alert.", evidence: [] }],
  ruleSummary: { total: 1, evaluated: 1, triggered: 1, notEvaluated: 0, bySeverity: { critical: 0, high: 1, medium: 0, low: 0 } },
};

describe("normalizeFinancialIntelligenceResponse", () => {
  test("normalizes the documented overview envelope and retains nullable metrics", () => {
    const result = normalizeFinancialIntelligenceResponse({
      success: true,
      message: "OK",
      data: validPayload,
    });

    expect(result.metrics.totals.savingsRate).toBe(0.52);
    expect(result.metrics.obligations.budgetUtilization).toBeNull();
    expect(result.financialHealth.components.savingsRate.score).toBe(90);
    expect(result.anomalies[0].severity).toBe("high");
    expect(result.recommendations[0].estimatedFinancialImpact).toBeNull();
    expect(result.rules[0].status).toBe("triggered");
    expect(result.validationWarnings).toEqual([]);
  });

  test("preserves absent values and safely drops malformed optional data", () => {
    const result = normalizeFinancialIntelligenceResponse({
      generatedAt: "not-a-date",
      metrics: { totals: { income: "unknown", expenses: null } },
      behavior: { observations: { malformed: true } },
      anomalies: [null, { type: "large-transaction", amount: "invalid", date: "yesterday" }],
      financialHealth: { score: "unknown", label: 12, components: [] },
      recommendations: [],
      rules: [{ ruleId: "broken", status: "active", threshold: [] }],
    });

    expect(result.generatedAt).toBeNull();
    expect(result.metrics.totals.income).toBeNull();
    expect(result.metrics.totals.expenses).toBeNull();
    expect(result.behavior.observations).toBeNull();
    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].amount).toBeNull();
    expect(result.anomalies[0].date).toBeNull();
    expect(result.financialHealth.score).toBeNull();
    expect(result.financialHealth.label).toBeNull();
    expect(result.financialHealth.components).toBeNull();
    expect(result.rules[0].status).toBeNull();
    expect(result.validationWarnings.length).toBeGreaterThan(0);
  });

  test("keeps omitted collections unavailable instead of treating them as empty results", () => {
    const result = normalizeFinancialIntelligenceResponse({
      metrics: {},
      anomalies: null,
      recommendations: undefined,
      rules: null,
    });

    expect(result.anomalies).toBeNull();
    expect(result.recommendations).toBeNull();
    expect(result.rules).toBeNull();
  });

  test("rejects a response without the critical metrics object", () => {
    expect(() => normalizeFinancialIntelligenceResponse({ anomalies: [] })).toThrow();
  });
});
