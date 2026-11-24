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

export default adminReportSlice.reducer;
