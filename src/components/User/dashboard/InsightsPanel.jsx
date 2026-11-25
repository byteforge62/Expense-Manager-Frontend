import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import {
  FiArrowUpRight,
  FiBarChart2,
  FiShield,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import { AITextInsightCard, SpendingRiskCard } from "./InsightCards";

/**
 * Compact insight desk for the dashboard overview. The full workspace lives at
 * /private/financial-intelligence; this panel keeps the five checks one click
 * away without turning the overview into a second long page.
 */
export const InsightsPanel = ({
  riskData,
  loadingRisk,
  fetchRisk,
  healthScore,
  loadingHealth,
  fetchHealthScore,
  expenseInsights,
  loadingInsights,
  fetchExpenseInsights,
  forecast,
  loadingForecast,
  fetchForecast,
  savingOpportunities,
  loadingSavings,
  fetchSavingOpportunities,
}) => (
  <Box component="section" aria-labelledby="insights-heading">
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={1}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          id="insights-heading"
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "0.98rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Insights &amp; planning
        </Typography>
      </Box>
      <Button
        component={RouterLink}
        to="/private/financial-intelligence"
        size="small"
        endIcon={<FiArrowUpRight size={13} />}
        sx={{
          flexShrink: 0,
          minHeight: 28,
          px: 1,
          fontSize: 11.5,
          textTransform: "none",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        Explore intelligence
      </Button>
    </Stack>

    <Box
      component="ul"
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
        mt: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <SpendingRiskCard
        riskData={riskData}
        isLoading={loadingRisk}
        onRefresh={fetchRisk}
      />

      <AITextInsightCard
        title="Financial health"
        icon={<FiShield size={14} />}
        iconColor="secondary.main"
        isLoading={loadingHealth}
        value={healthScore}
        onRefresh={fetchHealthScore}
        loadingLabel="Reviewing financial health..."
        loadingColor="secondary"
        buttonLabel="Check health"
      />

      <AITextInsightCard
        title="Spending patterns"
        icon={<FiBarChart2 size={14} />}
        iconColor="cyan.main"
        isLoading={loadingInsights}
        value={expenseInsights}
        onRefresh={fetchExpenseInsights}
        loadingLabel="Analyzing spending..."
        loadingColor="primary"
        buttonLabel="Analyze patterns"
      />

      <AITextInsightCard
        title="Cash-flow forecast"
        icon={<FiTrendingUp size={14} />}
        iconColor="primary.main"
        isLoading={loadingForecast}
        value={forecast}
        onRefresh={fetchForecast}
        loadingLabel="Preparing forecast..."
        loadingColor="primary"
        buttonLabel="Generate forecast"
      />

      <AITextInsightCard
        title="Savings suggestions"
        icon={<FiZap size={14} />}
        iconColor="success.main"
        isLoading={loadingSavings}
        value={savingOpportunities}
        onRefresh={fetchSavingOpportunities}
        loadingLabel="Preparing suggestions..."
        loadingColor="success"
        buttonLabel="View suggestions"
      />
    </Box>
  </Box>
);

export default InsightsPanel;
