import { createSlice } from "@reduxjs/toolkit";

/**
 * --- GLOBAL UI STATE ---
 * Handles application-wide UI elements like the global loading spinner.
 */

const initialState = {
  loadingCount: 0, // Keeps track of how many parallel API calls are active
  isLoading: false,
  loadingText: "Processing request...",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Increment the count. If it's > 0, the spinner shows up.
    startLoading: (state, action) => {
      state.loadingCount += 1;
      state.isLoading = true;
      if (action.payload) {
        state.loadingText = action.payload;
      }
    },

    // Decrement the count. When it hits 0, the spinner disappears.
    stopLoading: (state) => {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
      state.isLoading = state.loadingCount > 0;
      if (!state.isLoading) {
        state.loadingText = "Processing request...";
      }
    },

    // Forcefully set the loading state (useful for resets)
    setLoading: (state, action) => {
      state.isLoading = action.payload;
      if (!action.payload) {
        state.loadingCount = 0;
      }
    },
  },
});

export const { startLoading, stopLoading, setLoading } = uiSlice.actions;

export default uiSlice.reducer;

