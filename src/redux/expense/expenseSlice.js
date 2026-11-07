
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

export const fetchCategories = createAsyncThunk(
  "expense/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/categories");
      return res.data?.data ?? res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

export const fetchRecentExpenses = createAsyncThunk(
  "expense/fetchRecentExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/expenses/recent");
      return res.data?.data ?? res.data ?? [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent expenses",
      );
    }
  },
);

export const fetchAllExpenses = createAsyncThunk(
  "expense/fetchAllExpenses",
  async ({ filters = {} } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key !== "datePreset") {
            params.set(key, value);
          }
        }
      });

      const query = params.toString();
      const url = query ? `/expenses/me?${query}` : "/expenses/me";

      const res = await axiosInstance.get(url);
      return res.data?.data ?? res.data ?? [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch expenses",
      );
    }
  },
);

const initialState = {
  categories: [],
  recentExpenses: [],
  expenses: [],
  loading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchRecentExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.recentExpenses = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchRecentExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchAllExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchAllExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default expenseSlice.reducer;
