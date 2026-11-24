import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";
import { resetRedirectGuard } from "../../components/Utils/session";

/**
 * --- ASYNC ACTIONS ---
 */
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  // Let the backend know we're logging out (clears cookies, etc.)
  await axiosInstance.post("/user/logout");
});

/**
 * --- SESSION PERSISTENCE ---
 * We check localStorage on startup so the user doesn't have 
 * to log in again after a page refresh.
 */
const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user && user !== "undefined" ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const savedUser = getStoredUser();
const savedRole = localStorage.getItem("role");
const savedToken = localStorage.getItem("token");

const initialState = {
  user: savedUser,
  role: savedRole && savedRole !== "undefined" ? savedRole : null,
  token: savedToken && savedToken !== "undefined" ? savedToken : null,
  isAuthenticated: !!savedUser,
  loading: false,
};

/**
 * --- AUTH SLICE ---
 */
/**
 * --- SINGLE LOGOUT PATH ---
 * Clears the local session immediately (so private routes stop rendering
 * and the interceptor stops attaching a token), then revokes the refresh
 * token server-side using the httpOnly cookie.
 *
 * The revoke call is shared: repeated clicks reuse one in-flight request
 * instead of firing duplicate logout calls.
 */
let revokePromise = null;

export const logoutSession = () => (dispatch) => {
  dispatch(logout());

  if (!revokePromise) {
    revokePromise = axiosInstance
      .post("/user/logout")
      .catch(() => {
        // Offline or already-expired session: local state is already gone.
      })
      .finally(() => {
        revokePromise = null;
      });
  }

  return revokePromise;
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called after a successful login API call
    loginSuccess: (state, action) => {
      const { user, role, token } = action.payload;
      state.user = user || null;
      state.role = role || null;
      state.token = token || null;
      state.isAuthenticated = !!user;
      state.loading = false;
      resetRedirectGuard();

      // Persist to local storage so session survives refresh
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (role) localStorage.setItem("role", role);
      if (token) localStorage.setItem("token", token);
    },

    // Used if we need to manually update the JWT
    updateToken: (state, action) => {
      resetRedirectGuard();
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },

    // Merge updated user fields (e.g. profilePic) into auth state
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    // Wipe everything (Local state + Storage)
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("token");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle the cleanup after the logout async thunk finishes
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("token");
    });
  },
});
export const { loginSuccess, logout, setLoading, updateToken, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
