import { Link as RouterLink } from "react-router-dom";
import Paper from "@mui/material/Paper";
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
 * Dashboard quick actions.
 *
 * Each entry links to the page that owns the workflow (and opens its create
 * dialog where the page supports it), so there are no dead buttons here.
 */
const ACTIONS = [
  {
    label: "Record expense",
    to: "/private/expenses?action=add",
    icon: <FiPlusCircle size={15} />,
    hint: "Log money going out",
  },
  {
    label: "Record income",
    to: "/private/income?action=add",
    icon: <FiTrendingUp size={15} />,
    hint: "Log money coming in",
  },
  {
    label: "Create budget",
    to: "/private/budget?action=add",
    icon: <FiTarget size={15} />,
    hint: "Set a category limit",
  },
  {
    label: "Add a bill",
    to: "/private/bills",
    icon: <FiCalendar size={15} />,
    hint: "Track an upcoming payment",
  },
  {
    label: "Track a purchase",
    to: "/private/purchases?action=add",
    icon: <FiShoppingBag size={15} />,
    hint: "Save an item and its cost",
  },
  {
    label: "Open reports",
    to: "/private/reports",
    icon: <FiFileText size={15} />,
    hint: "Export a summary",
  },
];

export const QuickActions = () => (
  <Paper
    component="section"
    aria-labelledby="quick-actions-heading"
    elevation={0}
    sx={{
      border: 1,
      borderColor: "divider",
      borderRadius: "12px",
      p: { xs: 2, sm: 2.5 },
      bgcolor: "background.paper",
    }}
  >
    <Stack direction="row" alignItems="baseline" justifyContent="space-between" gap={2}>
      <Box>
        <Typography
          id="quick-actions-heading"
          component="h2"
          sx={{ fontSize: 14, fontWeight: 600 }}
        >
          Quick actions
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
          The workflows you use most, one step away.
        </Typography>
      </Box>
    </Stack>

    <Box
      sx={{
        mt: 2,
        display: "grid",
        gap: 1,
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(6, minmax(0, 1fr))",
        },
      }}
    >
      {ACTIONS.map((action) => (
        <Box
          key={action.to}
          component={RouterLink}
          to={action.to}
          sx={{
            display: "block",
            p: 1.5,
            borderRadius: "10px",
            border: 1,
            borderColor: "divider",
            color: "text.primary",
            textDecoration: "none",
            transition: "border-color 120ms ease, background-color 120ms ease",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "action.hover",
            },
          }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "text.secondary" }}>
            {action.icon}
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.primary" }}>
              {action.label}
            </Typography>
          </Stack>
          <Typography
            sx={{ mt: 0.75, fontSize: 11.5, color: "text.secondary", lineHeight: 1.35 }}
          >
            {action.hint}
          </Typography>
        </Box>
      ))}
    </Box>
  </Paper>
);

export default QuickActions;
