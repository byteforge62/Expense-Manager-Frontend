import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FiBarChart2, FiTarget, FiZap, FiLock } from "react-icons/fi";

const ITEMS = [
  {
    icon: <FiBarChart2 size={19} />,
    title: "Track everything",
    text: "Income and expenses in one ledger, by category and by date.",
  },
  {
    icon: <FiTarget size={19} />,
    title: "Set budgets",
    text: "Monthly limits per category, with what is left and what is over.",
  },
  {
    icon: <FiZap size={19} />,
    title: "Get insight",
    text: "Spending patterns, forecasts and recorded analysis, not guesswork.",
  },
  {
    icon: <FiLock size={19} />,
    title: "Your data, your account",
    text: "Records stay scoped to your account behind an authenticated API.",
  },
];

/** A quiet white band naming the four things the product actually does. */
export const CapabilityStrip = () => (
  <Box
    component="section"
    id="capabilities"
    aria-label="What FinTrack does"
    sx={{
      bgcolor: "var(--pub-surface)",
      borderBottom: "1px solid var(--pub-hair)",
      px: "var(--pub-gutter)",
      py: { xs: 5, md: 6 },
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
        columnGap: { lg: 4 },
        rowGap: { xs: 4, lg: 0 },
      }}
    >
      {ITEMS.map((item, index) => (
        <Box
          key={item.title}
          sx={{
            display: "flex",
            gap: 1.75,
            pl: { lg: index === 0 ? 0 : 3.5 },
            borderLeft: {
              lg: index === 0 ? "none" : "1px solid var(--pub-hair)",
            },
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              bgcolor: "var(--pub-lavender)",
              color: "var(--pub-accent)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {item.icon}
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "0.97rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--pub-fg)",
              }}
            >
              {item.title}
            </Typography>
            <Typography
              sx={{
                mt: 0.6,
                fontSize: 12.5,
                lineHeight: 1.65,
                color: "var(--pub-muted)",
                maxWidth: 235,
              }}
            >
              {item.text}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);
