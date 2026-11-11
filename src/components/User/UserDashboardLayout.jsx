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
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import fintrackMark from "../../assets/brand/fintrack-mark.svg";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

/**
 * --- NAVIGATION CONFIGURATION ---
 * Shared labels and paths for the desktop and mobile navigation.
 */
const navTabs = [
  {
    label: "Overview",
    section: "Workspace",
    path: "/private/userdashboard",
    icon: <FiBarChart2 size={16} />,
  },
  {
    label: "Income",
    section: "Money",
    path: "/private/income",
    icon: <FiTrendingUp size={16} />,
  },
  {
    label: "Expenses",
    section: "Money",
    path: "/private/expenses",
    icon: <FiTrendingDown size={16} />,
  },
  {
    label: "Transactions",
    section: "Money",
    path: "/private/transactions",
    icon: <FiList size={16} />,
  },
  { label: "Recurring", section: "Planning", path: "/private/recurring", icon: <FiRepeat size={16} /> },
  { label: "Budgets", section: "Planning", path: "/private/budget", icon: <FiTarget size={16} /> },
  { label: "Bills", section: "Planning", path: "/private/bills", icon: <FiCalendar size={16} /> },
  { label: "Forecast", section: "Planning", path: "/private/forecast", icon: <FiTrendingUp size={16} /> },
  { label: "Purchases", section: "Planning", path: "/private/purchases", icon: <FiShoppingBag size={16} /> },
  {
    label: "Intelligence",
    section: "Analysis",
    path: "/private/financial-intelligence",
    icon: <FiBarChart2 size={16} />,
  },
  {
    label: "Reports",
    section: "Analysis",
    path: "/private/reports",
    icon: <FiFileText size={16} />,
  },
];

/**
 * --- USER DASHBOARD LAYOUT ---
 * The primary shell for all logged-in user activities.
 * Handles the responsive top nav, mobile dock, and page transitions.
 */
export const UserDashboardLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ width: "100%", bgcolor: "var(--sidebar)", color: "var(--sidebar-foreground)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Box>
        {/* Brand Header inside Drawer */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ px: 3, py: 3, borderBottom: 1, borderColor: "var(--sidebar-border)" }}
        >
          <Avatar src={fintrackMark} alt="Fintrack" variant="rounded" sx={{ width: 36, height: 36, borderRadius: 2 }} />
          <Typography variant="subtitle1" sx={{ color: "var(--sidebar-foreground)", fontWeight: 700, letterSpacing: "-0.03em" }}>
            Fintrack
          </Typography>
        </Stack>

        {/* List of Navigation Links */}
        <List sx={{ px: 2, py: 2.5 }}>
          {navTabs.map((tab, i) => {
            const isActive = location.pathname === tab.path;
            return (
              <Fragment key={tab.path}>
                {tab.section !== navTabs[i - 1]?.section && (
                  <Typography
                    component="li"
                    variant="overline"
                    sx={{ display: "block", px: 1.5, pt: i === 0 ? 0 : 2, pb: 0.75, color: "rgba(233, 231, 224, 0.55)", fontSize: 10, fontWeight: 700, letterSpacing: "0.11em" }}
                  >
                    {tab.section}
                  </Typography>
                )}
                <ListItem disablePadding sx={{ mb: 0.35 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={tab.path}
                    selected={isActive}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      minHeight: 42,
                      borderRadius: 2,
                      color: isActive ? "#a9c8f5" : "rgba(233, 231, 224, 0.78)",
                      borderLeft: isActive ? "2px solid #76aaff" : "2px solid transparent",
                      "&:hover": { bgcolor: "rgba(233, 231, 224, 0.06)" },
                      "&.Mui-selected": { bgcolor: "rgba(118, 170, 255, 0.14)", color: "#a9c8f5", fontWeight: 700 },
                      "&.Mui-selected:hover": { bgcolor: "rgba(118, 170, 255, 0.18)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                      {tab.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={tab.label}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              </Fragment>
            );
          })}
        </List>
      </Box>

      {/* Emergency Logout at bottom of drawer */}
      <Box sx={{ p: 3, borderTop: 1, borderColor: "var(--sidebar-border)" }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={() => {
            logout();
            setMobileOpen(false);
          }}
          startIcon={<FiLogOut />}
          sx={{ borderRadius: 2, borderColor: "rgba(240, 120, 112, 0.45)", color: "#f07870", fontWeight: 600, textTransform: "none" }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const activeTab = navTabs.find((tab) => tab.path === location.pathname);
  const pageTitle = activeTab?.label || (location.pathname.includes("/account/") ? "Account" : "Fintrack");

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{ display: { xs: "none", md: "flex" }, width: 232, flexShrink: 0, borderRight: 1, borderColor: "divider", bgcolor: "var(--sidebar)", position: "sticky", top: 0, height: "100vh" }}
      >
        {drawerContent}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.default",
            borderBottom: 1,
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, xl: 5 } }}>
            <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between", minHeight: "64px !important" }}>
            
            {/* Logo & Brand */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { md: "none" } }}
              >
                <FiMenu />
              </IconButton>

              <Link component={RouterLink} to="/private/userdashboard" underline="none" sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.25, color: "text.primary" }}>
                <Avatar src={fintrackMark} alt="Fintrack" variant="rounded" sx={{ width: 30, height: 30, borderRadius: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "-0.03em" }}>Fintrack</Typography>
              </Link>
              <Typography component="p" variant="subtitle1" sx={{ display: { xs: "none", md: "block" }, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {pageTitle}
              </Typography>
            </Stack>

            {/* Command Center */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Theme Toggle */}
              <IconButton
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  width: 40,
                  height: 40,
                }}
              >
                {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
              </IconButton>

              {/* Profile Shortcut */}
              <Button
                component={RouterLink}
                to={`/private/account/${user?._id || user?.id || ""}`}
                startIcon={<FiUser />}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "11px",
                  color: "text.secondary",
                  display: { xs: "none", sm: "inline-flex" },
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                {user?.name?.split(" ")[0] || "User"}
              </Button>

              {/* Logout Button */}
              <IconButton
                onClick={logout}
                sx={{
                  borderRadius: 3,
                  width: 40,
                  height: 40,
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "error.lighter",
                    color: "error.main",
                  },
                }}
              >
                <FiLogOut size={18} />
              </IconButton>
            </Stack>

          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer for responsive layout */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 260 },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Container component="main" maxWidth={false} sx={{ maxWidth: 1480, flexGrow: 1, py: { xs: 3, md: 4 }, pb: 8, px: { xs: 2, sm: 3, xl: 5 } }}>
        <Outlet />
      </Container>
      </Box>
    </Box>
  );
};
