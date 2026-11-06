import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

export const fetchIncomeData = createAsyncThunk(
  "income/fetchIncomeData",
  async (userId) => {
    if (!userId) return { incomes: [], expenses: [] };
    const [incomeRes, expenseRes] = await Promise.all([
      axiosInstance.get(`/incomesbyUserID/${userId}`),
      axiosInstance.get(`/expensesbyUserID/${userId}`),
    ]);
    return {
      incomes: incomeRes.data.data || incomeRes.data || [],
      expenses: expenseRes.data.data || expenseRes.data || [],
    };
  },
);

export const fetchRecurring = createAsyncThunk(
  "income/fetchRecurring",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/recurring/me");

      const recurringData = res.data?.data ?? res.data;

      return Array.isArray(recurringData) ? recurringData : [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch recurring transactions.",
      );
    }
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
