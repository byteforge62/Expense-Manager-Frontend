import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const STEPS = [
  {
    title: "Record the month",
    text: "Add income and expenses with a category, an amount and a date. Filters and reports read the same records, so nothing is entered twice.",
  },
  {
    title: "Set the limits",
    text: "Give each category a monthly budget. FinTrack shows what has been used, what remains and where a limit has been crossed.",
  },
  {
    title: "Read the result",
    text: "The overview and forecast extend your recorded activity and scheduled bills across the rest of the month, keeping actual and estimated amounts apart.",
  },
];

export const HowItWorks = () => (
  <Box
    component="section"
    id="how"
    sx={{
      bgcolor: "var(--pub-bg)",
      px: "var(--pub-gutter)",
      py: { xs: 7, md: 10 },
    }}
  >
    <Box sx={{ maxWidth: "var(--pub-max)", mx: "auto" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "0.9fr 1.1fr" },
          columnGap: { lg: 8 },
          rowGap: 2,
          alignItems: "end",
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "2rem", sm: "2.4rem", md: "2.9rem" },
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: "-0.045em",
            color: "var(--pub-fg)",
            maxWidth: 420,
            textWrap: "balance",
          }}
        >
          Three steps, then it is a habit.
        </Typography>

        <Typography
          sx={{
            fontSize: 14.5,
            lineHeight: 1.8,
            color: "var(--pub-muted)",
            maxWidth: 460,
            justifySelf: { lg: "start" },
          }}
        >
          FinTrack is a ledger first. Everything else — budgets, forecasts,
          reports — is derived from what you record, so the numbers stay
          explainable.
        </Typography>
      </Box>

      <Box
        sx={{
          mt: { xs: 4, md: 6 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          columnGap: { md: 5 },
        }}
      >
        {STEPS.map((step, index) => (
          <Box
            key={step.title}
            sx={{
              borderTop: "1px solid var(--pub-hair)",
              pt: 2.5,
              pb: { xs: 3, md: 0 },
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--pub-accent)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              Step {String(index + 1).padStart(2, "0")}
            </Typography>

            <Typography
              component="h3"
              sx={{
                mt: 1.5,
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.15rem", md: "1.28rem" },
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.25,
                color: "var(--pub-fg)",
              }}
            >
              {step.title}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 13,
                lineHeight: 1.75,
                color: "var(--pub-muted)",
                maxWidth: 330,
              }}
            >
              {step.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);
