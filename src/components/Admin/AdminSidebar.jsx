import { Link as RouterLink, useLocation } from "react-router-dom";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Backdrop from "@mui/material/Backdrop";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  FiLayout,
  FiUsers,
  FiGrid,
  FiShield,
  FiFileText,
  FiActivity,
  FiUser,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import fintrackMark from "../../assets/brand/fintrack-mark.svg";

const activeColor = "#191922";
const mutedColor = "#5b5b69";
const markColor = "#6735c8";

/**
 * --- ADMIN RAIL ---
 * The same light rail as the user workspace: white surface, violet active
 * pill, and a collapsed icon rail on desktop.
 */
export const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id || "unknown";
  const location = useLocation();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const menuItems = [
    { label: "Dashboard", path: "/admin/admindashboard", icon: <FiLayout /> },
    { label: "Manage users", path: "/admin/manageusers", icon: <FiUsers /> },
    { label: "Categories", path: "/admin/managecategories", icon: <FiGrid /> },
    { label: "Access control", path: "/admin/accesscontrol", icon: <FiShield /> },
    { label: "Reports", path: "/admin/reportadmins", icon: <FiFileText /> },
    { label: "System logs", path: "/admin/systemlogs", icon: <FiActivity /> },
    { label: "My account", path: `/admin/account/${userId}`, icon: <FiUser /> },
  ];

  const drawerWidth = isOpen ? 260 : 76;

  return (
    <>
      <Backdrop
        open={isOpen}
        onClick={toggleSidebar}
        sx={{
          zIndex: 60,
          bgcolor: "rgba(10, 16, 13, 0.55)",
          display: { lg: "none" },
        }}
      />

      <Drawer
        variant="permanent"
        sx={{
          // Below `lg` the rail is an overlay, so it must occupy no space in
          // the page flow even while it is open.
          width: { xs: 0, lg: drawerWidth },
          flexShrink: 0,
          zIndex: 70,
          display: {
            xs: isOpen ? "block" : "none",
            lg: "block",
          },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            bgcolor: "var(--sidebar)",
            borderRight: 1,
            borderColor: "var(--sidebar-border)",
            display: "flex",
            flexDirection: "column",
            transition: (theme) =>
              theme.transitions.create(["width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflowX: "hidden",
          },
        }}
      >
        {/* Brand */}
        <Box
          sx={{
            height: 62,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: isOpen ? 2.5 : 2,
            borderBottom: 1,
            borderColor: "var(--sidebar-border)",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
            <Box
              component="img"
              src={fintrackMark}
              alt="FinTrack"
              sx={{ width: 26, height: 26, flexShrink: 0 }}
            />
            {isOpen && (
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    color: activeColor,
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    lineHeight: 1.1,
                  }}
                  noWrap
                >
                  FinTrack
                </Typography>
                <Typography sx={{ color: mutedColor, fontSize: 10.5, letterSpacing: "0.04em" }}>
                  Admin
                </Typography>
              </Box>
            )}
          </Stack>

          <IconButton
            onClick={toggleSidebar}
            sx={{
              display: { lg: "none" },
              color: mutedColor,
              width: 32,
              height: 32,
              "&:hover": { color: activeColor },
            }}
          >
            <FiX size={18} />
          </IconButton>
        </Box>

        <List
          sx={{
            flex: 1,
            overflowY: "auto",
            py: 2,
            px: 1.25,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(233,238,230,0.2)" },
          }}
        >
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={isDesktop ? undefined : toggleSidebar}
                  sx={{
                    px: isOpen ? 1.5 : 1,
                    py: 1,
                    minHeight: 38,
                    justifyContent: isOpen ? "flex-start" : "center",
                    color: isActive ? "#4922a8" : mutedColor,
                    bgcolor: isActive ? "#f4efff" : "transparent",
                    borderRadius: 2.5,
                    "&:hover": { bgcolor: "#f4efff", color: "#4922a8" },
                    "&.Mui-selected": {
                      bgcolor: "#f4efff",
                      color: "#4922a8",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isOpen ? 32 : 0,
                      justifyContent: "center",
                      fontSize: "1.05rem",
                      color: isActive ? markColor : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {isOpen && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Account */}
        <Box
          sx={{
            p: isOpen ? 2 : 1,
            borderTop: 1,
            borderColor: "var(--sidebar-border)",
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ justifyContent: isOpen ? "flex-start" : "center" }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                borderRadius: 2,
                bgcolor: "#f4efff",
                color: "#4922a8",
                fontSize: "0.8rem",
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </Avatar>

            {isOpen && (
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{ fontSize: 12.5, fontWeight: 600, color: activeColor, lineHeight: 1.3 }}
                  noWrap
                >
                  {user?.name || "Administrator"}
                </Typography>
                <Typography sx={{ fontSize: 11, color: mutedColor }} noWrap>
                  {user?.email || "System admin"}
                </Typography>
              </Box>
            )}
          </Stack>

          {isOpen && (
            <Typography
              sx={{ mt: 1.5, fontSize: 10.5, color: "#8a8a99" }}
            >
              FinTrack v2.4 · 2026
            </Typography>
          )}
        </Box>

        {/* Desktop collapse handle */}
        <IconButton
          onClick={toggleSidebar}
          aria-label={isOpen ? "Collapse navigation" : "Expand navigation"}
          sx={{
            display: { xs: "none", lg: "flex" },
            position: "absolute",
            top: 72,
            right: -13,
            width: 26,
            height: 26,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            color: "text.secondary",
            zIndex: 80,
            "&:hover": { bgcolor: "background.paper", color: "text.primary" },
          }}
        >
          {isOpen ? <FiChevronLeft size={14} /> : <FiChevronRight size={14} />}
        </IconButton>
      </Drawer>
    </>
  );
};
