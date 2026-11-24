import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

/* Fetch Admin Report */

export const fetchAdminReport = createAsyncThunk(
  "adminReport/fetchAdminReport",
  async () => {
    const res = await axiosInstance.get("/adminreport");
    return res.data.data || res.data || {};
  },
);

const initialState = {
  stats: null,
  loading: false,
  error: null,
};

const adminReportSlice = createSlice({
  name: "adminReport",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchAdminReport.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchAdminReport.fulfilled, (state, action) => {
        state.loading = false;

        state.stats = action.payload;
      })

      .addCase(fetchAdminReport.rejected, (state) => {
        state.loading = false;

        state.error = "Failed to fetch admin report";
      });
  },
});

export const selectAdminStats = (state) => state.adminReport?.stats ?? null;
export const selectAdminReportLoading = (state) =>
  state.adminReport?.loading ?? false;
export const selectAdminReportError = (state) =>
  state.adminReport?.error ?? null;

export default adminReportSlice.reducer;
