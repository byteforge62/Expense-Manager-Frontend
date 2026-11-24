import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

/** Admin-facing user directory, normalized so a deletion is a targeted update. */

const usersAdapter = createEntityAdapter({
  selectId: (user) => user._id,
});

export const fetchUsers = createAsyncThunk(
  "user/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/users");
      return res?.data?.data || res?.data || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (_, { getState }) => getState().user?.status !== "loading",
  },
);

export const deleteUser = createAsyncThunk(
  "user/delete",
  async (userId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/user/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = usersAdapter.getInitialState({
  status: "idle",
  error: null,
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        usersAdapter.setAll(state, action.payload);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message || action.error?.message || "Failed to fetch users";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        usersAdapter.removeOne(state, action.payload);
      });
  },
});

const userSelectors = usersAdapter.getSelectors((state) => state.user);

export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectTotal: selectUserCount,
} = userSelectors;

export const selectUsersStatus = (state) => state.user?.status ?? "idle";
export const selectUsersError = (state) => state.user?.error ?? null;

/** Role tallies for the admin dashboard, memoized on the user list. */
export const selectUserRoleCounts = createSelector([selectAllUsers], (users) =>
  users.reduce(
    (counts, user) => {
      const role = user.role || "Unassigned";
      counts[role] = (counts[role] || 0) + 1;
      return counts;
    },
    {},
  ),
);

export default userSlice.reducer;
