import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

/** The closing band: one plain statement, one door. */
export const Start = () => (
  <Box
    component="section"
    id="start"
    sx={{
      bgcolor: "var(--pub-bg)",
      px: "var(--pub-gutter)",
      py: { xs: 6, md: 7 },
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        borderRadius: "16px",
        px: { xs: 3, sm: 5, md: 7 },
        py: { xs: 4.5, sm: 5.5, md: 6 },
        color: "var(--pub-violet-field-fg)",
        bgcolor: "var(--pub-violet-field)",
        border: "1px solid rgba(248, 250, 252, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
          alignItems: { md: "center" },
          columnGap: 5,
          rowGap: 3.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 12.5,
              color: "rgba(248, 250, 252, 0.66)",
              fontWeight: 500,
            }}
          >
            One plan. It costs nothing.
          </Typography>

          <Typography
            component="h2"
            sx={{
              mt: 1.5,
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              maxWidth: 560,
              textWrap: "balance",
            }}
          >
            Start with this month.
          </Typography>

          <Typography
            sx={{
              mt: 1.75,
              maxWidth: 480,
              fontSize: 14,
              lineHeight: 1.7,
              color: "rgba(248, 250, 252, 0.7)",
            }}
          >
            Record what you have already spent, give the rest a budget, and let
            the overview keep score. An account needs an email and a password.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row", md: "column" }}
          spacing={{ xs: 1, sm: 1.5, md: 1 }}
          sx={{ alignItems: { sm: "center", md: "stretch" } }}
        >
          <Button
            component={RouterLink}
            to="/signup"
            size="large"
            endIcon={<FiArrowRight size={16} />}
            sx={{
              px: 3,
              minHeight: 48,
              bgcolor: "#ffffff",
              color: "#0f172a",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#eef2ff", color: "#0f172a" },
            }}
          >
            Create an account
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            size="large"
            sx={{
              px: 3,
              minHeight: 48,
              color: "var(--pub-violet-field-fg)",
              border: "1px solid rgba(248, 250, 252, 0.24)",
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: "rgba(248, 250, 252, 0.08)",
                borderColor: "rgba(248, 250, 252, 0.46)",
              },
            }}
          >
            Sign in
          </Button>
        </Stack>
      </Box>
    </Box>
  </Box>
);
