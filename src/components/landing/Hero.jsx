import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import {
  FiArrowRight,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiPlay,
  FiTrendingUp as FiLine,
} from "react-icons/fi";

/**
 * --- PUBLIC HERO ---
 * The reference composition: a statement on the left, and on the right a
 * white "This month" summary card seated on a lavender field, with the
 * focus chart layered over it. Figures are illustrative and labelled.
 */

const ROWS = [
  {
    label: "Income",
    value: "₹48,000",
    delta: "12%",
    tone: "positive",
    icon: <FiTrendingUp size={16} />,
  },
  {
    label: "Expenses",
    value: "₹21,450",
    delta: "8%",
    tone: "negative",
    icon: <FiTrendingDown size={16} />,
  },
  {
    label: "Remaining",
    value: "₹26,550",
    tone: "brand",
    icon: <FiPieChart size={16} />,
  },
];

const TONES = {
  positive: { fg: "var(--pub-positive)", bg: "rgba(31, 157, 107, 0.12)" },
  negative: { fg: "var(--pub-negative)", bg: "rgba(224, 86, 75, 0.12)" },
  brand: { fg: "var(--pub-accent)", bg: "var(--pub-lavender)" },
};

const BARS = [
  { month: "Jan", height: 46 },
  { month: "Feb", height: 62 },
  { month: "Mar", height: 40 },
  { month: "Apr", height: 70 },
  { month: "May", height: 54 },
  { month: "Jun", height: 92, active: true },
];

export const Hero = () => (
  <Box
    component="section"
    sx={{
      position: "relative",
      overflow: "hidden",
      bgcolor: "var(--pub-bg)",
      px: "var(--pub-gutter)",
      pt: { xs: 6, md: 9 },
      pb: { xs: 7, md: 10 },
    }}
  >
    {/* Lavender field behind the product card */}
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        top: { xs: -180, md: -260 },
        right: { xs: "-42%", md: "-10%" },
        width: { xs: 620, md: 900 },
        height: { xs: 620, md: 900 },
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 50% 45%, var(--pub-lavender) 0%, color-mix(in srgb, var(--pub-lavender) 55%, transparent) 52%, transparent 70%)",
        pointerEvents: "none",
      }}
    />
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        bottom: { xs: -220, md: -320 },
        left: "-18%",
        width: { xs: 480, md: 620 },
        height: { xs: 480, md: 620 },
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--pub-lavender) 45%, transparent) 0%, transparent 68%)",
        pointerEvents: "none",
      }}
    />

    <Box
      sx={{
        position: "relative",
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.02fr 0.98fr" },
        alignItems: "center",
        columnGap: { lg: 6 },
        rowGap: { xs: 6, lg: 4 },
      }}
    >
      <Box sx={{ maxWidth: 560 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            display: "inline-flex",
            px: 1.5,
            py: 0.6,
            borderRadius: 999,
            bgcolor: "var(--pub-lavender)",
            color: "var(--pub-accent-deep)",
          }}
        >
          <FiLine size={14} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.01em" }}>
            Take control of your finances
          </Typography>
        </Stack>

        <Typography
          component="h1"
          sx={{
            mt: 2.5,
            fontFamily: "var(--font-display)",
            fontSize: { xs: "2.7rem", sm: "3.5rem", md: "4.15rem" },
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.045em",
            textWrap: "balance",
          }}
        >
          Smarter money.
          <Box component="span" sx={{ display: "block", color: "var(--pub-accent)" }}>
            Brighter future.
          </Box>
        </Typography>

        <Typography
          sx={{
            mt: 2.5,
            maxWidth: "46ch",
            fontSize: { xs: "1rem", md: "1.06rem" },
            lineHeight: 1.68,
            color: "var(--pub-muted)",
          }}
        >
          Track your income, manage expenses, set budgets, and see where the
          month is heading — one ledger for every rupee.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/signup"
            size="large"
            variant="contained"
            endIcon={<FiArrowRight size={17} />}
            sx={{ px: 3, minHeight: 50, fontSize: "0.95rem" }}
          >
            Start for free
          </Button>
          <Button
            component="a"
            href="#how"
            size="large"
            variant="outlined"
            startIcon={<FiPlay size={14} />}
            sx={{
              px: 2.75,
              minHeight: 50,
              fontSize: "0.95rem",
              borderColor: "color-mix(in srgb, var(--pub-accent) 26%, transparent)",
              color: "var(--pub-fg)",
              bgcolor: "var(--pub-surface)",
              "&:hover": {
                borderColor: "var(--pub-accent)",
                bgcolor: "var(--pub-surface)",
              },
            }}
          >
            See how it works
          </Button>
        </Stack>

        <Typography sx={{ mt: 2.5, fontSize: 12.5, color: "var(--pub-quiet)" }}>
          Free to use · No card details · Reports download as PDF
        </Typography>
      </Box>

      {/* ── Product composition ── */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: { xs: 400, sm: 430, md: 470 },
          pt: { xs: 1, md: 2 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            width: { xs: "100%", sm: 404 },
            maxWidth: 404,
            bgcolor: "var(--pub-surface)",
            border: "1px solid var(--pub-hair)",
            borderRadius: "22px",
            boxShadow: "var(--shadow-raised)",
            p: { xs: 2.25, sm: 2.75 },
            transform: { lg: "rotate(-1.5deg)" },
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.02rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              This month
            </Typography>
            <Box
              sx={{
                px: 1.25,
                py: 0.35,
                borderRadius: 999,
                bgcolor: "var(--pub-lavender-soft)",
                color: "var(--pub-accent-deep)",
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 600 }}>June</Typography>
            </Box>
          </Stack>

          <Stack spacing={0.5} sx={{ mt: 2 }}>
            {ROWS.map((row) => {
              const tone = TONES[row.tone];
              return (
                <Stack
                  key={row.label}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ py: 1.1 }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      color: tone.fg,
                      bgcolor: tone.bg,
                      flexShrink: 0,
                    }}
                  >
                    {row.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: 11.5, color: "var(--pub-muted)" }}>
                      {row.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.08rem",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        fontVariantNumeric: "tabular-nums",
                        lineHeight: 1.25,
                      }}
                    >
                      {row.value}
                    </Typography>
                  </Box>
                  {row.delta && (
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: tone.fg,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      ↑ {row.delta}
                    </Typography>
                  )}
                </Stack>
              );
            })}
          </Stack>

          <Box
            aria-hidden="true"
            sx={{
              mt: 1.75,
              pt: 2,
              borderTop: "1px solid var(--pub-hair)",
              display: "flex",
              alignItems: "stretch",
              gap: 1.1,
              height: 112,
            }}
          >
            {BARS.map((bar) => (
              <Box
                key={bar.month}
                sx={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    height: `${bar.height}%`,
                    minHeight: 8,
                    borderRadius: "5px",
                    bgcolor: bar.active ? "var(--pub-accent)" : "var(--pub-lavender)",
                  }}
                />
                <Typography
                  sx={{ mt: 0.75, fontSize: 9.5, color: "var(--pub-quiet)" }}
                >
                  {bar.month}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Focus chart card */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            position: "absolute",
            zIndex: 3,
            right: -52,
            bottom: 2,
            width: 196,
            borderRadius: "18px",
            p: 2,
            color: "var(--pub-violet-field-fg)",
            background:
              "linear-gradient(150deg, var(--pub-violet-field-2) 0%, var(--pub-violet-field) 72%)",
            boxShadow: "0 26px 50px -28px rgba(29, 16, 56, 0.75)",
            transform: "rotate(5deg)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography sx={{ fontSize: 10, opacity: 0.62, letterSpacing: "0.06em" }}>
                YOUR MONEY
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  mt: 0.25,
                }}
              >
                In focus
              </Typography>
            </Box>
            <Box component="span" sx={{ color: "#e9d5a1", fontSize: 13 }}>
              ✦
            </Box>
          </Stack>

          <Box
            component="svg"
            viewBox="0 0 170 58"
            role="img"
            aria-label="Illustrative balance line trending upward"
            sx={{ display: "block", width: "100%", height: 58, mt: 1.5 }}
          >
            <defs>
              <linearGradient id="hero-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9b6ff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#c9b6ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M4 46 L32 40 L58 43 L86 28 L112 31 L140 14 L166 8 L166 58 L4 58 Z"
              fill="url(#hero-spark-fill)"
            />
            <path
              d="M4 46 L32 40 L58 43 L86 28 L112 31 L140 14 L166 8"
              fill="none"
              stroke="#d8c9ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="166" cy="8" r="3" fill="#ffffff" />
          </Box>
        </Box>

        <Typography
          sx={{
            position: "absolute",
            bottom: { xs: -6, md: -2 },
            left: { xs: 0, md: 6 },
            fontSize: 10.5,
            color: "var(--pub-quiet)",
          }}
        >
          Illustrative figures
        </Typography>
      </Box>
    </Box>
  </Box>
);
