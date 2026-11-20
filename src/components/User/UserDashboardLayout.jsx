import { Fragment, useState } from "react";
import { useLocation, Outlet, Link as RouterLink } from "react-router-dom";
import {
  FiLogOut,
  FiMenu,
  FiTrendingUp,
  FiTrendingDown,
  FiRepeat,
  FiTarget,
  FiBarChart2,
  FiList,
  FiShoppingBag,
  FiCalendar,
  FiFileText,
  FiSun,
  FiMoon,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import fintrackMark from "../../assets/brand/fintrack-mark.svg";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

/**
 * --- NAVIGATION CONFIGURATION ---
 * Shared labels and paths for the desktop rail and the mobile drawer.
 */
const navTabs = [
  { label: "Overview", section: "Workspace", path: "/private/userdashboard", icon: <FiBarChart2 size={17} /> },
  { label: "Income", section: "Money", path: "/private/income", icon: <FiTrendingUp size={17} /> },
  { label: "Expenses", section: "Money", path: "/private/expenses", icon: <FiTrendingDown size={17} /> },
  { label: "Transactions", section: "Money", path: "/private/transactions", icon: <FiList size={17} /> },
  { label: "Recurring", section: "Planning", path: "/private/recurring", icon: <FiRepeat size={17} /> },
  { label: "Budgets", section: "Planning", path: "/private/budget", icon: <FiTarget size={17} /> },
  { label: "Bills", section: "Planning", path: "/private/bills", icon: <FiCalendar size={17} /> },
  { label: "Forecast", section: "Planning", path: "/private/forecast", icon: <FiTrendingUp size={17} /> },
  { label: "Purchases", section: "Planning", path: "/private/purchases", icon: <FiShoppingBag size={17} /> },
  { label: "Intelligence", section: "Analysis", path: "/private/financial-intelligence", icon: <FiBarChart2 size={17} /> },
  { label: "Reports", section: "Analysis", path: "/private/reports", icon: <FiFileText size={17} /> },
];

const RAIL_WIDTH = 244;

/**
 * --- USER WORKSPACE SHELL ---
 * A light rail with grouped navigation on a warm canvas, and a paper
 * workspace. Permanent from `md` up, a drawer below it.
 */
export const UserDashboardLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ pl: 2.5, pr: 1.5, height: 64, borderBottom: 1, borderColor: "var(--sidebar-border)" }}
        >
          <Avatar src={fintrackMark} alt="FinTrack" variant="rounded" sx={{ width: 28, height: 28, borderRadius: 1.5 }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.12rem",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              FinTrack
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary", lineHeight: 1.2 }}>
              Personal ledger
            </Typography>
          </Box>
          <IconButton
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            sx={{ display: { md: "none" }, width: 32, height: 32 }}
          >
            <FiX size={17} />
          </IconButton>
        </Stack>

        <List sx={{ px: 1.25, py: 1.75 }} disablePadding>
          {navTabs.map((tab, i) => {
            const isActive = location.pathname === tab.path;
            const startsSection = tab.section !== navTabs[i - 1]?.section;
            return (
              <Fragment key={tab.path}>
                {startsSection && (
                  <Typography
                    component="li"
                    sx={{
                      display: "block",
                      px: 1.5,
                      pt: i === 0 ? 0.25 : 2,
                      pb: 0.75,
                      color: "text.secondary",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {tab.section}
                  </Typography>
                )}
                <ListItem disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={tab.path}
                    selected={isActive}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      minHeight: 38,
                      px: 1.5,
                      borderRadius: "10px",
                      color: isActive ? "var(--sidebar-accent-foreground)" : "text.secondary",
                      bgcolor: isActive ? "var(--sidebar-accent)" : "transparent",
                      "&:hover": { bgcolor: "var(--sidebar-accent)", color: "var(--sidebar-accent-foreground)" },
                      "&.Mui-selected": { bgcolor: "var(--sidebar-accent)", color: "var(--sidebar-accent-foreground)" },
                      "&.Mui-selected:hover": { bgcolor: "var(--sidebar-accent)" },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 30,
                        color: isActive ? "var(--sidebar-primary)" : "text.secondary",
                      }}
                    >
                      {tab.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={tab.label}
                      primaryTypographyProps={{
                        fontSize: 13.5,
                        fontWeight: isActive ? 600 : 500,
                        letterSpacing: "-0.005em",
                      }}
                    />
                    {isActive && (
                      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "var(--sidebar-primary)" }} />
                    )}
                  </ListItemButton>
                </ListItem>
              </Fragment>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: 1.75, borderTop: 1, borderColor: "var(--sidebar-border)" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1.25,
            borderRadius: "12px",
            border: 1,
            borderColor: "var(--sidebar-border)",
            bgcolor: "background.default",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: "var(--sidebar-accent)",
              color: "var(--sidebar-accent-foreground)",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }} noWrap>
              {user?.name || "Your account"}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }} noWrap>
              {user?.email || "Personal ledger"}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
          <Button
            onClick={toggleTheme}
            startIcon={theme === "dark" ? <FiSun size={14} /> : <FiMoon size={14} />}
            sx={{
              flex: 1,
              justifyContent: "flex-start",
              color: "text.secondary",
              fontWeight: 500,
              fontSize: 12,
              px: 1,
              "&:hover": { color: "text.primary" },
            }}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
          <Button
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            startIcon={<FiLogOut size={14} />}
            sx={{
              flex: 1,
              justifyContent: "flex-start",
              color: "text.secondary",
              fontWeight: 500,
              fontSize: 12,
              px: 1,
              "&:hover": { color: "error.main" },
            }}
          >
            Sign out
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  const activeTab = navTabs.find((tab) => tab.path === location.pathname);
  const pageTitle = activeTab?.label || (location.pathname.includes("/account/") ? "Account" : "FinTrack");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{
          display: { xs: "none", md: "flex" },
          width: RAIL_WIDTH,
          flexShrink: 0,
          bgcolor: "var(--sidebar)",
          borderRight: 1,
          borderColor: "var(--sidebar-border)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {drawerContent}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "color-mix(in srgb, var(--background) 88%, transparent)",
            backdropFilter: "saturate(140%) blur(12px)",
            borderBottom: 1,
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Box sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
            <Toolbar
              disableGutters
              sx={{
                display: "flex",
                justifyContent: "space-between",
                minHeight: "64px !important",
                gap: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                <IconButton
                  aria-label="Open navigation"
                  edge="start"
                  onClick={() => setMobileOpen(true)}
                  sx={{ display: { md: "none" }, width: 38, height: 38, border: 1, borderColor: "divider" }}
                >
                  <FiMenu size={18} />
                </IconButton>

                <Link
                  component={RouterLink}
                  to="/private/userdashboard"
                  underline="none"
                  sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}
                >
                  <Box component="img" src={fintrackMark} alt="" sx={{ width: 26, height: 26 }} />
                </Link>

                <Stack direction="row" alignItems="baseline" spacing={1.25} sx={{ minWidth: 0 }}>
                  <Typography
                    component="p"
                    sx={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.2,
                    }}
                    noWrap
                  >
                    {pageTitle}
                  </Typography>
                  <Typography
                    sx={{ display: { xs: "none", sm: "block" }, fontSize: 12, color: "text.secondary" }}
                    noWrap
                  >
                    {activeTab?.section || "Account"}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={0.75} alignItems="center">
                <IconButton
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                  sx={{ border: 1, borderColor: "divider", width: 38, height: 38, bgcolor: "background.paper" }}
                >
                  {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
                </IconButton>

                <Button
                  component={RouterLink}
                  to={`/private/account/${user?._id || user?.id || ""}`}
                  startIcon={<FiUser size={15} />}
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    fontSize: 12.5,
                    display: { xs: "none", sm: "inline-flex" },
                    "&:hover": { color: "primary.main", bgcolor: "action.hover" },
                  }}
                >
                  {user?.name?.split(" ")[0] || "Account"}
                </Button>

                <IconButton
                  onClick={logout}
                  aria-label="Sign out"
                  sx={{
                    width: 38,
                    height: 38,
                    color: "text.secondary",
                    display: { xs: "none", sm: "inline-flex" },
                    "&:hover": { color: "error.main" },
                  }}
                >
                  <FiLogOut size={17} />
                </IconButton>
              </Stack>
            </Toolbar>
          </Box>
        </AppBar>

        <Box component="nav">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280, border: 0 },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            maxWidth: 1420,
            mx: "auto",
            py: { xs: 2.5, md: 3.5 },
            pb: 8,
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
