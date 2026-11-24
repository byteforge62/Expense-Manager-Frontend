import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

export const fetchUsers = createAsyncThunk("user/fetchUsers", async () => {
  const res = await axiosInstance.get("/users");
  return res.data.data || res.data || [];
});

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId) => {
    await axiosInstance.delete(`/user/${userId}`);
    return userId;
  },
);

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        ((state.loading = false), (state.users = action.payload));
      })

      .addCase(fetchUsers.rejected, (state) => {
        ((state.loading = false), (state.error = "Failed to fetch users"));
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      });
  },
});

export default userSlice.reducer;
