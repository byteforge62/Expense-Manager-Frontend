import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

/**
 * --- ASYNC ACTIONS (THUNKS) ---
 * These handle fetching data from the backend.
 */

// Grab all available expense categories
export const fetchCategories = createAsyncThunk(
  "expense/fetchCategories",
  async () => {
    const res = await axiosInstance.get("/categories");
    return res.data.data || res.data;
  },
);

// Get a few of the most recent expenses for the dashboard
export const fetchRecentExpenses = createAsyncThunk(
  "expense/fetchRecentExpenses",
  async (userId) => {
    if (!userId) return [];
    const res = await axiosInstance.get("/expenses/recent");
    return res.data.data || res.data || [];
  },
);

// Fetch the full history of expenses with optional filters (dates, etc.)
export const fetchAllExpenses = createAsyncThunk(
  "expense/fetchAllExpenses",
  async ({ userId, filters = {} }) => {
    if (!userId) return [];
    const params = Object.fromEntries(
      ["startDate", "endDate", "categoryID", "minAmount", "maxAmount"]
        .filter((key) => filters[key] !== "" && filters[key] != null)
        .map((key) => [key, filters[key]]),
    );
    const res = await axiosInstance.get("/expenses/me", { params });
    return res.data.data || res.data || [];
  },
);

const initialState = {
  categories: [],
  recentExpenses: [],
  expenses: [],
  loading: false,
};

/**
 * --- EXPENSE SLICE ---
 */
const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.loading = false;
      })

      // Recent Expenses
      .addCase(fetchRecentExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.recentExpenses = action.payload;
      })
      .addCase(fetchRecentExpenses.rejected, (state) => {
        state.loading = false;
      })

      // Full Expense History
      .addCase(fetchAllExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchAllExpenses.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default expenseSlice.reducer;
