import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import fintrackMark from "../../assets/brand/fintrack-mark.svg";

const BUDGETS = [
  { name: "Groceries", used: "₹5,000", limit: "₹8,000", pct: 62 },
  { name: "Transport", used: "₹2,050", limit: "₹5,000", pct: 41 },
];

const RECENT = [
  { name: "Salary", meta: "Income · 01 Oct", amount: "+₹68,000", positive: true },
  { name: "Rent", meta: "Housing · 02 Oct", amount: "−₹18,000", positive: false },
  { name: "Groceries", meta: "Food · 05 Oct", amount: "−₹3,240", positive: false },
];

const labelSx = { fontSize: 11.5, color: "var(--pub-quiet)" };

/* A small piece of the real workspace, rebuilt with the same tokens so it
   stays legible in both themes. Labelled as an example, never as a claim. */
const HeroPreview = () => (
  <Box
    sx={{
      border: "1px solid var(--pub-hair)",
      borderRadius: "12px",
      bgcolor: "var(--pub-surface)",
      overflow: "hidden",
      boxShadow: "0 28px 56px -36px rgba(15, 23, 42, 0.42)",
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid var(--pub-hair)" }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          component="img"
          src={fintrackMark}
          alt=""
          sx={{ width: 18, height: 18, display: "block" }}
        />
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--pub-fg)",
          }}
        >
          FinTrack
        </Typography>
      </Stack>
      <Typography sx={labelSx}>October · example</Typography>
    </Stack>

    <Box sx={{ px: 2.5, pt: 2.25, pb: 2.5 }}>
      <Typography sx={{ fontSize: 12, color: "var(--pub-muted)" }}>
        Net cash flow
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          fontFamily: "var(--font-display)",
          fontSize: { xs: "1.95rem", sm: "2.25rem" },
          fontWeight: 700,
          letterSpacing: "-0.05em",
          lineHeight: 1.05,
          color: "var(--pub-fg)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        ₹42,180
      </Typography>
      <Typography sx={{ mt: 0.6, fontSize: 11.5, color: "var(--pub-quiet)" }}>
        ₹68,000 in · ₹25,820 out
      </Typography>
    </Box>

    <Box
      sx={{
        px: 2.5,
        py: 2,
        borderTop: "1px solid var(--pub-hair)",
        bgcolor: "var(--pub-surface-alt)",
      }}
    >
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "var(--pub-fg)" }}>
          Budgets
        </Typography>
        <Typography sx={labelSx}>2 active</Typography>
      </Stack>

      {BUDGETS.map((budget) => (
        <Box key={budget.name} sx={{ mt: 1.25 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
            <Typography sx={{ fontSize: 12, color: "var(--pub-fg)" }}>
              {budget.name}
            </Typography>
            <Typography
              sx={{
                fontSize: 11.5,
                color: "var(--pub-muted)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {budget.used} of {budget.limit}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 5,
              borderRadius: 999,
              bgcolor: "var(--pub-hair)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${budget.pct}%`,
                height: "100%",
                borderRadius: "inherit",
                bgcolor: "var(--pub-accent)",
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>

    <Box sx={{ px: 2.5, py: 1.25 }}>
      {RECENT.map((row) => (
        <Stack
          key={row.name}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ py: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "var(--pub-fg)" }}>
              {row.name}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: "var(--pub-quiet)" }}>
              {row.meta}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: row.positive ? "var(--pub-positive)" : "var(--pub-negative)",
            }}
          >
            {row.amount}
          </Typography>
        </Stack>
      ))}
    </Box>
  </Box>
);

export const Hero = () => (
  <Box
    component="section"
    sx={{
      bgcolor: "var(--pub-bg)",
      px: "var(--pub-gutter)",
      pt: { xs: 3, md: 5 },
      pb: { xs: 4, md: 6 },
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.06fr 0.94fr" },
        alignItems: "center",
        columnGap: { lg: 7 },
        rowGap: { xs: 4.5, lg: 0 },
      }}
    >
      <Box sx={{ maxWidth: 600 }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: {
              xs: "2.3rem",
              sm: "2.9rem",
              md: "3.25rem",
              lg: "3.5rem",
            },
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.05em",
            color: "var(--pub-hero-title)",
            textWrap: "balance",
          }}
        >
          Know what you spent, what is left, and what is coming.
        </Typography>

        <Typography
          sx={{
            mt: 2.5,
            maxWidth: "48ch",
            fontSize: { xs: "0.98rem", md: "1.06rem" },
            lineHeight: 1.7,
            color: "var(--pub-hero-muted)",
          }}
        >
          FinTrack keeps your income, expenses and monthly budgets in one
          ledger, then projects the rest of the month from the entries you
          record. No bank connection, no hidden maths.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 1.5 }}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ mt: 3.5 }}
        >
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            size="large"
            endIcon={<FiArrowRight size={16} />}
            sx={{
              minHeight: 50,
              px: 3,
              fontSize: "0.95rem",
              bgcolor: "var(--pub-accent)",
              color: "#ffffff",
              "&:hover": { bgcolor: "var(--pub-accent-deep)" },
            }}
          >
            Create a free account
          </Button>

          <Button
            component="a"
            href="#how"
            size="large"
            endIcon={<FiArrowRight size={15} />}
            sx={{
              minHeight: 50,
              px: 2.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--pub-fg)",
              border: "1px solid var(--pub-hair)",
              bgcolor: "transparent",
              "&:hover": {
                bgcolor: "var(--pub-surface-alt)",
                borderColor: "var(--pub-quiet)",
              },
            }}
          >
            See how it works
          </Button>
        </Stack>

        <Typography sx={{ mt: 2, fontSize: 12.5, color: "var(--pub-quiet)" }}>
          Free to use. No card details at sign-up.
        </Typography>
      </Box>

      <Box sx={{ width: "100%", maxWidth: { xs: 440, lg: 470 }, mx: "auto" }}>
        <HeroPreview />
        <Typography sx={{ mt: 1.25, fontSize: 11.5, color: "var(--pub-quiet)" }}>
          A FinTrack ledger, shown with example data.
        </Typography>
      </Box>
    </Box>
  </Box>
);
