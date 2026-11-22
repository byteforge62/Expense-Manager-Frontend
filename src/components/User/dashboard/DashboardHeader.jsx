import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Link as RouterLink } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

/* ── Title, today's date and the primary create actions ── */

export const DashboardHeader = () => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "stretch", sm: "flex-end" }}
    spacing={2.5}
  >
    <Box>
      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: { xs: "1.85rem", md: "2.2rem" },
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        {" · "}A clear view of your money, all in one place.
      </Typography>
    </Box>

    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
      <Button
        component={RouterLink}
        to="/private/income"
        variant="contained"
        startIcon={<FiPlus size={15} />}
        sx={{ px: 2.25, minHeight: 40, whiteSpace: "nowrap" }}
      >
        Add income
      </Button>
      <Button
        component={RouterLink}
        to="/private/expenses"
        variant="outlined"
        startIcon={<FiPlus size={15} />}
        sx={{
          px: 2.25,
          minHeight: 40,
          bgcolor: "background.paper",
          whiteSpace: "nowrap",
        }}
      >
        Add expense
      </Button>
    </Stack>
  </Stack>
);
