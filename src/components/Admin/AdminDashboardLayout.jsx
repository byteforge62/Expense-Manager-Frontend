import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import useMediaQuery from "@mui/material/useMediaQuery";

import { FiBell, FiMenu, FiLogOut, FiSettings } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { AdminSidebar } from "./AdminSidebar";

const pageNames = {
  "/admin/admindashboard": "Dashboard",
  "/admin/manageusers": "Manage users",
  "/admin/managecategories": "Categories",
  "/admin/accesscontrol": "Access control",
  "/admin/reportadmins": "Reports",
  "/admin/systemlogs": "System logs",
};

export const AdminDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Permanent rail from `lg` up, overlay below it.
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) setIsSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const pageName =
    pageNames[location.pathname] ||
    (location.pathname.includes("/account/")
      ? "Account"
      : location.pathname.includes("/user/")
        ? "User detail"
        : "Workspace");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <Box
        sx={{
          transition: (theme) =>
            theme.transitions.create("padding-left", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          pl: { xs: 0, lg: isSidebarOpen ? "260px" : "76px" },
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            top: 0,
            zIndex: 55,
            bgcolor: "background.default",
            borderBottom: 1,
            borderColor: "divider",
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              width: "100%",
              justifyContent: "space-between",
              gap: 2,
              minHeight: "62px !important",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
              <IconButton
                onClick={toggleSidebar}
                aria-label="Toggle navigation"
                sx={{
                  display: { lg: "none" },
                  width: 36,
                  height: 36,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <FiMenu size={18} />
              </IconButton>

              <Stack direction="row" alignItems="baseline" spacing={1.25} sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                    display: { xs: "none", sm: "block" },
                  }}
                  noWrap
                >
                  {pageName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: { xs: "none", md: "block" } }}
                  noWrap
                >
                  Admin
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                aria-label="Notifications"
                sx={{ width: 36, height: 36, border: 1, borderColor: "divider" }}
              >
                <Badge
                  variant="dot"
                  color="secondary"
                  overlap="circular"
                  sx={{
                    "& .MuiBadge-badge": {
                      border: "2px solid var(--mui-palette-background-default)",
                    },
                  }}
                >
                  <FiBell size={17} />
                </Badge>
              </IconButton>

              <IconButton
                onClick={() => navigate(`/admin/account/${user?._id}`)}
                aria-label="Account settings"
                sx={{
                  width: 36,
                  height: 36,
                  border: 1,
                  borderColor: "divider",
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                <FiSettings size={17} />
              </IconButton>

              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{ mx: { xs: 0.5, sm: 1.5 }, height: 22, alignSelf: "center" }}
              />

              <Button
                onClick={logout}
                startIcon={<FiLogOut size={15} />}
                sx={{ px: { xs: 1, sm: 1.5 }, color: "text.secondary" }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Sign out
                </Box>
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ maxWidth: 1520, mx: "auto" }}>
            <AnimatePresence mode="wait">
              <Box
                component={motion.div}
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Outlet />
              </Box>
            </AnimatePresence>
          </Box>
        </Box>

        <Box
          component="footer"
          sx={{
            py: 2.5,
            px: { xs: 2, sm: 3, lg: 4 },
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            © 2026 FinTrack · Admin
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Signed in as {user?.name || "administrator"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
