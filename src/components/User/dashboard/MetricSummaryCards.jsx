import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
          { label: "Income received", value: totalIncome, icon: <FiTrendingUp size={18} />, color: "#348e6b", bg: "rgba(69, 184, 137, 0.11)", note: "Across recorded entries" },
          { label: "Expenses tracked", value: totalExpenses, icon: <FiTrendingDown size={18} />, color: "#d65f5a", bg: "rgba(240, 120, 112, 0.11)", note: "Across recorded entries" },
          { label: "Budget planned", value: totalBudget, icon: <FiTarget size={18} />, color: "#3985ff", bg: "rgba(57, 133, 255, 0.11)", note: "Across your budgets" },
        ].map((item) => (
          <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                boxShadow: "0 6px 20px rgba(26, 39, 57, 0.035)",
                transition: "transform 180ms ease, box-shadow 180ms ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 26px rgba(26, 39, 57, 0.07)" },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1.1, fontWeight: 750, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
                      {hasFinancialData ? formatCurrency(item.value) : "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.65 }}>
                      {hasFinancialData ? item.note : "Add a record to get started"}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 2.5, color: item.color, bgcolor: item.bg }}>
                    {item.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
);
