import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

export const fetchIncomeData = createAsyncThunk(
  "income/fetchIncomeData",
  async (userId) => {
    if (!userId) return { incomes: [], expenses: [] };
    const [incomeRes, expenseRes] = await Promise.all([
      axiosInstance.get("/incomes/me"),
      axiosInstance.get("/expenses/me"),
    ]);
    return {
      incomes: incomeRes.data.data || incomeRes.data || [],
      expenses: expenseRes.data.data || expenseRes.data || [],
    };
  },
);

export const fetchRecurring = createAsyncThunk(
  "income/fetchRecurring",
  async (userId) => {
    if (!userId) return [];
    const res = await axiosInstance.get("/recurring/me");
    return res.data.data || res.data || [];
  },
);

const initialState = {
  incomes: [],
  expenses: [],
  recurringPayments: [],
  loading: false,
};
const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchIncomeData.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchIncomeData.fulfilled, (state, action) => {
        state.loading = false;
        state.incomes = action.payload.incomes;
        state.expenses = action.payload.expenses;
      })

      .addCase(fetchIncomeData.rejected, (state) => {
        state.loading = false;
      })

      .addCase(fetchRecurring.fulfilled, (state, action) => {
        state.recurringPayments = action.payload;
      });
  },
});
export default incomeSlice.reducer;
