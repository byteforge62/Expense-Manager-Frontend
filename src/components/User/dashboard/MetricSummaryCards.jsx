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
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            transition: "border-color 160ms ease, transform 160ms ease",
            "&:hover": { borderColor: "var(--border-medium)", transform: "translateY(-1px)" },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.9,
                    fontFamily: "var(--font-display)",
                    fontSize: "1.55rem",
                    fontWeight: 600,
                    letterSpacing: "-0.035em",
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
                  borderRadius: 2,
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
