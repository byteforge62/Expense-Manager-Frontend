import { beforeEach, describe, expect, test, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("../components/Utils/axiosInstance", () => ({
  default: { get },
}));

import { getFinancialIntelligenceOverview } from "../components/Utils/financialIntelligenceApi";

describe("getFinancialIntelligenceOverview", () => {
  beforeEach(() => {
    get.mockReset();
  });

  test("uses the shared Axios instance and normalizes a successful response", async () => {
    get.mockResolvedValue({
      data: { success: true, data: { metrics: { totals: { income: 100 } } } },
    });
    const controller = new AbortController();

    const result = await getFinancialIntelligenceOverview(
      { startDate: "2026-01-01" },
      { signal: controller.signal },
    );

    expect(get).toHaveBeenCalledWith(
      "/financial-intelligence/overview",
      expect.objectContaining({
        params: { startDate: "2026-01-01" },
        signal: controller.signal,
        skipGlobalLoader: true,
      }),
    );
    expect(result.metrics.totals.income).toBe(100);
  });

  test("propagates API errors without disguising failures as success data", async () => {
    const apiError = new Error("Request failed");
    get.mockRejectedValue(apiError);

    await expect(getFinancialIntelligenceOverview()).rejects.toBe(apiError);
  });
});
