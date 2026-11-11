import { useEffect, useState, useRef, useMemo, memo } from "react";
import ReactMarkdown from "react-markdown";
import axiosInstance from "../Utils/axiosInstance";

/**
 * --- INTELLIGENCE HUB (USER DASHBOARD) ---
 * The central nervous system of the application.
 * Combines traditional financial metrics with AI-driven insights,
 * real-time forecasting, and a cognitive chat assistant.
 */

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { fetchBudgetData } from "../../redux/budget/budgetSlice";
import { fetchIncomeData } from "../../redux/income/incomeSlice";
import { fetchAllExpenses } from "../../redux/expense/expenseSlice";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiZap,
  FiAlertTriangle,
  FiBarChart2,
  FiPieChart,
  FiRepeat,
  FiSend,
  FiCpu,
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiActivity,
  FiShield,
  FiInbox,
  FiPlus,
  FiArrowUpRight,
} from "react-icons/fi";
import LoadingSpinner from "../Common/LoadingSpinner";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";

const COLORS = [
  "#3985ff",
  "#45b889",
  "#e8b66b",
  "#f07870",
  "#a9c8f5",
  "#8297b7",
  "#4d74ad",
];

// --- SUB-COMPONENTS (ATOMIC UI) ---

/* ─── AI Card ─── */
const AICard = memo(
  ({
    title,
    icon,
    iconColor,
    iconBg,
    children,
    isLoading,
    onRefresh,
  }) => (
    <Card
      sx={{
        borderRadius: 4,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        boxShadow: "0 8px 26px rgba(26, 39, 57, 0.045)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 34px rgba(26, 39, 57, 0.085)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 3,
          py: 2.25,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "transparent",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: iconBg || "action.hover",
              color: iconColor || "primary.main",
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {title}
            </Typography>
          </Box>
        </Stack>
        {onRefresh && (
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label={`Refresh ${title}`}
            sx={{
              color: "text.secondary",
              border: 1,
              borderColor: "divider",
              width: 34,
              height: 34,
              "&:hover": {
                color: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <FiRefreshCw
              className={isLoading ? "animate-spin" : ""}
              size={14}
            />
          </IconButton>
        )}
      </Stack>
      <CardContent sx={{ p: 3, minHeight: 132, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {children}
      </CardContent>
    </Card>
  ),
);
AICard.displayName = "AICard";

/* ─── AI Button ─── */
const AIButton = ({ onClick, label, color, icon = <FiZap size={14} /> }) => (
  <Button
    onClick={onClick}
    variant="contained"
    startIcon={icon}
    sx={{
      py: 1,
      px: 2.25,
      borderRadius: 2.5,
      fontWeight: 700,
      textTransform: "none",
      boxShadow: "none",
      backgroundColor:
        color === "bg-rose-500 text-white hover:bg-rose-600"
          ? "#f07870"
          : color === "bg-violet-500 text-white hover:bg-violet-600"
            ? "#3985ff"
            : color === "bg-cyan-500 text-white hover:bg-cyan-600"
              ? "#3985ff"
              : color === "bg-blue-500 text-white hover:bg-blue-600"
                ? "#3985ff"
                : "#45b889",
      color: "#fff",
      "&:hover": { filter: "brightness(1.08)", boxShadow: "none" },
    }}
  >
    {label}
  </Button>
);

/* ─── AI Result ─── */
const AIResult = ({ content }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    sx={{
      p: 2.5,
      borderRadius: 4,
      bgcolor: "action.hover",
      border: 1,
      borderColor: "divider",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        color: "text.secondary",
        fontSize: "0.85rem",
        lineHeight: 1.6,
        "& strong": { color: "cyan.main", fontWeight: "bold" },
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  </Box>
);

/* ─── Tooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          textTransform: "uppercase",
          tracking: "0.05em",
          fontWeight: "bold",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "extrabold", mt: 0.5 }}>
        ₹{payload[0].value?.toLocaleString("en-IN")}
      </Typography>
    </Paper>
  );
};

/* ─── Dashboard Skeleton ─── */
const DashboardSkeleton = () => (
  <Stack spacing={4}>
    <Stack direction="row" justifyContent="space-between" alignItems="end">
      <Stack spacing={1} sx={{ width: "40%" }}>
        <Skeleton variant="text" height={40} width="60%" />
        <Skeleton variant="text" height={20} width="40%" />
      </Stack>
      <Skeleton
        variant="rectangular"
        width={140}
        height={40}
        sx={{ borderRadius: 3 }}
      />
    </Stack>
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 4 }}
          />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      {[1, 2].map((i) => (
        <Grid size={{ xs: 12, lg: 6 }} key={i}>
          <Skeleton
            variant="rectangular"
            height={240}
            sx={{ borderRadius: 4 }}
          />
        </Grid>
      ))}
    </Grid>
  </Stack>
);

// --- MAIN DASHBOARD COMPONENT ---

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
  const chatEndRef = useRef(null);

  const [expenseInsights, setExpenseInsights] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [forecast, setForecast] = useState("");
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [upcomingRecurring, setUpcomingRecurring] = useState([]);
  const [savingOpportunities, setSavingOpportunities] = useState("");
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [healthScore, setHealthScore] = useState("");
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [allInsights, setAllInsights] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCharts, setloadingCharts] = useState(true);
  const [loadingSecondary, setloadingSecondary] = useState(true);

  // --- AI MODULES: DATA FETCHING ---

  // Cognitive Chat: Send a manual query to the AI
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    try {
      setLoadingAI(true);
      const res = await axiosInstance.post("/ai/ask", { message: input });
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            res.data?.data?.reply ||
            "I encountered an error processing your request.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Communication failed. Please check your network.",
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const riskColors = {
    High: {
      border: "rgba(244, 63, 94, 0.3)",
      bg: "rgba(244, 63, 94, 0.05)",
      text: "error.main",
      badge: "rgba(244, 63, 94, 0.1)",
    },
    Medium: {
      border: "rgba(245, 158, 11, 0.3)",
      bg: "rgba(245, 158, 11, 0.05)",
      text: "warning.main",
      badge: "rgba(245, 158, 11, 0.1)",
    },
    Low: {
      border: "rgba(16, 185, 129, 0.3)",
      bg: "rgba(16, 185, 129, 0.05)",
      text: "success.main",
      badge: "rgba(16, 185, 129, 0.1)",
    },
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2.5}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: "0.14em" }}
          >
            FINANCIAL WORKSPACE
          </Typography>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 750, letterSpacing: "-0.045em", mt: 0.25 }}>
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}A clear view of your money, all in one place.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button
            component={RouterLink}
            to="/private/income"
            variant="contained"
            startIcon={<FiPlus />}
            sx={{
              px: 2.25,
              py: 1.15,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "0 8px 18px rgba(57, 133, 255, 0.2)",
            }}
          >
            Add income
          </Button>
          <Button
            component={RouterLink}
            to="/private/expenses"
            variant="outlined"
            startIcon={<FiPlus />}
            sx={{
              px: 2.25,
              py: 1.15,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            Add expense
          </Button>
        </Stack>
      </Stack>

      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          border: "1px solid rgba(123, 164, 230, 0.22)",
          background:
            "radial-gradient(circle at 85% 12%, rgba(95, 151, 255, 0.22), transparent 30%), linear-gradient(116deg, #151d2a 0%, #1c2b41 56%, #263f64 100%)",
          color: "#f5f8ff",
          boxShadow: "0 22px 48px rgba(25, 42, 66, 0.16)",
          "&::after": {
            content: '""',
            position: "absolute",
            width: 280,
            height: 280,
            right: -120,
            bottom: -180,
            borderRadius: "50%",
            border: "1px solid rgba(194, 216, 255, 0.15)",
            boxShadow: "0 0 0 28px rgba(194, 216, 255, 0.025), 0 0 0 58px rgba(194, 216, 255, 0.02)",
            pointerEvents: "none",
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1, p: { xs: 2.5, sm: 4 } }}>
          <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#8bc2ff", boxShadow: "0 0 0 5px rgba(139, 194, 255, 0.13)" }} />
                <Typography variant="overline" sx={{ color: "#b9d5ff", fontWeight: 700, letterSpacing: "0.13em" }}>
                  YOUR FINANCIAL SNAPSHOT
                </Typography>
              </Stack>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 600, letterSpacing: "-0.025em" }}>
                Your money, in focus.
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(235, 242, 255, 0.68)", mt: 0.75, maxWidth: 430, lineHeight: 1.7 }}>
                A thoughtful overview of income, spending and the plans you’re building.
              </Typography>

              <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                <Typography variant="caption" sx={{ color: "rgba(235, 242, 255, 0.65)", fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" }}>
                  Net cash flow
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color: hasActivity ? (netSavings >= 0 ? "#a9d8c3" : "#ffaaa4") : "#f5f8ff",
                    fontWeight: 700,
                    letterSpacing: "-0.055em",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: { xs: "2.5rem", sm: "3.2rem" },
                    mt: 0.5,
                  }}
                >
                  {hasActivity ? `${netSavings < 0 ? "−" : ""}${formatCurrency(Math.abs(netSavings))}` : "—"}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(235, 242, 255, 0.62)", mt: 0.75 }}>
                  {hasActivity
                    ? `${formatCurrency(totalIncome)} income · ${formatCurrency(totalExpenses)} expenses`
                    : "Record your first transaction to see your cash flow here."}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                role={hasActivity ? "img" : undefined}
                aria-label={hasActivity ? `Recorded cash flow: income ${formatCurrency(totalIncome)}, expenses ${formatCurrency(totalExpenses)}` : undefined}
                sx={{
                  p: { xs: 2.25, sm: 2.75 },
                  borderRadius: 3,
                  border: "1px solid rgba(226, 237, 255, 0.12)",
                  bgcolor: "rgba(9, 17, 29, 0.24)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.25 }}>
                  <Typography variant="subtitle2" sx={{ color: "#f5f8ff", fontWeight: 700 }}>
                    Cash flow
                  </Typography>
                  {hasActivity && (
                    <Chip
                      size="small"
                      icon={<FiActivity size={13} />}
                      label={`${savingsRate}% saved`}
                      sx={{
                        height: 27,
                        color: "#c4e7d4",
                        bgcolor: "rgba(94, 183, 135, 0.12)",
                        border: "1px solid rgba(146, 218, 180, 0.2)",
                        "& .MuiChip-icon": { color: "inherit", ml: 1 },
                        "& .MuiChip-label": { px: 1, fontSize: 11, fontWeight: 700 },
                      }}
                    />
                  )}
                </Stack>
                {hasActivity ? (
                  <Stack spacing={2}>
                    {[
                      { label: "Income", value: totalIncome, color: "#70d5aa" },
                      { label: "Expenses", value: totalExpenses, color: "#ff9289" },
                    ].map((item) => (
                      <Box key={item.label}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                          <Typography variant="caption" sx={{ color: "rgba(235, 242, 255, 0.72)", fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#f5f8ff", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                            {formatCurrency(item.value)}
                          </Typography>
                        </Stack>
                        <Box sx={{ height: 7, borderRadius: 99, bgcolor: "rgba(238, 244, 255, 0.09)", overflow: "hidden" }}>
                          <Box
                            sx={{
                              width: `${item.value > 0 ? Math.max((item.value / Math.max(totalIncome, totalExpenses)) * 100, 4) : 0}%`,
                              height: "100%",
                              borderRadius: "inherit",
                              bgcolor: item.color,
                              transition: "width 300ms ease",
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                    <Typography variant="caption" sx={{ color: "rgba(235, 242, 255, 0.46)", pt: 0.25 }}>
                      Totals across your recorded transactions
                    </Typography>
                  </Stack>
                ) : (
                  <Box sx={{ py: 1.5 }}>
                    <Box aria-hidden="true" sx={{ display: "flex", alignItems: "flex-end", gap: 0.75, height: 38, mb: 1.5 }}>
                      {[18, 30, 23, 38, 27, 34, 22].map((height, index) => (
                        <Box key={index} sx={{ flex: 1, height, borderRadius: "4px 4px 2px 2px", bgcolor: "rgba(170, 202, 255, 0.22)" }} />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: "rgba(235, 242, 255, 0.75)", lineHeight: 1.6 }}>
                      Your cash-flow view will take shape as you add activity.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
        <Grid size={{ xs: 12, md: 6 }}>
          <AICard
            title="Spending risk"
            icon={<FiAlertTriangle size={15} />}
            iconColor="error.main"
            iconBg="rgba(244, 63, 94, 0.1)"
            borderColor="rgba(244, 63, 94, 0.15)"
            isLoading={loadingRisk}
            onRefresh={fetchRisk}
          >
            {loadingRisk ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <LoadingSpinner
                  color="error"
                  label="Reviewing transactions..."
                />
              </Box>
            ) : riskData ? (
              <Box
                sx={{
                  borderRadius: 4,
                  p: 3,
                  border: 1,
                  borderColor: riskColors[riskData.riskLevel]?.border,
                  bgcolor: riskColors[riskData.riskLevel]?.bg,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      color: "text.primary",
                    }}
                  >
                    Behavior Assessment
                  </Typography>
                  <Chip
                    label={`Risk: ${riskData.riskLevel}`}
                    size="small"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "10px",
                      bgcolor: riskColors[riskData.riskLevel]?.badge,
                      color: riskColors[riskData.riskLevel]?.text,
                    }}
                  />
                </Stack>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                      }}
                    >
                      Observation Category
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {riskData.category}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                      }}
                    >
                      Detective Logic
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", lineHeight: 1.5 }}
                    >
                      {riskData.reason}
                    </Typography>
                  </Box>
                  <Box sx={{ pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: riskColors[riskData.riskLevel]?.text,
                      }}
                    >
                      ✨ {riskData.suggestion}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Stack
                alignItems="center"
                textAlign="center"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxW: "80%" }}
                >
                  Review recent activity for unusual spending patterns.
                </Typography>
                <AIButton
                  onClick={fetchRisk}
                  label="Review spending"
                  color="bg-rose-500 text-white hover:bg-rose-600"
                />
              </Stack>
            )}
          </AICard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AICard
            title="Financial health"
            icon={<FiShield size={16} />}
            iconColor="secondary.main"
            iconBg="rgba(139, 92, 246, 0.1)"
            borderColor="rgba(139, 92, 246, 0.15)"
            isLoading={loadingHealth}
            onRefresh={fetchHealthScore}
          >
            {loadingHealth ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <LoadingSpinner
                  color="secondary"
                  label="Reviewing financial health..."
                />
              </Box>
            ) : healthScore ? (
              <AIResult content={healthScore} />
            ) : (
              <Stack
                alignItems="center"
                textAlign="center"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxW: "80%" }}
                >
                  Review your income, expenses, and available budget data.
                </Typography>
                <AIButton
                  onClick={fetchHealthScore}
                  label="Check health"
                  color="bg-violet-500 text-white hover:bg-violet-600"
                />
              </Stack>
            )}
          </AICard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AICard
            title="Spending patterns"
            icon={<FiBarChart2 size={16} />}
            iconColor="cyan.main"
            iconBg="rgba(6, 182, 212, 0.1)"
            borderColor="rgba(6, 182, 212, 0.15)"
            isLoading={loadingInsights}
            onRefresh={fetchExpenseInsights}
          >
            {loadingInsights ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <LoadingSpinner
                  color="primary"
                  label="Analyzing spending..."
                />
              </Box>
            ) : expenseInsights ? (
              <AIResult content={expenseInsights} />
            ) : (
              <Stack
                alignItems="center"
                textAlign="center"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxW: "80%" }}
                >
                  Compare recent spending by category and over time.
                </Typography>
                <AIButton
                  onClick={fetchExpenseInsights}
                  label="Analyze patterns"
                  color="bg-cyan-500 text-white hover:bg-cyan-600"
                />
              </Stack>
            )}
          </AICard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AICard
            title="Cash-flow forecast"
            icon={<FiTrendingUp size={16} />}
            iconColor="primary.main"
            iconBg="rgba(59, 130, 246, 0.1)"
            borderColor="rgba(59, 130, 246, 0.15)"
            isLoading={loadingForecast}
            onRefresh={fetchForecast}
          >
            {loadingForecast ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <LoadingSpinner color="primary" label="Preparing forecast..." />
              </Box>
            ) : forecast ? (
              <AIResult content={forecast} />
            ) : (
              <Stack
                alignItems="center"
                textAlign="center"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxW: "80%" }}
                >
                  Estimate the next three months using your available financial data.
                </Typography>
                <AIButton
                  onClick={fetchForecast}
                  label="Generate forecast"
                  color="bg-blue-500 text-white hover:bg-blue-600"
                />
              </Stack>
            )}
          </AICard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AICard
            title="Savings suggestions"
            icon={<FiZap size={16} />}
            iconColor="success.main"
            iconBg="rgba(16, 185, 129, 0.1)"
            borderColor="rgba(16, 185, 129, 0.15)"
            isLoading={loadingSavings}
            onRefresh={fetchSavingOpportunities}
          >
            {loadingSavings ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <LoadingSpinner color="success" label="Preparing suggestions..." />
              </Box>
            ) : savingOpportunities ? (
              <AIResult content={savingOpportunities} />
            ) : (
              <Stack
                alignItems="center"
                textAlign="center"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxW: "80%" }}
                >
                  Identify specific budget optimizations to maximize your
                  monthly net surplus.
                </Typography>
                <AIButton
                  onClick={fetchSavingOpportunities}
                  label="View suggestions"
                  color="bg-emerald-500 text-white hover:bg-emerald-600"
                />
              </Stack>
            )}
          </AICard>
        </Grid>

        {/* ── AI Chat Assistant ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AICard
            title="Financial assistant"
            icon={<FiCpu size={16} />}
            iconColor="warning.main"
            iconBg="rgba(245, 158, 11, 0.1)"
            borderColor="rgba(245, 158, 11, 0.15)"
          >
            <Box
              sx={{
                height: 260,
                overflowY: "auto",
                mb: 2,
                pr: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {messages.length === 0 && (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{ height: "100%", opacity: 0.6 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "action.hover",
                      border: 1,
                      borderColor: "divider",
                      width: 48,
                      height: 48,
                      mb: 1,
                    }}
                  >
                    <FiInbox
                      style={{ color: "var(--mui-palette-text-secondary)" }}
                    />
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    No conversation yet
                  </Typography>
                </Stack>
              )}
              {messages.map((msg, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxW: "85%",
                      px: 2,
                      py: 1.5,
                      borderRadius: 4,
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      boxShadow: 1,
                      bgcolor:
                        msg.role === "user" ? "cyan.main" : "action.hover",
                      color: msg.role === "user" ? "white" : "text.primary",
                      border: 1,
                      borderColor: "divider",
                      borderBottomRightRadius: msg.role === "user" ? 1 : 4,
                      borderBottomLeftRadius: msg.role === "ai" ? 1 : 4,
                    }}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </Box>
                </Box>
              ))}
              {loadingAI && (
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Box
                    sx={{
                      bgcolor: "action.hover",
                      border: 1,
                      borderColor: "divider",
                      px: 2,
                      py: 1.5,
                      borderRadius: 4,
                      borderBottomLeftRadius: 1,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    {[0, 150, 300].map((delay) => (
                      <Box
                        key={delay}
                        component={motion.div}
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: delay / 1000,
                        }}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "cyan.main",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              <div ref={chatEndRef} />
            </Box>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask a question about your finances…"
                slotProps={{
                  input: {
                    sx: { borderRadius: 3, fontSize: "0.8rem" },
                  },
                }}
              />
              <IconButton
                color="warning"
                onClick={sendMessage}
                disabled={loadingAI || !input.trim()}
                sx={{
                  bgcolor: "orange.main",
                  color: "white",
                  borderRadius: 3,
                  width: 40,
                  height: 40,
                  background: "linear-gradient(to right, #f59e0b, #ea580c)",
                  "&:disabled": { opacity: 0.4, color: "white" },
                }}
              >
                <FiSend size={16} />
              </IconButton>
            </Stack>
          </AICard>
        </Grid>
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
            {/* Spending Trend Line Chart */}
            <Grid size={12}>
              <Card
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 6,
                  p: 4,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: 3,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 256,
                    height: 256,
                    bgcolor: "error.main",
                    opacity: 0.03,
                    filter: "blur(96px)",
                  }}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 4, position: "relative", zIndex: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(244, 63, 94, 0.1)",
                      border: 1,
                      borderColor: "rgba(244, 63, 94, 0.2)",
                      color: "error.main",
                      borderRadius: 3,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <FiTrendingDown size={16} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Spending trend
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Expenses over the last 30 days
                    </Typography>
                  </Box>
                </Stack>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#f43f5e"
                      strokeWidth={4}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Cash Equilibrium */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 6,
                  p: 4,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: 3,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 192,
                    height: 192,
                    bgcolor: "primary.main",
                    opacity: 0.03,
                    filter: "blur(80px)",
                  }}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 4, position: "relative", zIndex: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(59, 130, 246, 0.1)",
                      border: 1,
                      borderColor: "rgba(59, 130, 246, 0.2)",
                      color: "primary.main",
                      borderRadius: 3,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <FiBarChart2 size={16} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Cash Equilibrium
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Aggregate Flow Comparison
                    </Typography>
                  </Box>
                </Stack>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={[
                      { name: "INFLOW", amount: totalIncome },
                      { name: "OUTFLOW", amount: totalExpenses },
                    ]}
                    barSize={52}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "var(--surface-tertiary)", opacity: 0.1 }}
                    />
                    <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Disbursement Profile */}
            {categoryData.length > 0 && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 6,
                    p: 4,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: 3,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 192,
                      height: 192,
                      bgcolor: "cyan.main",
                      opacity: 0.03,
                      filter: "blur(80px)",
                    }}
                  />
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 4, position: "relative", zIndex: 1 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "rgba(6, 182, 212, 0.1)",
                        border: 1,
                        borderColor: "rgba(6, 182, 212, 0.2)",
                        color: "cyan.main",
                        borderRadius: 3,
                        width: 40,
                        height: 40,
                      }}
                    >
                      <FiPieChart size={16} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        Disbursement Profile
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Sector Allocation
                      </Typography>
                    </Box>
                  </Stack>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        outerRadius={90}
                        innerRadius={55}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--text-muted)",
                          paddingTop: 20,
                        }}
                      />
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            )}
          </Grid>
        )
      )}

      {/* ══ RECURRING OPERATIONS ══ */}
      {!loadingSecondary && upcomingRecurring.length > 0 && (
        <Card
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 6,
            p: 4,
            position: "relative",
            overflow: "hidden",
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 256,
              height: 256,
              bgcolor: "warning.main",
              opacity: 0.03,
              filter: "blur(96px)",
            }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4, position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: "rgba(245, 158, 11, 0.1)",
                  border: 1,
                  borderColor: "rgba(245, 158, 11, 0.2)",
                  color: "warning.main",
                  borderRadius: 3,
                  width: 40,
                  height: 40,
                }}
              >
                <FiRepeat size={16} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Pending Executions
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Upcoming Automated Events
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={`${upcomingRecurring.length} Scheduled`}
              size="small"
              sx={{
                fontWeight: "black",
                textTransform: "uppercase",
                fontSize: "10px",
                bgcolor: "rgba(245, 158, 11, 0.1)",
                color: "warning.main",
                border: 1,
                borderColor: "divider",
              }}
            />
          </Stack>
          <Grid container spacing={3} sx={{ position: "relative", zIndex: 1 }}>
            {upcomingRecurring.map((item) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item._id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2.5,
                    borderRadius: 4,
                    bgcolor: "action.hover",
                    border: 1,
                    borderColor: "divider",
                    borderStyle: "dashed",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: "background.paper",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 3,
                        width: 36,
                        height: 36,
                      }}
                    >
                      <FiCalendar
                        size={14}
                        style={{ color: "var(--mui-palette-warning-main)" }}
                      />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          display: "block",
                          textTransform: "uppercase",
                          maxWidth: 120,
                        }}
                        noWrap
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <FiClock size={10} />
                        {new Date(item.nextDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "black", color: "error.main" }}
                  >
                    ₹{item.amount.toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* ══ CHRONOLOGICAL INSIGHTS ══ */}
      <Card
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 6,
          p: 4,
          position: "relative",
          overflow: "hidden",
          boxShadow: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4, position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "rgba(6, 182, 212, 0.1)",
                border: 1,
                borderColor: "rgba(6, 182, 212, 0.2)",
                color: "cyan.main",
                borderRadius: 3,
                width: 40,
                height: 40,
              }}
            >
              <FiCpu size={16} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Recent insights
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Analysis history
              </Typography>
            </Box>
          </Stack>
          {allInsights.length === 0 && !loadingHistory && (
            <Button
              size="small"
              onClick={fetchAllInsights}
              startIcon={<FiRefreshCw size={12} />}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 3,
              }}
            >
              Refresh history
            </Button>
          )}
        </Stack>

        {loadingHistory ? (
          <Stack spacing={2}>
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 4 }}
            />
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 4 }}
            />
          </Stack>
        ) : !allInsights || allInsights.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ py: 6, opacity: 0.6 }}
          >
            <Avatar
              sx={{
                bgcolor: "action.hover",
                border: 1,
                borderColor: "divider",
                width: 48,
                height: 48,
              }}
            >
              <FiInbox style={{ color: "var(--mui-palette-text-secondary)" }} />
            </Avatar>
            <Box textAlign="center">
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                No saved insights yet
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxW: 280, mx: "auto", mt: 0.5 }}
              >
                Results from your analyses will appear here.
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Grid container spacing={3} sx={{ position: "relative", zIndex: 1 }}>
            {allInsights.map((item, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={item._id || index}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2">
                    {item.content || JSON.stringify(item)}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>
    </Box>
  );
};
