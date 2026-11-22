import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FiTrendingUp, FiTrendingDown, FiTarget } from "react-icons/fi";

/* ── Income / expenses / budget totals ──
   One surface, three columns, hairline dividers. The three figures are
   read together, so they share one frame instead of three competing cards. */

export const MetricSummaryCards = ({
  totalIncome,
  totalExpenses,
  totalBudget,
  hasFinancialData,
  formatCurrency,
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
      bgcolor: "background.paper",
      border: 1,
      borderColor: "divider",
      borderRadius: "12px",
      boxShadow: "var(--shadow-panel)",
      overflow: "hidden",
    }}
  >
    {[
      {
        label: "Income received",
        value: totalIncome,
        icon: <FiTrendingUp size={15} />,
        color: "success.main",
        note: "Recorded entries",
      },
      {
        label: "Expenses tracked",
        value: totalExpenses,
        icon: <FiTrendingDown size={15} />,
        color: "error.main",
        note: "Recorded entries",
      },
      {
        label: "Budget planned",
        value: totalBudget,
        icon: <FiTarget size={15} />,
        color: "primary.main",
        note: "Across your budgets",
      },
    ].map((item, index) => (
      <Box
        key={item.label}
        sx={{
          p: { xs: 2.25, sm: 2.75 },
          borderTop: { xs: index === 0 ? 0 : 1, sm: 0 },
          borderLeft: { xs: 0, sm: index === 0 ? 0 : 1 },
          borderColor: "divider",
          minWidth: 0,
        }}
      >
        <Stack direction="row" spacing={0.9} alignItems="center">
          <Box sx={{ color: item.color, display: "flex", flexShrink: 0 }}>
            {item.icon}
          </Box>
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 500, color: "text.secondary" }}
            noWrap
          >
            {item.label}
          </Typography>
        </Stack>

        <Typography
          sx={{
            mt: 1.25,
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.7rem", sm: "1.85rem" },
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            fontVariantNumeric: "tabular-nums",
            color: "text.primary",
          }}
          noWrap
        >
          {hasFinancialData ? formatCurrency(item.value) : "—"}
        </Typography>

        <Typography sx={{ mt: 0.75, fontSize: 11.5, color: "text.secondary" }}>
          {hasFinancialData ? item.note : "Add a record to get started"}
        </Typography>
      </Box>
    ))}
  </Box>
);
