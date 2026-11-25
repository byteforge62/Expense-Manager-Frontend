import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import Box from "@mui/material/Box";
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
import {
  fetchBudgets,
  selectAllBudgets,
  selectBudgetStatus,
} from "../../store/slices/budgetSlice";
import {
  fetchIncomes,
  selectAllIncomes,
  selectIncomeStatus,
} from "../../store/slices/incomeSlice";
import {
  fetchExpenses,
  selectAllExpenses,
  selectExpensesStatus,
} from "../../store/slices/expensesSlice";

import { DashboardSkeleton } from "./dashboard/DashboardSkeleton";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { WelcomeNotice } from "./dashboard/WelcomeNotice";
import { LedgerStatement } from "./dashboard/LedgerStatement";
import { AITextInsightCard, SpendingRiskCard } from "./dashboard/InsightCards";
import { AssistantChatCard } from "./dashboard/AssistantChatCard";
import { AnalysisSheet } from "./dashboard/AnalyticsCharts";
import { RecurringOperationsCard } from "./dashboard/RecurringOperationsCard";
import { InsightsHistoryCard } from "./dashboard/InsightsHistoryCard";
import { QuickActions } from "./dashboard/QuickActions";
import { MoneyFlow } from "./dashboard/MoneyFlow";

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
  const dispatch = useAppDispatch();
  // A primitive, not the whole user object: profile edits cannot re-render
  // the dashboard unless the id itself changes.
  const userId = useAppSelector((state) => state.auth.user?._id);
  const budget = useAppSelector(selectAllBudgets);
  const income = useAppSelector(selectAllIncomes);
  const expenses = useAppSelector(selectAllExpenses);

  const budgetLoading = useAppSelector(selectBudgetStatus) === "loading";
  const incomeLoading = useAppSelector(selectIncomeStatus) === "loading";
  const expensesLoading = useAppSelector(selectExpensesStatus) === "loading";
  const loadingDashboard = budgetLoading || incomeLoading || expensesLoading;
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
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [loadingPlanning, setLoadingPlanning] = useState(true);

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

  /**
   * Pending bills and this month's purchase summary. Both are real reads; a
   * failure in either leaves its card in an empty state rather than blocking
   * the rest of the dashboard.
   */
  const fetchPlanningSnapshot = async () => {
    setLoadingPlanning(true);
    const now = new Date();
    const dueBefore = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const [billsResult, purchasesResult] = await Promise.allSettled([
      axiosInstance.get("/bills/me", {
        params: {
          status: "pending",
          dueBefore,
          sortBy: "dueDate",
          sortOrder: "asc",
          limit: 20,
        },
        skipGlobalLoader: true,
      }),
      axiosInstance.get("/purchases/summary", {
        params: { startDate: monthStart },
        skipGlobalLoader: true,
      }),
    ]);

    if (billsResult.status === "fulfilled") {
      const items = billsResult.value?.data?.data;
      setUpcomingBills(Array.isArray(items) ? items : []);
    }

    if (purchasesResult.status === "fulfilled") {
      setPurchaseSummary(purchasesResult.value?.data?.data ?? null);
    }

    setLoadingPlanning(false);
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
      dispatch(fetchBudgets(userId)),
      dispatch(fetchIncomes(userId)),
      dispatch(fetchExpenses({ userId })),
    ]).finally(() => setloadingCharts(false));
    fetchUpcomingRecurring();
    fetchPlanningSnapshot();
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

      <WelcomeNotice
        onSeeded={() => {
          fetchUpcomingRecurring();
          fetchPlanningSnapshot();
        }}
      />

      <DashboardHeader />

      <QuickActions />

      <LedgerStatement
        hasActivity={hasActivity}
        netSavings={netSavings}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        savingsRate={savingsRate}
        totalBudget={totalBudget}
        hasFinancialData={hasFinancialData}
        formatCurrency={formatCurrency}
      />

      <MoneyFlow
        bills={upcomingBills}
        billsLoading={loadingPlanning}
        purchaseSummary={purchaseSummary}
        purchasesLoading={loadingPlanning}
        formatCurrency={formatCurrency}
        monthLabel={new Date().toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })}
      />

      <Box component="section" aria-labelledby="insights-heading">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          spacing={1}
        >
          <Box>
            <Typography
              id="insights-heading"
              component="h2"
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Insights & planning
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.3 }}>
              Helpful tools when you’re ready to take a closer look.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/private/financial-intelligence"
            size="small"
            endIcon={<FiArrowUpRight size={15} />}
            sx={{ px: 1.25, textTransform: "none", fontWeight: 600 }}
          >
            Explore intelligence
          </Button>
        </Stack>

        <Box
          sx={{
            mt: 1,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.42fr) minmax(0, 0.58fr)",
            },
            columnGap: { lg: 4 },
            rowGap: 3,
            alignItems: "start",
          }}
        >
          <Box
            component="ul"
            sx={{
              listStyle: "none",
              m: 0,
              p: 0,
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
              icon={<FiShield size={15} />}
              iconColor="secondary.main"
              isLoading={loadingHealth}
              value={healthScore}
              onRefresh={fetchHealthScore}
              prompt="Review your income, expenses, and available budget data."
              loadingLabel="Reviewing financial health..."
              loadingColor="secondary"
              buttonLabel="Check health"
            />

            <AITextInsightCard
              title="Spending patterns"
              icon={<FiBarChart2 size={15} />}
              iconColor="cyan.main"
              isLoading={loadingInsights}
              value={expenseInsights}
              onRefresh={fetchExpenseInsights}
              prompt="Compare recent spending by category and over time."
              loadingLabel="Analyzing spending..."
              loadingColor="primary"
              buttonLabel="Analyze patterns"
            />

            <AITextInsightCard
              title="Cash-flow forecast"
              icon={<FiTrendingUp size={15} />}
              iconColor="primary.main"
              isLoading={loadingForecast}
              value={forecast}
              onRefresh={fetchForecast}
              prompt="Estimate the next three months using your available financial data."
              loadingLabel="Preparing forecast..."
              loadingColor="primary"
              buttonLabel="Generate forecast"
            />

            <AITextInsightCard
              title="Savings suggestions"
              icon={<FiZap size={15} />}
              iconColor="success.main"
              isLoading={loadingSavings}
              value={savingOpportunities}
              onRefresh={fetchSavingOpportunities}
              prompt="Identify specific budget optimizations to maximize your monthly net surplus."
              loadingLabel="Preparing suggestions..."
              loadingColor="success"
              buttonLabel="View suggestions"
            />
          </Box>

          <Box sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <AssistantChatCard />
          </Box>
        </Box>
      </Box>

      {loadingCharts ? (
        <Skeleton
          variant="rectangular"
          height={300}
          sx={{ borderRadius: "12px" }}
        />
      ) : (
        (totalIncome > 0 || totalExpenses > 0) && (
          <AnalysisSheet
            trendData={trendData}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            categoryData={categoryData}
          />
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
