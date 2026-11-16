import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import { Navbar } from "../Common/Navbar";

/**
 * --- ROUTE LAYOUTS ---
 * The two route-level wrappers the router needs: the authenticated guard and
 * the public shell. They are small, share the same concern (what surrounds a
 * page, not the page itself) and are read together in App.jsx, so they live in
 * one module instead of two near-empty files.
 */

/**
 * --- PRIVATE ROUTE GUARD ---
 * Prevents unauthenticated users from accessing protected pages.
 * If no user is found in Redux, it redirects them to the Login page.
 */
export const PrivateRoutes = () => {
  const { user } = useSelector((state) => state.auth);

  // If the user isn't logged in, send them back to the login screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, let them through to the requested page
  return <Outlet />;
};

/**
 * --- PUBLIC FACING LAYOUT ---
 * Used for pages like Home, Login, and Signup.
 * Features a standard navbar and smooth entry animations.
 */
export const PublicLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── DECORATIVE BACKGROUND ── */}
      {/* Subtle ambient glow to match the premium aesthetic */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 500,
          height: 500,
          bgcolor: "cyan.main",
          opacity: 0.05,
          filter: "blur(64px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* ── NAVIGATION ── */}
      <Navbar />

      {/* ── MAIN CONTENT ── */}
      {/* Uses Framer Motion to slide/fade content in as user navigates */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        sx={{ pb: 8 }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
