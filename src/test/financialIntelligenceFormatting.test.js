import { describe, expect, test } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  MISSING_VALUE,
} from "../components/Utils/financialIntelligenceFormatting";

describe("financial intelligence formatters", () => {
  test("formats explicit currencies and does not assume one when absent", () => {
    expect(formatCurrency(1234.5, { locale: "en-US", currency: "USD" })).toContain("$");
    expect(formatCurrency(1234.5, { locale: "en-US" })).toBe("1,234.5");
    expect(formatCurrency(null)).toBe(MISSING_VALUE);
    expect(formatCurrency(true)).toBe(MISSING_VALUE);
  });

  test("formats ratios as percentages and leaves unavailable values visible", () => {
    expect(formatPercentage(0.25, { fraction: true, locale: "en-US" })).toBe("25%");
    expect(formatPercentage(25, { locale: "en-US" })).toBe("25%");
    expect(formatPercentage(undefined)).toBe(MISSING_VALUE);
  });

  test("formats numbers and rejects malformed dates", () => {
    expect(formatNumber(1200, { locale: "en-US" })).toBe("1,200");
    expect(formatDate("invalid-date")).toBe(MISSING_VALUE);
    expect(formatDate("2026-11-10T00:00:00.000Z", { locale: "en-US", options: { year: "numeric" } })).toBe("2026");
  });
});
