import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("../components/Utils/axiosInstance", () => ({
  default: { get, interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
  injectStore: vi.fn(),
  refreshAccessToken: vi.fn(),
  retryAfterRefresh: vi.fn(),
  resolveApiBaseUrl: vi.fn(),
}));

import logReducer, { extractLogs } from "../store/slices/logSlice";
import { Systemlog } from "../components/Admin/Systemlog";

const buildLogs = () => [
  {
    _id: "log-1",
    user: "ada@example.com",
    action: "expense.created",
    description: "Expense created",
    createdAt: "2026-11-01T10:00:00.000Z",
  },
  {
    _id: "log-2",
    user: "grace@example.com",
    action: "income.created",
    description: "Salary credited",
    createdAt: "2026-11-02T10:00:00.000Z",
  },
];

const renderPage = () => {
  const store = configureStore({ reducer: { log: logReducer } });
  render(
    <Provider store={store}>
      <Systemlog />
    </Provider>,
  );

  return store;
};

const rows = () => document.querySelectorAll("tbody tr");

describe("log response envelope", () => {
  test("extracts the array from the standard envelope", () => {
    const logs = buildLogs();
    expect(extractLogs({ data: { success: true, message: "ok", data: logs } })).toEqual(logs);
  });

  test("tolerates an already-unwrapped array", () => {
    const logs = buildLogs();
    expect(extractLogs({ data: logs })).toEqual(logs);
  });

  test("never returns a non-array payload", () => {
    expect(extractLogs({ data: { success: true, data: { unexpected: true } } })).toEqual([]);
    expect(extractLogs({ data: null })).toEqual([]);
    expect(extractLogs(undefined)).toEqual([]);
  });
});

describe("System Logs page", () => {
  beforeEach(() => {
    get.mockReset();
  });

  test("renders every fetched log", async () => {
    get.mockResolvedValue({ data: { success: true, message: "ok", data: buildLogs() } });

    renderPage();

    await waitFor(() => expect(rows()).toHaveLength(2));
  });

  test("filters the table by the search term", async () => {
    get.mockResolvedValue({ data: { success: true, message: "ok", data: buildLogs() } });

    renderPage();

    await waitFor(() => expect(rows()).toHaveLength(2));

    fireEvent.change(
      screen.getByPlaceholderText(/Search taxonomy cache/i),
      { target: { value: "salary" } },
    );

    await waitFor(() => expect(rows()).toHaveLength(1));
  });

  test("shows the empty state when there are no logs", async () => {
    get.mockResolvedValue({ data: { success: true, message: "ok", data: [] } });

    renderPage();

    await waitFor(() => expect(rows()).toHaveLength(0));
    expect(screen.getByText(/0 AUDIT NODES/i)).toBeInTheDocument();
  });

  test("survives a malformed payload without crashing", async () => {
    get.mockResolvedValue({ data: { success: true, data: { unexpected: true } } });

    const store = renderPage();

    await waitFor(() => expect(rows()).toHaveLength(0));
    expect(store.getState().log.logs).toEqual([]);
    expect(store.getState().log.error).toBeNull();
  });

  test("shows the error state when the request fails", async () => {
    get.mockRejectedValue(new Error("Request failed with status code 500"));

    renderPage();

    expect(await screen.findByText(/Audit stream unavailable/i)).toBeInTheDocument();
    expect(rows()).toHaveLength(0);
  });
});
