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
        spacing={1.5}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.35rem", md: "1.5rem" },
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Overview
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "text.secondary" }}>
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
              minHeight: 32,
              px: 1.3,
              color: "text.primary",
              fontWeight: 600,
              fontSize: 11.5,
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
            startIcon={<FiPlus size={13} />}
            sx={{ minHeight: 32, px: 1.5, fontSize: 11.5, whiteSpace: "nowrap" }}
          >
            Add expense
          </Button>
        </Stack>
      </Stack>

      {/* Month progress belongs to the statement, not to a decorative card. */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ mt: 0.6 }}
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
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "primary.main",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 3px var(--background)",
            }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: 10.5,
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
