import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FiTrendingUp, FiTrendingDown, FiTarget } from "react-icons/fi";

/* ── Income / expenses / budget totals ── */

export const MetricSummaryCards = ({
  totalIncome,
  totalExpenses,
  totalBudget,
  hasFinancialData,
  formatCurrency,
}) => (
  <Grid container spacing={2}>
    {[
      {
        label: "Income received",
        value: totalIncome,
        icon: <FiTrendingUp size={17} />,
        color: "success.main",
        bg: "var(--accent-sage)",
        note: "Recorded entries",
      },
      {
        label: "Expenses tracked",
        value: totalExpenses,
        icon: <FiTrendingDown size={17} />,
        color: "error.main",
        bg: "var(--accent-peach)",
        note: "Recorded entries",
      },
      {
        label: "Budget planned",
        value: totalBudget,
        icon: <FiTarget size={17} />,
        color: "primary.main",
        bg: "var(--accent-electric-soft)",
        note: "Across your budgets",
      },
    ].map((item) => (
      <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
        <Card
          sx={{
            height: "100%",
            borderRadius: "12px",
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "var(--shadow-panel)",
            transition: "border-color 160ms ease",
            "&:hover": { borderColor: "var(--border-medium)" },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: "text.secondary" }}>
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.85,
                    fontFamily: "var(--font-display)",
                    fontSize: "1.72rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {hasFinancialData ? formatCurrency(item.value) : "—"}
                </Typography>
                <Typography sx={{ mt: 0.6, fontSize: 11.5, color: "text.secondary" }}>
                  {hasFinancialData ? item.note : "Add a record to get started"}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "10px",
                  color: item.color,
                  bgcolor: item.bg,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
            </Stack>
          </Box>
        </Card>
      </Grid>
    ))}
  </Grid>
);
