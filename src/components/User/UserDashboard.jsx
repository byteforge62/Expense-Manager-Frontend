import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Link as RouterLink } from "react-router-dom";
import {
  FiArrowUpRight,
  FiShield,
  FiBarChart2,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import axiosInstance from "../Utils/axiosInstance";
import { fetchBudgetData } from "../../redux/slices/budgetSlice";
import { fetchIncomeData } from "../../redux/slices/incomeSlice";
import { fetchAllExpenses } from "../../redux/slices/expenseSlice";

import { DashboardSkeleton } from "./dashboard/DashboardSkeleton";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { FinancialSnapshotCard } from "./dashboard/FinancialSnapshotCard";
import { MetricSummaryCards } from "./dashboard/MetricSummaryCards";
import { AITextInsightCard, SpendingRiskCard } from "./dashboard/InsightCards";
import { AssistantChatCard } from "./dashboard/AssistantChatCard";
import {
  SpendingTrendChart,
  CashEquilibriumChart,
  CategoryBreakdownChart,
} from "./dashboard/AnalyticsCharts";
import { RecurringOperationsCard } from "./dashboard/RecurringOperationsCard";
import { InsightsHistoryCard } from "./dashboard/InsightsHistoryCard";

/**
 * --- INTELLIGENCE HUB (USER DASHBOARD) ---
 * The central nervous system of the application.
 * Combines traditional financial metrics with AI-driven insights,
 * real-time forecasting, and a cognitive chat assistant.
 *
 * This component owns orchestration only: Redux selectors, section state, the
 * AI fetchers and the derived totals. Each visual section lives in ./dashboard
 * and receives just the data and callbacks it needs.
 */

export const UserDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id;
  const budget = useSelector((state) => state.budget.budgets);
  const loadingDashboard = useSelector(
    (state) =>
      state.budget.loading || state.income.loading || state.expense.loading,
  );
  const income = useSelector((state) => state.income.incomes);
  const expenses = useSelector((state) => state.expense.expenses);
  const [expenseInsights, setExpenseInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [forecast, setForecast] = useState("");
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [upcomingRecurring, setUpcomingRecurring] = useState([]);
  const [savingOpportunities, setSavingOpportunities] = useState("");
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [healthScore, setHealthScore] = useState("");
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [allInsights, setAllInsights] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCharts, setloadingCharts] = useState(true);
  const [loadingSecondary, setloadingSecondary] = useState(true);

  // --- AI MODULES: DATA FETCHING ---

  const fetchUpcomingRecurring = async () => {
    setloadingSecondary(true);
    try {
      const res = await axiosInstance.get("/recurring/upcoming");
      setUpcomingRecurring(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setloadingSecondary(false);
    }
  };

  const fetchExpenseInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await axiosInstance.get("/ai/expense-insights", {
        skipGlobalLoader: true,
      });
      setExpenseInsights(res.data.data);
    } finally {
      setLoadingInsights(false);
    }
  };
  const fetchForecast = async () => {
    try {
      setLoadingForecast(true);
      const res = await axiosInstance.get("/ai/financial-forecast", {
        skipGlobalLoader: true,
      });
      setForecast(res.data.data);
    } finally {
      setLoadingForecast(false);
    }
  };
  const fetchSavingOpportunities = async () => {
    try {
      setLoadingSavings(true);
      const res = await axiosInstance.get(
        "/ai/saving-opportunities",
        { skipGlobalLoader: true },
      );
      setSavingOpportunities(res.data.data);
    } finally {
      setLoadingSavings(false);
    }
  };
  const fetchHealthScore = async () => {
    try {
      setLoadingHealth(true);
      const res = await axiosInstance.get("/ai/financial-health", {
        skipGlobalLoader: true,
      });
      setHealthScore(res.data.data);
    } finally {
      setLoadingHealth(false);
    }
  };
  const fetchRisk = async () => {
    try {
      setLoadingRisk(true);
      const res = await axiosInstance.get("/ai/spending-risk", {
        skipGlobalLoader: true,
      });
      setRiskData(res.data.data);
    } finally {
      setLoadingRisk(false);
    }
  };
  const fetchAllInsights = async () => {
    try {
      setLoadingHistory(true);
      const res = await axiosInstance.get("/ai/insights", {
        skipGlobalLoader: true,
      });
      setAllInsights(res.data.data);
    } finally {
      setLoadingHistory(false);
    }
  };

  // --- LIFECYCLE & INITIALIZATION ---

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      dispatch(fetchBudgetData(userId)),
      dispatch(fetchIncomeData(userId)),
      dispatch(fetchAllExpenses({ userId })),
    ]).finally(() => setloadingCharts(false));
    fetchUpcomingRecurring();
  }, [userId, dispatch]);

  const totalBudget = (budget || []).reduce((a, i) => a + i.amount, 0);
  const totalIncome = (income || []).reduce((a, i) => a + i.amount, 0);
  const totalExpenses = (expenses || []).reduce((a, e) => a + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  const hasActivity = income.length > 0 || expenses.length > 0;
  const hasFinancialData = hasActivity || budget.length > 0;
  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // --- ANALYTICS DATA PROCESSING ---

  // Calculate 30-day trend

  const trendData = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last30Days.push({
        date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        fullDate: d.toISOString().split("T")[0],
        amount: 0,
      });
    }

    expenses.forEach((exp) => {
      const expDate = new Date(exp.date).toISOString().split("T")[0];
      const day = last30Days.find((d) => d.fullDate === expDate);
      if (day) {
        day.amount += exp.amount;
      }
    });

    return last30Days;
  }, [expenses]);

  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((exp) => {
      const cat = exp.categoryID?.name || "Other";
      map[cat] = (map[cat] || 0) + exp.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  if (loadingDashboard) return <DashboardSkeleton />;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}
    >

      <DashboardHeader />

      <FinancialSnapshotCard
        hasActivity={hasActivity}
        netSavings={netSavings}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        savingsRate={savingsRate}
        formatCurrency={formatCurrency}
      />

      <MetricSummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        totalBudget={totalBudget}
        hasFinancialData={hasFinancialData}
        formatCurrency={formatCurrency}
      />

      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={1}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.025em" }}>
            Insights & planning
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            Helpful tools when you’re ready to take a closer look.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/private/financial-intelligence"
          size="small"
          endIcon={<FiArrowUpRight size={15} />}
          sx={{ px: 1.25, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        >
          Explore intelligence
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <SpendingRiskCard
          riskData={riskData}
          isLoading={loadingRisk}
          onRefresh={fetchRisk}
        />

        <AITextInsightCard
          title="Financial health"
          icon={<FiShield size={16} />}
          iconColor="secondary.main"
          iconBg="rgba(139, 92, 246, 0.1)"
          borderColor="rgba(139, 92, 246, 0.15)"
          isLoading={loadingHealth}
          value={healthScore}
          onRefresh={fetchHealthScore}
          prompt="Review your income, expenses, and available budget data."
          loadingLabel="Reviewing financial health..."
          loadingColor="secondary"
          buttonLabel="Check health"
          buttonColor="bg-violet-500 text-white hover:bg-violet-600"
        />

        <AITextInsightCard
          title="Spending patterns"
          icon={<FiBarChart2 size={16} />}
          iconColor="cyan.main"
          iconBg="rgba(6, 182, 212, 0.1)"
          borderColor="rgba(6, 182, 212, 0.15)"
          isLoading={loadingInsights}
          value={expenseInsights}
          onRefresh={fetchExpenseInsights}
          prompt="Compare recent spending by category and over time."
          loadingLabel="Analyzing spending..."
          loadingColor="primary"
          buttonLabel="Analyze patterns"
          buttonColor="bg-cyan-500 text-white hover:bg-cyan-600"
        />

        <AITextInsightCard
          title="Cash-flow forecast"
          icon={<FiTrendingUp size={16} />}
          iconColor="primary.main"
          iconBg="rgba(59, 130, 246, 0.1)"
          borderColor="rgba(59, 130, 246, 0.15)"
          isLoading={loadingForecast}
          value={forecast}
          onRefresh={fetchForecast}
          prompt="Estimate the next three months using your available financial data."
          loadingLabel="Preparing forecast..."
          loadingColor="primary"
          buttonLabel="Generate forecast"
          buttonColor="bg-blue-500 text-white hover:bg-blue-600"
        />

        <AITextInsightCard
          title="Savings suggestions"
          icon={<FiZap size={16} />}
          iconColor="success.main"
          iconBg="rgba(16, 185, 129, 0.1)"
          borderColor="rgba(16, 185, 129, 0.15)"
          isLoading={loadingSavings}
          value={savingOpportunities}
          onRefresh={fetchSavingOpportunities}
          prompt="Identify specific budget optimizations to maximize your monthly net surplus."
          loadingLabel="Preparing suggestions..."
          loadingColor="success"
          buttonLabel="View suggestions"
          buttonColor="bg-emerald-500 text-white hover:bg-emerald-600"
        />

        <AssistantChatCard />
      </Grid>

      {/* ══ VISUAL ANALYTICS ══ */}
      {loadingCharts ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Skeleton
              variant="rectangular"
              height={320}
              sx={{ borderRadius: 6 }}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Skeleton
              variant="rectangular"
              height={320}
              sx={{ borderRadius: 6 }}
            />
          </Grid>
        </Grid>
      ) : (
        (totalIncome > 0 || totalExpenses > 0) && (
          <Grid container spacing={3}>
            <SpendingTrendChart data={trendData} />

            <CashEquilibriumChart
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
            />

            {categoryData.length > 0 && (
              <CategoryBreakdownChart data={categoryData} />
            )}
          </Grid>
        )
      )}

      <RecurringOperationsCard
        items={upcomingRecurring}
        isLoading={loadingSecondary}
      />

      <InsightsHistoryCard
        insights={allInsights}
        isLoading={loadingHistory}
        onRefresh={fetchAllInsights}
      />
    </Box>
  );
};
