import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import {
  FiCalendar,
  FiFileText,
  FiPlusCircle,
  FiShoppingBag,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

/**
 * A single compact strip of the workflows used most. The page header already
 * owns the two primary create actions; these are the secondary ones, kept on
 * one line instead of a multi-row index.
 */
const ACTIONS = [
  {
    label: "Record expense",
    to: "/private/expenses?action=add",
    icon: <FiPlusCircle size={13} />,
  },
  {
    label: "Record income",
    to: "/private/income?action=add",
    icon: <FiTrendingUp size={13} />,
  },
  {
    label: "Create budget",
    to: "/private/budget?action=add",
    icon: <FiTarget size={13} />,
  },
  {
    label: "Add a bill",
    to: "/private/bills",
    icon: <FiCalendar size={13} />,
  },
  {
    label: "Track a purchase",
    to: "/private/purchases?action=add",
    icon: <FiShoppingBag size={13} />,
  },
  {
    label: "Open reports",
    to: "/private/reports",
    icon: <FiFileText size={13} />,
  },
];

export const QuickActions = () => (
  <Box
    component="nav"
    aria-label="Quick actions"
    sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
  >
    {ACTIONS.map((action) => (
      <Box
        component={RouterLink}
        key={action.to}
        to={action.to}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.6,
          minHeight: 30,
          px: 1.1,
          border: 1,
          borderColor: "divider",
          borderRadius: "999px",
          bgcolor: "background.paper",
          color: "text.secondary",
          fontSize: 11.5,
          fontWeight: 500,
          textDecoration: "none",
          whiteSpace: "nowrap",
          transition: "color 140ms ease, border-color 140ms ease",
          "& svg": { flexShrink: 0 },
          "&:hover": {
            color: "primary.main",
            borderColor: "color-mix(in srgb, var(--primary) 40%, var(--border))",
          },
          "&:focus-visible": { outlineOffset: 2 },
        }}
      >
        {action.icon}
        {action.label}
      </Box>
    ))}
  </Box>
);

export default QuickActions;
