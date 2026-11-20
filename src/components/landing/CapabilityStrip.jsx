import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FiBarChart2, FiTarget, FiZap, FiLock } from "react-icons/fi";

const ITEMS = [
  {
    icon: <FiBarChart2 size={21} />,
    title: "Track everything",
    text: "Income and expenses in one ledger, by category and by date.",
  },
  {
    icon: <FiTarget size={21} />,
    title: "Set budgets",
    text: "Monthly limits per category, with what is left and what is over.",
  },
  {
    icon: <FiZap size={21} />,
    title: "Get insight",
    text: "Spending patterns, forecasts and recorded analysis, not guesswork.",
  },
  {
    icon: <FiLock size={21} />,
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
      borderTop: "1px solid var(--pub-hair)",
      borderBottom: "1px solid var(--pub-hair)",
      px: "var(--pub-gutter)",
      py: { xs: 4, md: 5.5 },
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
        columnGap: { lg: 4 },
        rowGap: { xs: 3.5, lg: 0 },
      }}
    >
      {ITEMS.map((item, index) => (
        <Box
          key={item.title}
          sx={{
            display: "flex",
            gap: 1.75,
            pl: { lg: index === 0 ? 0 : 4 },
            borderLeft: {
              lg: index === 0 ? "none" : "1px solid var(--pub-hair)",
            },
          }}
        >
          <Box sx={{ color: "var(--pub-accent)", flexShrink: 0, pt: 0.25 }}>
            {item.icon}
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "0.98rem",
                fontWeight: 600,
                letterSpacing: "-0.015em",
              }}
            >
              {item.title}
            </Typography>
            <Typography
              sx={{
                mt: 0.6,
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "var(--pub-muted)",
                maxWidth: 230,
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
