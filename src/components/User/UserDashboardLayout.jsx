
import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  FiActivity,
  FiBarChart2,
  FiList,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiPieChart,
  FiRepeat,
  FiShoppingBag,
  FiSun,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
  FiUser,
  FiFileText,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

/**
 * Shared navigation configuration for desktop and mobile.
 */
const navTabs = [
  {
    label: "Matrix",
    path: "/private/userdashboard",
    icon: <FiBarChart2 size={16} />,
  },
  {
    label: "Inflow",
    path: "/private/income",
    icon: <FiTrendingUp size={16} />,
  },
  {
    label: "Outflow",
    path: "/private/expenses",
    icon: <FiTrendingDown size={16} />,
  },
  {
    label: "Flows",
    path: "/private/recurring",
    icon: <FiRepeat size={16} />,
  },
  {
    label: "Budgets",
    path: "/private/budget",
    icon: <FiTarget size={16} />,
  },
  {
    label: "Bills",
    path: "/private/bills",
    icon: <FiFileText size={16} />,
  },
  {
    label: "Reports",
    path: "/private/reports",
    icon: <FiPieChart size={16} />,
  },
  {
    label: "History",
    path: "/private/transactions",
    icon: <FiList size={16} />,
  },
  {
    label: "Forecast",
    path: "/private/forecast",
    icon: <FiActivity size={16} />,
  },
  {
    label: "Purchases",
    path: "/private/purchases",
    icon: <FiShoppingBag size={16} />,
  },
];

export const UserDashboardLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box
      sx={{
        width: 260,
        bgcolor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            px: 3,
            py: 3,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "cyan.main",
              width: 36,
              height: 36,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "bold",
              }}
            >
              T
            </Typography>
          </Avatar>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "black",
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
            }}
          >
            Trackit
          </Typography>
        </Stack>

        <List sx={{ px: 2, py: 3 }}>
          {navTabs.map((tab) => {
            const isActive = location.pathname === tab.path;

            return (
              <ListItem
                key={tab.path}
                disablePadding
                sx={{ mb: 1 }}
              >
                <ListItemButton
                  component={RouterLink}
                  to={tab.path}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 3,
                    bgcolor: isActive
                      ? "action.hover"
                      : "transparent",
                    color: isActive
                      ? "cyan.main"
                      : "text.secondary",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive
                        ? "cyan.main"
                        : "text.secondary",
                    }}
                  >
                    {tab.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={tab.label}
                    primaryTypographyProps={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box
        sx={{
          p: 3,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={() => {
            logout();
            setMobileOpen(false);
          }}
          startIcon={<FiLogOut />}
          sx={{
            borderRadius: 3,
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          bgcolor:
            "rgba(var(--mui-palette-background-paperChannel), 0.8)",
          backdropFilter: "blur(8px)",
          borderBottom: 1,
          borderColor: "divider",
          color: "text.primary",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "space-between",
              height: 72,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
            >
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { lg: "none" } }}
              >
                <FiMenu />
              </IconButton>

              <Link
                component={RouterLink}
                to="/private/userdashboard"
                underline="none"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "cyan.main",
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    T
                  </Typography>
                </Avatar>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "black",
                    color: "text.primary",
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  Trackit
                </Typography>
              </Link>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: {
                  xs: "none",
                  lg: "flex",
                },
                bgcolor: "action.hover",
                p: 0.75,
                borderRadius: 4,
                border: 1,
                borderColor: "divider",
              }}
            >
              {navTabs.map((tab) => {
                const isActive =
                  location.pathname === tab.path;

                return (
                  <Button
                    key={tab.path}
                    component={RouterLink}
                    to={tab.path}
                    startIcon={tab.icon}
                    sx={{
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: "bold",
                      fontSize: "11px",
                      px: 2,
                      py: 1,
                      bgcolor: isActive
                        ? "cyan.main"
                        : "transparent",
                      color: isActive
                        ? "white"
                        : "text.secondary",
                      "&:hover": {
                        bgcolor: isActive
                          ? "cyan.main"
                          : "action.hover",
                        color: isActive
                          ? "white"
                          : "text.primary",
                      },
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <IconButton
                onClick={toggleTheme}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  width: 40,
                  height: 40,
                }}
              >
                {theme === "dark" ? (
                  <FiSun size={18} />
                ) : (
                  <FiMoon size={18} />
                )}
              </IconButton>

              <Button
                component={RouterLink}
                to={`/private/account/${user?._id || user?.id || ""
                  }`}
                startIcon={<FiUser />}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "11px",
                  color: "text.secondary",
                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                  "&:hover": {
                    color: "cyan.main",
                  },
                }}
              >
                {user?.name?.split(" ")[0] || "User"}
              </Button>

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

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              lg: "none",
            },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 260,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: { xs: 4, md: 6 },
          pb: 10,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};
