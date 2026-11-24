import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { motion } from "framer-motion";
import Box from "@mui/material/Box";
import { Navbar } from "../Common/Navbar";

/**
 * --- ROUTE LAYOUTS ---
 * The authenticated guard and the public shell.
 */

export const PrivateRoutes = () => {
  const user = useAppSelector(selectCurrentUser);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const PublicLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        position: "relative",
      }}
    >
      <Navbar />

      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        sx={{ position: "relative" }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
