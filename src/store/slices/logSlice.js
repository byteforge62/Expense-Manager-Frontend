import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

/**
 * Extracts the audit-log array from the API envelope.
 *
 * The backend answers with `{ success, message, data: [...] }`. Accepting a
 * bare array as well keeps this resilient if a proxy or older build returns
 * the payload unwrapped, and guarantees the reducer always holds an array so
 * the table can never call `.filter` on an object.
 */
export const extractLogs = (response) => {
  const payload = response?.data?.data ?? response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.logs)) {
    return payload.logs;
  }

  return [];
};

export const fetchLogs = createAsyncThunk("log/fetchLogs", async () => {
  const res = await axiosInstance.get("/logs");
  return extractLogs(res);
});

const initialState = {
  logs: [],
  loading: false,
  error: null,
};

const logSlice = createSlice({
  name: "log",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.logs = [];
        state.error =
          action.error?.message || "Failed to fetch audit logs";
      });
  },
});

export const selectAllLogs = (state) =>
  Array.isArray(state.log?.logs) ? state.log.logs : [];
export const selectLogsLoading = (state) => state.log?.loading ?? false;
export const selectLogsError = (state) => state.log?.error ?? null;

export default logSlice.reducer;
