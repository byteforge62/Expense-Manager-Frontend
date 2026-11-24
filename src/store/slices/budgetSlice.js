import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";
import { selectAllExpenses } from "./expensesSlice";

/**
 * --- BUDGETS ---
 * Follows the reference pattern in `expensesSlice`:
 * - one entity adapter for the budget rows,
 * - one thunk per read/write,
 * - every derived figure is a memoized selector.
 *
 * The budget summary used to be calculated inside a thunk that also fetched
 * `/expenses/me`. That meant two copies of the same expenses in the store and
 * a second network read on every budget page mount. The summary is now derived
 * from the single normalized expenses slice instead.
 */

const budgetsAdapter = createEntityAdapter({
  selectId: (budget) => budget._id,
});

/* ─────────────────────────── ASYNC THUNKS ─────────────────────────── */

export const fetchBudgets = createAsyncThunk(
  "budget/fetchAll",
  async (userId, { rejectWithValue }) => {
    if (!userId) return [];
    try {
      const res = await axiosInstance.get("/budgets/me");
      return res?.data?.data || res?.data || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (userId, { getState }) =>
      Boolean(userId) && getState().budget?.status !== "loading",
  },
);

export const fetchBudgetPlan = createAsyncThunk(
  "budget/fetchPlan",
  async (userId, { rejectWithValue }) => {
    if (!userId) return null;
    try {
      const res = await axiosInstance.get("/ai/budget-plan");
      return res?.data?.data ?? null;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createBudget = createAsyncThunk(
  "budget/create",
  async ({ categoryID, amount, description }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/budget", {
        categoryID,
        amount,
        description,
      });
      return res?.data?.data ?? res?.data ?? null;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const removeBudget = createAsyncThunk(
  "budget/remove",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/budget/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

/* ─────────────────────────── SLICE ─────────────────────────── */

const initialState = budgetsAdapter.getInitialState({
  status: "idle",
  error: null,
  plan: null,
  planStatus: "idle",
});

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.status = "succeeded";
        budgetsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || action.error?.message || "Failed to load budgets";
      })

      .addCase(fetchBudgetPlan.pending, (state) => {
        state.planStatus = "loading";
      })
      .addCase(fetchBudgetPlan.fulfilled, (state, action) => {
        state.planStatus = "succeeded";
        state.plan = action.payload;
      })
      .addCase(fetchBudgetPlan.rejected, (state) => {
        state.planStatus = "failed";
      })

      .addCase(createBudget.fulfilled, (state, action) => {
        if (action.payload?._id) budgetsAdapter.upsertOne(state, action.payload);
      })
      .addCase(removeBudget.fulfilled, (state, action) => {
        budgetsAdapter.removeOne(state, action.payload);
      });
  },
});

/* ─────────────────────────── SELECTORS ─────────────────────────── */

const budgetSelectors = budgetsAdapter.getSelectors((state) => state.budget);

export const {
  selectAll: selectAllBudgets,
  selectById: selectBudgetById,
  selectTotal: selectBudgetCount,
} = budgetSelectors;

export const selectBudgetStatus = (state) => state.budget?.status ?? "idle";
export const selectBudgetError = (state) => state.budget?.error ?? null;
export const selectBudgetPlan = (state) => state.budget?.plan ?? null;
export const selectBudgetPlanStatus = (state) =>
  state.budget?.planStatus ?? "idle";

/** Budget rows joined with the spend recorded against their category. */
export const selectBudgetSummary = createSelector(
  [selectAllBudgets, selectAllExpenses],
  (budgets, expenses) => {
    // One pass to total spend per category instead of a filter per budget.
    const spentByCategory = new Map();
    expenses.forEach((expense) => {
      const categoryId =
        typeof expense.categoryID === "object"
          ? expense.categoryID?._id
          : expense.categoryID;
      spentByCategory.set(
        categoryId,
        (spentByCategory.get(categoryId) || 0) + Number(expense.amount || 0),
      );
    });

    return budgets.map((budget) => {
      const categoryId =
        typeof budget.categoryID === "object"
          ? budget.categoryID?._id
          : budget.categoryID;
      const categoryName =
        typeof budget.categoryID === "object"
          ? budget.categoryID?.name
          : "Unknown";
      const allocated = Number(budget.amount) || 0;
      const spent = spentByCategory.get(categoryId) || 0;

      return {
        id: budget._id,
        category: categoryName,
        allocated,
        spent,
        remaining: allocated - spent,
      };
    });
  },
);

/** The four header figures, computed in one memoized slice of work. */
export const selectBudgetTotals = createSelector(
  [selectBudgetSummary],
  (summary) =>
    summary.reduce(
      (totals, item) => ({
        allocated: totals.allocated + item.allocated,
        spent: totals.spent + item.spent,
        remaining: totals.remaining + item.remaining,
        overBudgetCount:
          totals.overBudgetCount + (item.spent > item.allocated ? 1 : 0),
      }),
      { allocated: 0, spent: 0, remaining: 0, overBudgetCount: 0 },
    ),
);

export default budgetSlice.reducer;
