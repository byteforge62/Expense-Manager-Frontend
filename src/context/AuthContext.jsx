import { createContext, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectAuthToken,
  selectCurrentUser,
  updateUser as updateUserAction,
} from "../store/slices/authSlice";
import { logout } from "../components/Utils/Logout";

/**
 * --- AUTH COMPATIBILITY LAYER ---
 * Redux (`state.auth`) is the single source of truth for the session: the
 * Axios instance reads its token, and `PrivateRoutes` reads its user.
 *
 * This context remains only so existing consumers can keep calling `useAuth()`.
 * It owns no state of its own, which means a login updates every consumer
 * immediately and a logout cannot leave a stale user behind.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(selectAuthToken);

  const updateUser = (updatedData) => dispatch(updateUserAction(updatedData));

  return (
    <AuthContext.Provider
      value={{ user, token, loading: false, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
