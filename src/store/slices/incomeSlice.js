import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";
import { selectAllExpenses } from "./expensesSlice";

/**
 * --- INCOME + RECURRING SCHEDULES ---
 * Same pattern as `expensesSlice`. Incomes and recurring schedules are two
 * normalized collections; every figure the income page shows (totals, monthly
 * series, average, coaching tips) is derived by a memoized selector from
 * incomes + the shared expenses slice.
 *
 * The page used to hold five pieces of derived data in `useState`, filled by
 * an effect that ran on every list change. That duplicated store data into
 * local state and re-rendered the tree twice per fetch. The selectors below
 * replaced all of it.
 */

const incomesAdapter = createEntityAdapter({
  selectId: (income) => income._id,
  sortComparer: (a, b) => new Date(b.date) - new Date(a.date),
});

const recurringAdapter = createEntityAdapter({
  selectId: (payment) => payment._id,
});

/* ─────────────────────────── ASYNC THUNKS ─────────────────────────── */

export const fetchIncomes = createAsyncThunk(
  "income/fetchAll",
  async (userId, { rejectWithValue }) => {
    if (!userId) return [];
    try {
      const res = await axiosInstance.get("/incomes/me");
      return res?.data?.data || res?.data || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (userId, { getState }) =>
      Boolean(userId) && getState().income?.status !== "loading",
  },
);

export const fetchRecurring = createAsyncThunk(
  "income/fetchRecurring",
  async (userId, { rejectWithValue }) => {
    if (!userId) return [];
    try {
      const res = await axiosInstance.get("/recurring/me");
      return res?.data?.data || res?.data || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (userId, { getState }) =>
      Boolean(userId) && getState().income?.recurring?.status !== "loading",
  },
);

/* ─────────────────────────── SLICE ─────────────────────────── */

const initialState = {
  ...incomesAdapter.getInitialState({ status: "idle", error: null }),
  recurring: recurringAdapter.getInitialState({ status: "idle", error: null }),
};

const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.status = "succeeded";
        incomesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || action.error?.message || "Failed to load income";
      })

      .addCase(fetchRecurring.pending, (state) => {
        state.recurring.status = "loading";
        state.recurring.error = null;
      })
      .addCase(fetchRecurring.fulfilled, (state, action) => {
        state.recurring.status = "succeeded";
        recurringAdapter.setAll(state.recurring, action.payload);
      })
      .addCase(fetchRecurring.rejected, (state, action) => {
        state.recurring.status = "failed";
        state.recurring.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to load recurring payments";
      });
  },
});

/* ─────────────────────────── SELECTORS ─────────────────────────── */

const incomeSelectors = incomesAdapter.getSelectors((state) => state.income);
const recurringSelectors = recurringAdapter.getSelectors(
  (state) => state.income.recurring,
);

export const {
  selectAll: selectAllIncomes,
  selectById: selectIncomeById,
  selectTotal: selectIncomeCount,
} = incomeSelectors;

export const { selectAll: selectAllRecurring } = recurringSelectors;

export const selectIncomeStatus = (state) => state.income?.status ?? "idle";
export const selectIncomeError = (state) => state.income?.error ?? null;
export const selectRecurringStatus = (state) =>
  state.income?.recurring?.status ?? "idle";

/* ── Derived figures ── */

export const selectIncomeStats = createSelector(
  [selectAllIncomes, selectAllExpenses],
  (incomes, expenses) => {
    const totalIncome = incomes.reduce(
      (sum, income) => sum + Number(income.amount || 0),
      0,
    );
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );
    const netSavings = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate:
        totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(2) : 0,
    };
  },
);

/** Income vs expense for each calendar month, used by the analytics chart. */
export const selectMonthlyIncomeExpense = createSelector(
  [selectAllIncomes, selectAllExpenses],
  (incomes, expenses) => {
    const months = Array.from({ length: 12 }, () => ({
      income: 0,
      expense: 0,
    }));

    const accumulate = (rows, key) => {
      rows.forEach((row) => {
        const date = new Date(row.date);
        if (isNaN(date)) return;
        months[date.getMonth()][key] += Number(row.amount || 0);
      });
    };

    accumulate(incomes, "income");
    accumulate(expenses, "expense");

    return months.map((month, index) => ({
      month: new Date(0, index).toLocaleString("default", { month: "short" }),
      income: month.income,
      expense: month.expense,
    }));
  },
);

export const selectMonthlyIncomeTrend = createSelector(
  [selectMonthlyIncomeExpense],
  (monthly) => monthly.map(({ month, income }) => ({ month, amount: income })),
);

export const selectAverageIncome = createSelector(
  [selectMonthlyIncomeExpense],
  (monthly) =>
    monthly.reduce((sum, month) => sum + month.income, 0) / monthly.length,
);

/** Coaching copy derived from the savings rate, not stored as component state. */
export const selectIncomeTips = createSelector(
  [selectIncomeStats, selectAllIncomes, selectAllExpenses],
  (stats, incomes, expenses) => {
    // No activity yet: the page shows its empty state, not advice for zero data.
    if (incomes.length === 0 && expenses.length === 0) return [];

    const { savingsRate } = stats;

    if (savingsRate < 20) {
      return [
        "Your savings rate is below 20%. Consider auditing small recurring expenses.",
        "The 50/30/20 rule suggests 20% for savings. You're almost there!",
        "Try a 'no-spend' weekend once a month to boost your net savings.",
      ];
    }

    if (savingsRate < 40) {
      return [
        "Excellent! Your savings rate is healthy. Consider an emergency fund.",
        "Automate your savings to move money before you have a chance to spend it.",
        "Review your investments; you have enough surplus to start compounding.",
      ];
    }

    return [
      "Super saver! You are building wealth rapidly. Keep it up!",
      "Look for tax-advantaged investment vehicles for your high surplus.",
      "Consider diversifying into low-risk assets to protect your gains.",
    ];
  },
);

export default incomeSlice.reducer;
