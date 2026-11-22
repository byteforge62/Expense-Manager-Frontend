import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { get, post, put, deleteRequest } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  deleteRequest: vi.fn(),
}));

vi.mock("../components/Utils/axiosInstance", () => ({
  default: { get, post, put, delete: deleteRequest },
}));

import { UserPurchases } from "../components/User/Purchase/UserPurchases";

const purchase = {
  _id: "purchase-1",
  name: "Wireless mouse",
  merchant: "Amazon",
  category: "Electronics",
  unitPrice: 1500,
  quantity: 2,
  totalAmount: 3000,
  purchaseDate: "2026-11-02T00:00:00.000Z",
  status: "DELIVERED",
  orderId: "ORD-1001",
  productUrl: "https://www.amazon.in/example",
};

const summary = {
  totals: { purchaseCount: 1, totalSpend: 3000, itemCount: 2, averageSpend: 3000 },
  byCategory: [{ category: "Electronics", spend: 3000, count: 1 }],
  byMerchant: [{ merchant: "Amazon", spend: 3000, count: 1 }],
  byMonth: [{ month: "2026-11", spend: 3000, count: 1 }],
  largest: [],
  recent: [],
};

const mockLoad = (items = [purchase], meta = { pagination: { page: 1, total: items.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }) => {
  get.mockImplementation((url) => {
    if (url === "/purchases/me") return Promise.resolve({ data: { data: items, meta } });
    if (url === "/purchases/summary") return Promise.resolve({ data: { data: summary } });
    if (url === "/categories") {
      return Promise.resolve({
        data: { data: [{ _id: "cat-1", name: "Electronics", type: "expense" }] },
      });
    }
    return Promise.resolve({ data: { data: [] } });
  });
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <UserPurchases />
    </MemoryRouter>,
  );

describe("Purchase tracking", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    deleteRequest.mockReset();
  });

  test("lists purchases with their amounts and analytics from the API", async () => {
    mockLoad();
    renderPage();

    expect(await screen.findByText("Wireless mouse")).toBeInTheDocument();
    expect(screen.getAllByText("₹3,000.00").length).toBeGreaterThan(0);
    expect(screen.getByText(/Amazon · 02 Nov 2026 · #ORD-1001/)).toBeInTheDocument();
    expect(screen.getByText("Spending by store")).toBeInTheDocument();

    expect(get).toHaveBeenCalledWith("/purchases/me", expect.objectContaining({ params: expect.any(Object) }));
    expect(get).toHaveBeenCalledWith("/purchases/summary", expect.objectContaining({ params: expect.any(Object) }));
  });

  test("shows a functional empty state when no purchases exist", async () => {
    mockLoad([], { pagination: { page: 1, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } });
    renderPage();

    expect(await screen.findByText("No purchases recorded yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /record your first purchase/i }),
    ).toBeInTheDocument();
  });

  test("records a purchase through the dialog and omits blank optional fields", async () => {
    mockLoad();
    post.mockResolvedValue({ data: { data: { _id: "purchase-2", warnings: [] } } });

    renderPage();
    await screen.findByText("Wireless mouse");

    fireEvent.click(screen.getByRole("button", { name: /^record purchase$/i }));

    const dialog = await screen.findByRole("dialog");
    // Required MUI fields append an asterisk to the accessible label.
    fireEvent.change(within(dialog).getByLabelText(/product name/i), {
      target: { value: "USB hub" },
    });
    fireEvent.change(within(dialog).getByLabelText(/price \(per item\)/i), {
      target: { value: "999" },
    });
    fireEvent.change(within(dialog).getByLabelText(/merchant or store/i), {
      target: { value: "Meesho" },
    });

    fireEvent.click(within(dialog).getByRole("button", { name: /^record purchase$/i }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/purchases", {
        name: "USB hub",
        unitPrice: 999,
        quantity: 1,
        category: "Other",
        status: "DELIVERED",
        purchaseDate: expect.any(String),
        merchant: "Meesho",
      }),
    );

    expect(await screen.findByText("Purchase recorded.")).toBeInTheDocument();
  });

  test("searches the list through the API and clears the filter", async () => {
    mockLoad();
    renderPage();
    await screen.findByText("Wireless mouse");

    fireEvent.change(screen.getByLabelText("Search purchases"), {
      target: { value: "mouse" },
    });

    await waitFor(() =>
      expect(get).toHaveBeenCalledWith(
        "/purchases/me",
        expect.objectContaining({
          params: expect.objectContaining({ search: "mouse" }),
        }),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    await waitFor(() =>
      expect(
        get.mock.calls.some(
          ([url, config]) =>
            url === "/purchases/me" && config?.params?.search === undefined,
        ),
      ).toBe(true),
    );
  });
});
