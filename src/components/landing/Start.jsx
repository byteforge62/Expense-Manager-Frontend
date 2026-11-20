import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

/** The closing band: one statement, one door, on the deep violet field. */
export const Start = () => (
  <Box
    component="section"
    id="start"
    sx={{
      bgcolor: "var(--pub-bg)",
      px: "var(--pub-gutter)",
      pt: { xs: 6, md: 7 },
      pb: { xs: 6, md: 7 },
    }}
  >
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        maxWidth: "var(--pub-max)",
        mx: "auto",
        borderRadius: { xs: "22px", md: "28px" },
        px: { xs: 3, sm: 5, md: 7 },
        py: { xs: 4.5, sm: 5.5, md: 6.5 },
        color: "var(--pub-violet-field-fg)",
        background:
          "radial-gradient(120% 160% at 88% 0%, var(--pub-violet-field-2) 0%, transparent 58%), var(--pub-violet-field)",
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          right: { xs: -90, md: -40 },
          top: { xs: -80, md: -120 },
          width: { xs: 260, md: 360 },
          height: { xs: 260, md: 360 },
          borderRadius: "50%",
          border: "1px solid rgba(246, 243, 255, 0.14)",
          boxShadow:
            "0 0 0 34px rgba(246,243,255,0.035), 0 0 0 72px rgba(246,243,255,0.025)",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          left: { xs: -60, md: -30 },
          bottom: { xs: -90, md: -120 },
          width: { xs: 200, md: 280 },
          height: { xs: 200, md: 280 },
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(159, 122, 255, 0.28) 0%, transparent 66%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
          alignItems: { md: "center" },
          columnGap: 5,
          rowGap: 3.5,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              aria-hidden="true"
              sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#a5b4fc" }}
            />
            <Typography
              sx={{
                fontSize: 12,
                letterSpacing: "0.01em",
                color: "rgba(248,250,252,0.72)",
                fontWeight: 500,
              }}
            >
              One plan. It costs nothing.
            </Typography>
          </Stack>

          <Typography
            component="h2"
            sx={{
              mt: 2,
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.55rem" },
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              maxWidth: 560,
              textWrap: "balance",
            }}
          >
            Ready to take control of your finances?
          </Typography>

          <Typography
            sx={{
              mt: 1.75,
              maxWidth: 470,
              fontSize: 14,
              lineHeight: 1.7,
              color: "rgba(248, 250, 252, 0.68)",
            }}
          >
            Open a ledger, record this month, and let the balance answer the
            rest. No card details at any point.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row", md: "column" }} spacing={1.25} sx={{ alignItems: { sm: "center", md: "stretch" } }}>
          <Button
            component={RouterLink}
            to="/signup"
            size="large"
            endIcon={<FiArrowRight size={17} />}
            sx={{
              px: 3,
              minHeight: 48,
              bgcolor: "#ffffff",
              color: "#0f172a",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#eef2ff", color: "#0f172a" },
            }}
          >
            Get started free
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
