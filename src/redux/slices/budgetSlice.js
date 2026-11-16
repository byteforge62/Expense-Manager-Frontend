import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

/* Fetch Categories */

export const fetchCategories = createAsyncThunk(
  "budget/fetchCategories",
  async () => {
    const res = await axiosInstance.get("/categories");
    return res.data.data || res.data || [];
  },
);

/* Fetch Budget + Expenses */

export const fetchBudgetData = createAsyncThunk(
  "budget/fetchBudgetData",
  async (userId) => {
    if (!userId) return { budgets: [], expenses: [], summary: [] };
    const [bRes, eRes] = await Promise.all([
      axiosInstance.get("/budgets/me"),
      axiosInstance.get("/expenses/me"),
    ]);

    const budgets = bRes.data.data || bRes.data || [];
    const expenses = eRes.data.data || eRes.data || [];

    const summary = budgets.map((b) => {
      const catId =
        typeof b.categoryID === "object" ? b.categoryID?._id : b.categoryID;

      const catName =
        typeof b.categoryID === "object" ? b.categoryID?.name : "Unknown";

      const spent = expenses
        .filter((e) => {
          const eCat =
            typeof e.categoryID === "object" ? e.categoryID?._id : e.categoryID;
          return eCat === catId;
        })
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      return {
        id: b._id,
        category: catName,
        allocated: Number(b.amount) || 0,
        spent,
        remaining: Number(b.amount) - spent,
      };
    });

    return {
      budgets,
      expenses,
      summary,
    };
  },
);

/* AI Budget Plan */

export const fetchBudgetPlan = createAsyncThunk(
  "budget/fetchBudgetPlan",
  async (userId) => {
    if (!userId) return null;
    const res = await axiosInstance.get("/ai/budget-plan");
    return res.data.data;
  },
);

const initialState = {
  budgets: [],

  expenses: [],

  summary: [],

  categories: [],

  budgetPlan: null,

  loading: false,
};

const budgetSlice = createSlice({
  name: "budget",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchBudgetData.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchBudgetData.fulfilled, (state, action) => {
        state.loading = false;

        state.budgets = action.payload.budgets;

        state.expenses = action.payload.expenses;

        state.summary = action.payload.summary;
      })

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })

      .addCase(fetchBudgetPlan.fulfilled, (state, action) => {
        state.budgetPlan = action.payload;
      })
      .addCase(fetchBudgetData.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default budgetSlice.reducer;
