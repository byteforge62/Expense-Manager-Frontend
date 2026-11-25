import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

/* ── Statement masthead: title, date, month progress and create actions ── */

export const DashboardHeader = () => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const monthProgress = Math.min(100, (dayOfMonth / daysInMonth) * 100);

  return (
    <Box component="header">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-end" }}
        spacing={2.5}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "2rem", md: "2.3rem" },
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
            }}
          >
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.85 }}>
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            . A clear view of your money, all in one place.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            component={RouterLink}
            to="/private/income"
            startIcon={<FiPlus size={14} />}
            sx={{
              minHeight: 40,
              px: 1.75,
              color: "text.primary",
              fontWeight: 600,
              fontSize: 12.5,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Add income
          </Button>
          <Button
            component={RouterLink}
            to="/private/expenses"
            variant="contained"
            startIcon={<FiPlus size={14} />}
            sx={{ minHeight: 40, px: 2, whiteSpace: "nowrap" }}
          >
            Add expense
          </Button>
        </Stack>
      </Stack>

      {/* Month progress belongs to the statement, not to a decorative card. */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ mt: 2.5 }}
      >
        <Box
          aria-hidden
          sx={{
            position: "relative",
            flex: 1,
            height: 1,
            bgcolor: "divider",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: "0 auto 0 0",
              width: `${monthProgress}%`,
              bgcolor: "primary.main",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: `${monthProgress}%`,
              top: "50%",
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: "primary.main",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 3px var(--background)",
            }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: 11,
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          Day {dayOfMonth} of {daysInMonth}
        </Typography>
      </Stack>
    </Box>
  );
};
