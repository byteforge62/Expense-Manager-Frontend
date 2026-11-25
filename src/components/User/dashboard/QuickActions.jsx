import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiCalendar,
  FiFileText,
  FiPlusCircle,
  FiShoppingBag,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

/**
 * Dashboard quick actions, set as a ledger index: label on the left, hint on
 * the right, joined by a dotted leader. No tiles, no repeated card chrome.
 *
 * Each entry links to the page that owns the workflow (and opens its create
 * dialog where the page supports it), so there are no dead buttons.
 */
const ACTIONS = [
  {
    label: "Record expense",
    to: "/private/expenses?action=add",
    icon: <FiPlusCircle size={14} />,
    hint: "Log money going out",
  },
  {
    label: "Record income",
    to: "/private/income?action=add",
    icon: <FiTrendingUp size={14} />,
    hint: "Log money coming in",
  },
  {
    label: "Create budget",
    to: "/private/budget?action=add",
    icon: <FiTarget size={14} />,
    hint: "Set a category limit",
  },
  {
    label: "Add a bill",
    to: "/private/bills",
    icon: <FiCalendar size={14} />,
    hint: "Track an upcoming payment",
  },
  {
    label: "Track a purchase",
    to: "/private/purchases?action=add",
    icon: <FiShoppingBag size={14} />,
    hint: "Save an item and its cost",
  },
  {
    label: "Open reports",
    to: "/private/reports",
    icon: <FiFileText size={14} />,
    hint: "Export a summary",
  },
];

export const QuickActions = () => (
  <Box component="section" aria-labelledby="quick-actions-heading">
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "baseline" }}
      justifyContent="space-between"
      spacing={0.5}
    >
      <Typography
        id="quick-actions-heading"
        component="h2"
        sx={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}
      >
        Quick actions
      </Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        The workflows you use most, one step away.
      </Typography>
    </Stack>

    <Box
      component="ul"
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
        mt: 1,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
        columnGap: 5,
      }}
    >
      {ACTIONS.map((action) => (
        <Box component="li" key={action.to}>
          <Box
            component={RouterLink}
            to={action.to}
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1,
              py: 1.15,
              borderBottom: 1,
              borderColor: "divider",
              color: "text.primary",
              textDecoration: "none",
              "&:hover .quick-action-label": { color: "primary.main" },
              "&:hover .quick-action-icon": { color: "primary.main" },
              "&:hover .quick-action-leader": {
                borderColor: "color-mix(in srgb, var(--primary) 55%, transparent)",
              },
              "&:focus-visible": { outlineOffset: 4 },
            }}
          >
            <Box
              className="quick-action-icon"
              sx={{
                color: "text.secondary",
                display: "flex",
                alignSelf: "center",
                flexShrink: 0,
              }}
            >
              {action.icon}
            </Box>
            <Typography
              className="quick-action-label"
              sx={{
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                transition: "color 140ms ease",
              }}
            >
              {action.label}
            </Typography>
            <Box
              aria-hidden
              className="quick-action-leader"
              sx={{
                flex: 1,
                minWidth: 18,
                borderBottom: "1px dotted",
                borderColor: "var(--border-medium)",
                transform: "translateY(-3px)",
              }}
            />
            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                fontSize: 11.5,
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              {action.hint}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

export default QuickActions;
