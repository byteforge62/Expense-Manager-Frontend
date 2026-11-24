import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";
import { selectAllBudgets } from "./budgetSlice";
import {
  selectAllExpenses,
  selectExpensesStatus,
} from "./expensesSlice";
import { selectAllIncomes, selectIncomeStatus } from "./incomeSlice";

/**
 * --- TRANSACTION LEDGER ---
 * Two different reads share this slice:
 *
 * 1. The signed-in user's ledger. There is no request for it: it is derived
 *    from the expenses, incomes and budgets that are already normalized in
 *    their own slices. Visiting /private/transactions used to fire three
 *    duplicate reads and then merge them in a thunk on every visit.
 * 2. The admin-wide ledger, which is a genuinely different endpoint pair
 *    (`/expenses` and `/incomes` across all users) and keeps its own adapter.
 */

const adminAdapter = createEntityAdapter({
  selectId: (transaction) =>
    transaction._id ??
    `${transaction.type}:${transaction.createdAt}:${transaction.amount}:${transaction.userID?._id ?? ""}`,
});

export const fetchAllTransactions = createAsyncThunk(
  "transaction/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const [expenseRes, incomeRes] = await Promise.all([
        axiosInstance.get("/expenses"),
        axiosInstance.get("/incomes"),
      ]);

      const expenses = (expenseRes.data.data || expenseRes.data || []).map(
        (expense) => ({ ...expense, type: "Expense" }),
      );
      const incomes = (incomeRes.data.data || incomeRes.data || []).map(
        (income) => ({ ...income, type: "Income" }),
      );

      return [...expenses, ...incomes].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (_, { getState }) => getState().transaction?.adminStatus !== "loading",
  },
);

const initialState = adminAdapter.getInitialState({
  adminStatus: "idle",
  adminError: null,
});

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTransactions.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        adminAdapter.setAll(state, action.payload);
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.adminStatus = "failed";
        state.adminError =
          action.payload?.message ||
          action.error?.message ||
          "Failed to load transactions";
      });
  },
});

/* ─────────────────────────── SELECTORS ─────────────────────────── */

/** Admin-wide ledger (all users). */
const adminSelectors = adminAdapter.getSelectors((state) => state.transaction);

export const {
  selectAll: selectAdminTransactions,
  selectTotal: selectAdminTransactionCount,
} = adminSelectors;

export const selectAdminTransactionsStatus = (state) =>
  state.transaction?.adminStatus ?? "idle";

export const selectAdminTransactionSummary = createSelector(
  [selectAdminTransactions],
  (transactions) =>
    transactions.reduce(
      (summary, transaction) => {
        if (transaction.type === "Income") {
          summary.totalIncome += Number(transaction.amount || 0);
        } else {
          summary.totalExpense += Number(transaction.amount || 0);
        }
        summary.balance = summary.totalIncome - summary.totalExpense;
        return summary;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 },
    ),
);

/**
 * The signed-in user's ledger, merged from the normalized slices. `hasBudget`
 * marks an expense whose category has a budget, which drives the "plan a
 * budget" affordance.
 */
export const selectTransactions = createSelector(
  [selectAllExpenses, selectAllIncomes, selectAllBudgets],
  (expenses, incomes, budgets) => {
    const budgetedCategories = new Set(
      budgets.map((budget) =>
        typeof budget.categoryID === "object"
          ? budget.categoryID?._id
          : budget.categoryID,
      ),
    );

    const expenseRows = expenses.map((expense) => {
      const categoryId =
        typeof expense.categoryID === "object"
          ? expense.categoryID?._id
          : expense.categoryID;

      return {
        ...expense,
        type: "Expense",
        hasBudget: budgetedCategories.has(categoryId),
      };
    });

    const incomeRows = incomes.map((income) => ({
      ...income,
      type: "Income",
    }));

    return [...expenseRows, ...incomeRows];
  },
);

export const selectTransactionSummary = createSelector(
  [selectAllExpenses, selectAllIncomes],
  (expenses, incomes) => {
    const totalIncome = incomes.reduce(
      (sum, income) => sum + Number(income.amount || 0),
      0,
    );
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  },
);

/** Both source slices start "idle"; the ledger is loading until it has data. */
export const selectTransactionsLoading = createSelector(
  [selectExpensesStatus, selectIncomeStatus],
  (expensesStatus, incomeStatus) =>
    ["idle", "loading"].includes(expensesStatus) ||
    ["idle", "loading"].includes(incomeStatus),
);

export const selectTransactionsCount = createSelector(
  [selectTransactions],
  (transactions) => transactions.length,
);

export default transactionSlice.reducer;
