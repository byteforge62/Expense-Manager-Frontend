import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { get, post, patch, deleteRequest } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  deleteRequest: vi.fn(),
}));

vi.mock("../components/Utils/axiosInstance", () => ({
  default: { get, post, patch, delete: deleteRequest },
}));

import FinancialForecast from "../components/User/FinancialForecast";
import PurchaseIntelligence from "../components/User/PurchaseIntelligence";
import Bills from "../components/User/Bills";

describe("connected financial workflows", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    patch.mockReset();
    deleteRequest.mockReset();
  });

  test("submits user-entered opening cash and displays the forecast response", async () => {
    post.mockResolvedValue({
      data: {
        data: {
          currency: "USD",
          openingCash: 1200,
          dataConfidence: { level: "MEDIUM" },
          historicalDailyBaseline: { netCashFlow: 15 },
          warnings: [],
          scenarios: {
            baseCase: {
              description: "Baseline projection",
              netCashFlow: 90,
              closingBalance: 1290,
              monthly: [{ month: "2026-07", netCashFlow: 90, closingBalance: 1290 }],
            },
          },
        },
      },
    });

    render(<FinancialForecast />);
    fireEvent.change(screen.getByLabelText(/opening cash/i), { target: { value: "1200" } });
    fireEvent.click(screen.getByRole("button", { name: /generate forecast/i }));

    await waitFor(() => expect(screen.getAllByText("$1,290.00")).toHaveLength(2));
    expect(post).toHaveBeenCalledWith("/financial-forecast", {
      openingCash: 1200,
      horizonMonths: 3,
    });
  });

  test("loads tracked products and renders affordability analysis returned by the API", async () => {
    get.mockResolvedValue({
      data: {
        data: [{ _id: "product-1", name: "Laptop", currentPrice: 1000, currency: "INR", status: "WATCHLIST" }],
      },
    });
    post.mockResolvedValue({
      data: {
        data: {
          analysis: {
            risk: { recommendation: "DELAY_OR_REDUCE_COST", summary: "Review the cash buffer." },
            historyConfidence: "MEDIUM",
            warnings: [],
          },
        },
      },
    });

    render(<PurchaseIntelligence />);
    expect(await screen.findByText("Laptop")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/available cash \(inr\) for analysis/i), { target: { value: "2500" } });
    fireEvent.click(screen.getByRole("button", { name: /analyze affordability/i }));

    expect(await screen.findByText("DELAY OR REDUCE COST")).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith("/purchase-intelligence/product-1/analyze", { availableCash: 2500 });
  });

  test("omits blank optional product fields to match the strict create contract", async () => {
    get.mockResolvedValue({ data: { data: [] } });
    post.mockResolvedValue({ data: { data: { _id: "product-2" } } });

    render(<PurchaseIntelligence />);
    fireEvent.change(screen.getByLabelText("Product name"), { target: { value: "Headphones" } });
    fireEvent.change(screen.getByLabelText("Current price"), { target: { value: "150" } });
    fireEvent.click(screen.getByRole("button", { name: /add product/i }));

    await waitFor(() => expect(post).toHaveBeenCalledWith("/purchase-intelligence", {
      name: "Headphones",
      currentPrice: 150,
      currency: "INR",
    }));
  });

  test("creates a bill and links settlement to a selected expense", async () => {
    get.mockImplementation((path) => Promise.resolve({
      data: {
        data: path === "/bills/me"
          ? [{ _id: "bill-1", name: "Utilities", amount: 80, dueDate: "2026-07-01", status: "pending" }]
          : [{ _id: "expense-1", amount: 80, description: "Utilities" }],
      },
    }));
    post.mockResolvedValue({ data: { data: { _id: "bill-2" } } });
    patch.mockResolvedValue({ data: { data: { status: "paid" } } });

    render(<Bills />);
    expect(await screen.findByText("Utilities")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Bill name"), { target: { value: "Internet" } });
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "40" } });
    fireEvent.change(screen.getByLabelText("Due date"), { target: { value: "2026-07-15" } });
    fireEvent.click(screen.getByRole("button", { name: /add bill/i }));

    await waitFor(() => expect(post).toHaveBeenCalledWith("/bill", {
      name: "Internet",
      amount: 40,
      dueDate: "2026-07-15",
    }));

    fireEvent.change(screen.getByLabelText("Expense record for Utilities"), { target: { value: "expense-1" } });
    fireEvent.click(screen.getByRole("button", { name: /link payment/i }));
    await waitFor(() => expect(patch).toHaveBeenCalledWith("/bill/bill-1/settle", { expenseId: "expense-1" }));
  });
});
