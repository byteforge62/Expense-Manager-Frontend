import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FiBarChart2, FiTarget, FiZap, FiLock } from "react-icons/fi";

const ITEMS = [
  {
    icon: <FiBarChart2 size={16} />,
    title: "Track everything",
    text: "Income and expenses in one ledger, by category and by date.",
  },
  {
    icon: <FiTarget size={16} />,
    title: "Set budgets",
    text: "Monthly limits per category, with what is left and what is over.",
  },
  {
    icon: <FiZap size={16} />,
    title: "Get insight",
    text: "Spending patterns and forecasts built from your recorded entries.",
  },
  {
    icon: <FiLock size={16} />,
    title: "One account, one book",
    text: "Every record is scoped to your account and served over an authenticated API.",
  },
];

/** A quiet capability index. Four facts, separated by rules, no motion. */
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
      py: { xs: 4, md: 5 },
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        columnGap: { lg: 4 },
        rowGap: 0,
      }}
    >
      {ITEMS.map((item, index) => (
        <Box
          key={item.title}
          sx={{
            py: { xs: 2.5, lg: 0 },
            pl: { lg: index === 0 ? 0 : 3 },
            pr: { lg: 1 },
            borderTop: {
              xs: index === 0 ? "none" : "1px solid var(--pub-hair)",
              lg: "none",
            },
            borderLeft: {
              lg: index === 0 ? "none" : "1px solid var(--pub-hair)",
            },
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "var(--pub-accent)",
            }}
          >
            {item.icon}
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "0.98rem",
                fontWeight: 600,
                letterSpacing: "-0.015em",
                color: "var(--pub-fg)",
              }}
            >
              {item.title}
            </Typography>
          </Box>

          <Typography
            sx={{
              mt: 1,
              fontSize: 12.5,
              lineHeight: 1.65,
              color: "var(--pub-muted)",
              maxWidth: 250,
            }}
          >
            {item.text}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);
