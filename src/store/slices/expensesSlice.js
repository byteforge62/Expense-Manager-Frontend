import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

/**
 * --- EXPENSES (REFERENCE SLICE) ---
 * The pattern every other feature slice should follow:
 *
 * 1. Lists live in `createEntityAdapter` state ({ ids, entities }) so a single
 *    edited or deleted record is a targeted update instead of a full array
 *    rebuild, and lookups by id are O(1).
 * 2. Every request is a `createAsyncThunk`, so loading / success / error are
 *    handled in one place instead of per component.
 * 3. Every derived figure (totals, averages, breakdowns, charts) is a
 *    `createSelector` computation, so it is memoized on the data it reads and
 *    is not recomputed when unrelated state (or local UI state) changes.
 */

// The only query parameters the API accepts for a ledger read, in the order
// the backend has always received them.
const EXPENSE_FILTER_KEYS = [
  "startDate",
  "endDate",
  "categoryID",
  "minAmount",
  "maxAmount",
];

/** Stable signature of the active filter set, used to de-duplicate requests. */
export const filterSignature = (filters = {}) =>
  EXPENSE_FILTER_KEYS.map((key) => `${key}:${filters[key] ?? ""}`).join("|");

const buildParams = (filters = {}) =>
  Object.fromEntries(
    EXPENSE_FILTER_KEYS.filter(
      (key) => filters[key] !== "" && filters[key] != null,
    ).map((key) => [key, filters[key]]),
  );

/* Two adapters: the ledger and the "recent" strip are separate reads with
   different shapes (`/expenses/recent` returns unpopulated categories), and
   merging them would let one overwrite the other's category names. */
const expensesAdapter = createEntityAdapter({
  selectId: (expense) => expense._id,
  sortComparer: (a, b) => new Date(b.date) - new Date(a.date),
});

const recentAdapter = createEntityAdapter({
  selectId: (expense) => expense._id,
  sortComparer: (a, b) => new Date(b.date) - new Date(a.date),
});

/* ─────────────────────────── ASYNC THUNKS ─────────────────────────── */

/**
 * Full ledger read. `force` bypasses the in-flight guard after a mutation.
 * Same-filter requests already on the wire are not repeated (a dashboard and
 * the expenses page mounting together used to race two identical reads).
 */
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchList",
  async ({ filters = {} } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/expenses/me", {
        params: buildParams(filters),
      });
      return {
        expenses: res?.data?.data || res?.data || [],
        queryKey: filterSignature(filters),
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: ({ filters = {} } = {}, { getState }) => {
      const slice = getState().expenses;
      if (!slice) return true;
      return !(
        slice.status === "loading" && slice.queryKey === filterSignature(filters)
      );
    },
  },
);

/** The short "recent activity" list shown on the expenses overview. */
export const fetchRecentExpenses = createAsyncThunk(
  "expenses/fetchRecent",
  async (userId, { rejectWithValue }) => {
    if (!userId) return [];
    try {
      const res = await axiosInstance.get("/expenses/recent");
      return res?.data?.data || res?.data || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (userId, { getState }) => {
      if (!userId) return false;
      return getState().expenses?.recent?.status !== "loading";
    },
  },
);

/** Create an expense record. The backend derives the owner from the token. */
export const createExpense = createAsyncThunk(
  "expenses/create",
  async ({ categoryID, amount, date, description }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/expense", {
        categoryID,
        amount,
        date,
        description,
      });
      return res?.data?.data ?? res?.data ?? null;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

/** Delete one record; the fulfilled reducer removes it by id. */
export const removeExpense = createAsyncThunk(
  "expenses/remove",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/expense/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

/* ─────────────────────────── SLICE ─────────────────────────── */

const initialState = expensesAdapter.getInitialState({
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  queryKey: null,
  recent: recentAdapter.getInitialState({ status: "idle", error: null }),
  mutationStatus: "idle",
});

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* --- Ledger --- */
      .addCase(fetchExpenses.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.queryKey = filterSignature(action.meta.arg?.filters ?? {});
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.queryKey = action.payload.queryKey;
        expensesAdapter.setAll(state, action.payload.expenses);
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || action.error?.message || "Failed to load expenses";
      })

      /* --- Recent activity --- */
      .addCase(fetchRecentExpenses.pending, (state) => {
        state.recent.status = "loading";
        state.recent.error = null;
      })
      .addCase(fetchRecentExpenses.fulfilled, (state, action) => {
        state.recent.status = "succeeded";
        recentAdapter.setAll(state.recent, action.payload);
      })
      .addCase(fetchRecentExpenses.rejected, (state, action) => {
        state.recent.status = "failed";
        state.recent.error =
          action.payload?.message || action.error?.message || "Failed to load recent expenses";
      })

      /* --- Mutations --- */
      .addCase(createExpense.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        if (action.payload?._id) {
          expensesAdapter.upsertOne(state, action.payload);
        }
      })
      .addCase(createExpense.rejected, (state) => {
        state.mutationStatus = "failed";
      })
      .addCase(removeExpense.fulfilled, (state, action) => {
        expensesAdapter.removeOne(state, action.payload);
        recentAdapter.removeOne(state.recent, action.payload);
      });

    // A rejection that carried no message still needs a reset of the flag.
    builder.addCase(removeExpense.rejected, (state) => {
      state.mutationStatus = "failed";
    });
  },
});

/* ─────────────────────────── SELECTORS ─────────────────────────── */

const expenseSelectors = expensesAdapter.getSelectors((state) => state.expenses);
const recentSelectors = recentAdapter.getSelectors(
  (state) => state.expenses.recent,
);

export const {
  selectAll: selectAllExpenses,
  selectById: selectExpenseById,
  selectIds: selectExpenseIds,
  selectTotal: selectExpenseCount,
  selectEntities: selectExpenseEntities,
} = expenseSelectors;

export const { selectAll: selectRecentExpenses } = recentSelectors;

/** Primitive selectors: they re-render only when this exact value changes. */
export const selectExpensesStatus = (state) => state.expenses?.status ?? "idle";
export const selectExpensesError = (state) => state.expenses?.error ?? null;
export const selectRecentExpensesStatus = (state) =>
  state.expenses?.recent?.status ?? "idle";

/* Derived values. Each is memoized on the entities it reads, so typing in a
   filter box (local state) never re-runs these. */

export const selectExpenseTotal = createSelector([selectAllExpenses], (expenses) =>
  expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
);

export const selectAverageExpense = createSelector(
  [selectExpenseTotal, selectExpenseCount],
  (total, count) => (count > 0 ? total / count : 0),
);

export const selectThisMonthTotal = createSelector(
  [selectAllExpenses],
  (expenses) => {
    const now = new Date();
    return expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  },
);

export const selectCategoryBreakdown = createSelector(
  [selectAllExpenses],
  (expenses) => {
    const totals = new Map();
    expenses.forEach((expense) => {
      const name = expense.categoryID?.name || "Other";
      totals.set(name, (totals.get(name) || 0) + Number(expense.amount || 0));
    });
    return [...totals.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  },
);

export const selectTopCategory = createSelector(
  [selectCategoryBreakdown],
  (breakdown) => breakdown[0]?.name || "—",
);

export const selectMonthlyTrend = createSelector([selectAllExpenses], (expenses) => {
  const monthly = Array.from({ length: 12 }, () => 0);
  const year = new Date().getFullYear();

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    if (date.getFullYear() === year) {
      monthly[date.getMonth()] += Number(expense.amount || 0);
    }
  });

  return monthly.map((amount, index) => ({
    month: new Date(0, index).toLocaleString("default", { month: "short" }),
    amount,
  }));
});

export default expensesSlice.reducer;
