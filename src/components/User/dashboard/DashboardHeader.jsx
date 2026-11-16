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
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2.5}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.14em" }}
          >
            FINANCIAL WORKSPACE
          </Typography>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 750, letterSpacing: "-0.045em", mt: 0.25 }}>
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
            startIcon={<FiPlus />}
            sx={{
              px: 2.25,
              py: 1.15,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "0 8px 18px rgba(57, 133, 255, 0.2)",
            }}
          >
            Add income
          </Button>
          <Button
            component={RouterLink}
            to="/private/expenses"
            variant="outlined"
            startIcon={<FiPlus />}
            sx={{
              px: 2.25,
              py: 1.15,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            Add expense
          </Button>
        </Stack>
      </Stack>
);
