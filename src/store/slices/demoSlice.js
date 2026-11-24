import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

/**
 * --- DEMO WORKSPACE ---
 *
 * One explicit action: fill the signed-in account with sample records so a
 * brand-new user can see what the application looks like with real data.
 *
 * The backend refuses to seed an account that already has expenses, so this
 * can never overwrite or mix with genuine records.
 */

export const seedDemoData = createAsyncThunk(
  "demo/seed",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/demo/seed",
        {},
        { skipGlobalLoader: true },
      );

      return res?.data?.data ?? null;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  lastResult: null,
};

const demoSlice = createSlice({
  name: "demo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(seedDemoData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(seedDemoData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastResult = action.payload;
      })
      .addCase(seedDemoData.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.response?.data?.message ||
          action.payload?.message ||
          "Demo data could not be added";
      });
  },
});

export const selectDemoSeedStatus = (state) => state.demo?.status ?? "idle";
export const selectDemoSeedError = (state) => state.demo?.error ?? null;
export const selectDemoSeedResult = (state) => state.demo?.lastResult ?? null;

export default demoSlice.reducer;
