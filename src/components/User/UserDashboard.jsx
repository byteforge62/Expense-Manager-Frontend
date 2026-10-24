import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import axiosInstance from "../Utils/axiosInstance";

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
import { LazyMotion, m, domAnimation } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
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
  FiDollarSign,
  FiShield,
  FiInbox,
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
  "#06b6d4",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// --- SUB-COMPONENTS (ATOMIC UI) ---

/* ─── Metric Card ─── */
const MetricCard = memo(({ title, value, icon, color, bg, border, glow }) => (
  <Card
    component={m.div}
    whileHover={{ y: -4 }}
    sx={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 4,
      border: 1,
      borderColor: border || "divider",
      bgcolor: "background.paper",
      boxShadow: 2,
    }}
  >
    <Box
      sx={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 96,
        height: 96,
        borderRadius: "50%",
        filter: "blur(48px)",
        bgcolor: glow || "primary.main",
        opacity: 0.1,
      }}
    />
    <CardContent sx={{ p: 3 }}>
      <Avatar
        sx={{
          width: 40,
          height: 40,
          borderRadius: 3,
          bgcolor: bg || "action.hover",
          color: color || "primary.main",
          border: 1,
          borderColor: border || "divider",
          mb: 2,
        }}
      >
        {icon}
      </Avatar>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: "black", mt: 0.5, color: color }}
      >
        ₹{value.toLocaleString("en-IN")}
      </Typography>
    </CardContent>
  </Card>
));
MetricCard.displayName = "MetricCard";

/* ─── AI Card ─── */
const AICard = memo(
  ({
    title,
    icon,
    iconColor,
    iconBg,
    borderColor,
    children,
    isLoading,
    onRefresh,
  }) => (
    <Card
      sx={{
        borderRadius: 5,
        bgcolor: "background.paper",
        border: 1,
        borderColor: borderColor || "divider",
        boxShadow: 3,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: borderColor || "divider",
          bgcolor: "action.hover",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              borderRadius: 3,
              bgcolor: iconBg || "action.hover",
              color: iconColor || "primary.main",
              border: 1,
              borderColor: "divider",
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold", color: "text.primary" }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: "9px",
                fontWeight: "bold",
                tracking: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Automated Intelligence
            </Typography>
          </Box>
        </Stack>
        {onRefresh && (
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "cyan.main",
                bgcolor: "rgba(6, 182, 212, 0.1)",
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
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  ),
);
AICard.displayName = "AICard";

/* ─── AI Button ─── */
const AIButton = ({ onClick, label, color, icon = <FiZap size={14} /> }) => (
  <Button
  type="button"
    onClick={onClick}
    variant="contained"
    startIcon={icon}
    sx={{
      py: 1,
      px: 3,
      borderRadius: 3,
      fontWeight: "bold",
      textTransform: "none",
      boxShadow: 2,
      background:
        color === "bg-rose-500 text-white hover:bg-rose-600"
          ? "linear-gradient(to right, #f43f5e, #e11d48)"
          : color === "bg-violet-500 text-white hover:bg-violet-600"
            ? "linear-gradient(to right, #8b5cf6, #7c3aed)"
            : color === "bg-cyan-500 text-white hover:bg-cyan-600"
              ? "linear-gradient(to right, #06b6d4, #0891b2)"
              : color === "bg-blue-500 text-white hover:bg-blue-600"
                ? "linear-gradient(to right, #3b82f6, #2563eb)"
                : "linear-gradient(to right, #10b981, #059669)",
      color: "white",
    }}
  >
    {label}
  </Button>
);

/* ─── AI Result ─── */
const AIResult = ({ content }) => (
  <Box
    component={m.div}
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
        position: "absolute",
        top: 0,
        right: 0,
        width: 128,
        height: 128,
        bgcolor: "cyan.main",
        opacity: 0.05,
        filter: "blur(48px)",
        pointerEvents: "none",
      }}
    />
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
      {["a", "b", "c", "d"].map((id) => (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={id}>
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 4 }}
          />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      {["left", "right"].map((id) => (
        <Grid size={{ xs: 12, lg: 6 }} key={id}>
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
  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );
  const billsRef = useRef([]);
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
            res.data?.reply ||
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

  const fetchUpcomingRecurring = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/recurring/upcoming/${userId}`);
      setUpcomingRecurring(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  const fetchExpenseInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await axiosInstance.get(`/ai/expense-insights/${userId}`, {
        skipGlobalLoader: true,
      });
      setExpenseInsights(res.data.insights);
    } finally {
      setLoadingInsights(false);
    }
  };
  const fetchForecast = async () => {
    try {
      setLoadingForecast(true);
      const res = await axiosInstance.get(`/ai/financial-forecast/${userId}`, {
        skipGlobalLoader: true,
      });
      setForecast(res.data.forecast);
    } finally {
      setLoadingForecast(false);
    }
  };
  const fetchSavingOpportunities = async () => {
    try {
      setLoadingSavings(true);
      const res = await axiosInstance.get(
        `/ai/saving-opportunities/${userId}`,
        { skipGlobalLoader: true },
      );
      setSavingOpportunities(res.data.opportunities);
    } finally {
      setLoadingSavings(false);
    }
  };
  const fetchHealthScore = async () => {
    try {
      setLoadingHealth(true);
      const res = await axiosInstance.get(`/ai/financial-health/${userId}`, {
        skipGlobalLoader: true,
      });
      setHealthScore(res.data.healthScore);
    } finally {
      setLoadingHealth(false);
    }
  };
  const fetchRisk = async () => {
    try {
      setLoadingRisk(true);
      const res = await axiosInstance.get(`/ai/spending-risk/${userId}`, {
        skipGlobalLoader: true,
      });
      setRiskData(res.data.risk);
    } finally {
      setLoadingRisk(false);
    }
  };
  const fetchAllInsights = async () => {
    try {
      setLoadingHistory(true);
      const res = await axiosInstance.get(`/ai/insights/${userId}`, {
        skipGlobalLoader: true,
      });
      setAllInsights(res.data.insights);
    } finally {
      setLoadingHistory(false);
    }
  };

  // --- LIFECYCLE & INITIALIZATION ---

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchBudgetData(userId));
    dispatch(fetchIncomeData(userId));
    dispatch(fetchAllExpenses(userId));

    const fetchSecondaryData = async () => {
      try {
        setloadingSecondary(true);
        const billsRes = await Promise.all([
          axiosInstance.get(`/billByuserId/${userId}`)
        ]);
        billsRef.current = billsRes.data.data || [];
      } finally {
        setloadingSecondary(false);
        setloadingCharts(false);
      }
    };
    fetchSecondaryData();
    fetchUpcomingRecurring();
  }, [userId, dispatch, fetchUpcomingRecurring]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const totalBudget = (budget || []).reduce((a, i) => a + i.amount, 0);
  const totalIncome = (income || []).reduce((a, i) => a + i.amount, 0);
  const totalExpenses = (expenses || []).reduce((a, e) => a + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

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
    <LazyMotion features={domAnimation}>
      <Box
        component={m.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{ display: "flex", flexDirection: "column", gap: 5 }}
      >
        {/* ══ HEADER ══ */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "black",
                background:
                  "linear-gradient(to right, var(--text-primary), var(--text-secondary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Intelligence Hub
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                mt: 0.5,
                letterSpacing: "0.1em",
              }}
            >
              {currentDate}
            </Typography>
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 4,
              border: 1,
              borderColor:
                savingsRate >= 20
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(244, 63, 94, 0.2)",
              bgcolor:
                savingsRate >= 20
                  ? "rgba(16, 185, 129, 0.05)"
                  : "rgba(244, 63, 94, 0.05)",
              color: savingsRate >= 20 ? "success.main" : "error.main",
            }}
          >
            <FiActivity size={14} />
            <Typography
              variant="caption"
              sx={{ fontWeight: "black", letterSpacing: "0.1em" }}
            >
              EFFICIENCY: {savingsRate}%
            </Typography>
          </Stack>
        </Stack>

        {/* ══ METRIC CARDS ══ */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Total Budget"
              value={totalBudget}
              icon={<FiTarget size={18} />}
              color="cyan.main"
              bg="rgba(6, 182, 212, 0.1)"
              border="rgba(6, 182, 212, 0.2)"
              glow="cyan.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Total Income"
              value={totalIncome}
              icon={<FiTrendingUp size={18} />}
              color="success.main"
              bg="rgba(16, 185, 129, 0.1)"
              border="rgba(16, 185, 129, 0.2)"
              glow="success.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Total Expenses"
              value={totalExpenses}
              icon={<FiTrendingDown size={18} />}
              color="error.main"
              bg="rgba(244, 63, 94, 0.1)"
              border="rgba(244, 63, 94, 0.2)"
              glow="error.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                border: 1,
                borderColor:
                  netSavings >= 0
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(244, 63, 94, 0.2)",
                bgcolor:
                  netSavings >= 0
                    ? "rgba(59, 130, 246, 0.05)"
                    : "rgba(244, 63, 94, 0.05)",
                boxShadow: 2,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  filter: "blur(48px)",
                  bgcolor: netSavings >= 0 ? "primary.main" : "error.main",
                  opacity: 0.1,
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 3,
                      bgcolor:
                        netSavings >= 0
                          ? "rgba(59, 130, 246, 0.1)"
                          : "rgba(244, 63, 94, 0.1)",
                      color: netSavings >= 0 ? "primary.main" : "error.main",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <FiDollarSign size={18} />
                  </Avatar>
                  <Chip
                    label={netSavings >= 0 ? "Surplus" : "Deficit"}
                    size="small"
                    sx={{
                      fontSize: "9px",
                      fontWeight: "black",
                      textTransform: "uppercase",
                      color: netSavings >= 0 ? "success.main" : "error.main",
                      bgcolor:
                        netSavings >= 0
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(244, 63, 94, 0.1)",
                      border: 1,
                      borderColor: "divider",
                    }}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Liquidity Position
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "black",
                    mt: 0.5,
                    color: netSavings >= 0 ? "primary.main" : "error.main",
                  }}
                >
                  ₹{Math.abs(netSavings).toLocaleString("en-IN")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ══ AI ENGINE ══ */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AICard
              title="Spending Risk Analysis"
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
                    label="Scanning transactions..."
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
                      label={`${riskData.riskLevel} Criticality`}
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
                    Run the advanced risk engine to detect anomalies in your
                    spending patterns.
                  </Typography>
                  <AIButton
                    onClick={fetchRisk}
                    label="Initiate Scan"
                    color="bg-rose-500 text-white hover:bg-rose-600"
                  />
                </Stack>
              )}
            </AICard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <AICard
              title="Financial Health Quotient"
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
                    label="Calculating health score..."
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
                    Audit your wealth efficiency based on income vs outcome
                    ratios.
                  </Typography>
                  <AIButton
                    onClick={fetchHealthScore}
                    label="Compute Quotient"
                    color="bg-violet-500 text-white hover:bg-violet-600"
                  />
                </Stack>
              )}
            </AICard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <AICard
              title="Structural Insights"
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
                    label="Extracting patterns..."
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
                    Uncover hidden correlations and structural flaws in your
                    financial data.
                  </Typography>
                  <AIButton
                    onClick={fetchExpenseInsights}
                    label="Uncover Insights"
                    color="bg-cyan-500 text-white hover:bg-cyan-600"
                  />
                </Stack>
              )}
            </AICard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <AICard
              title="AI Predictive Projection"
              icon={<FiTrendingUp size={16} />}
              iconColor="primary.main"
              iconBg="rgba(59, 130, 246, 0.1)"
              borderColor="rgba(59, 130, 246, 0.15)"
              isLoading={loadingForecast}
              onRefresh={fetchForecast}
            >
              {loadingForecast ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <LoadingSpinner color="primary" label="Modeling future..." />
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
                    Generate a 3-month trajectory forecast using machine
                    learning models.
                  </Typography>
                  <AIButton
                    onClick={fetchForecast}
                    label="Render Forecast"
                    color="bg-blue-500 text-white hover:bg-blue-600"
                  />
                </Stack>
              )}
            </AICard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <AICard
              title="Optimization Protocol"
              icon={<FiZap size={16} />}
              iconColor="success.main"
              iconBg="rgba(16, 185, 129, 0.1)"
              borderColor="rgba(16, 185, 129, 0.15)"
              isLoading={loadingSavings}
              onRefresh={fetchSavingOpportunities}
            >
              {loadingSavings ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <LoadingSpinner
                    color="success"
                    label="Optimizing surplus..."
                  />
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
                    label="Run Optimization"
                    color="bg-emerald-500 text-white hover:bg-emerald-600"
                  />
                </Stack>
              )}
            </AICard>
          </Grid>

          {/* ── AI Chat Assistant ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <AICard
              title="Cognitive Assistant"
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
                      Awaiting telemetry...
                    </Typography>
                  </Stack>
                )}
                {messages.map((msg) => (
                  <Box key={`${msg.role}-${msg.text}`}>
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
                          component={m.div}
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
                  placeholder="Query financial state..."
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
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        Velocity Analytics
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
                        30-Day Outflow Trajectory
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
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
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
                        cursor={{
                          fill: "var(--surface-tertiary)",
                          opacity: 0.1,
                        }}
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
                          {categoryData.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={COLORS[i % COLORS.length]}
                            />
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
            <Grid
              container
              spacing={3}
              sx={{ position: "relative", zIndex: 1 }}
            >
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
                  Intelligence Log
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
                  Historical Telemetry
                </Typography>
              </Box>
            </Stack>
            {allInsights.length === 0 && !loadingHistory && (
              <Button
                type="button"
                size="small"
                onClick={fetchAllInsights}
                startIcon={<FiRefreshCw size={12} />}
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 3,
                }}
              >
                Sync Logs
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
                <FiInbox
                  style={{ color: "var(--mui-palette-text-secondary)" }}
                />
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
                  No active telemetry available
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxW: 280, mx: "auto", mt: 0.5 }}
                >
                  Trigger AI modules to populate your historical intelligence
                  ledger.
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Grid
              container
              spacing={3}
              sx={{ position: "relative", zIndex: 1 }}
            >
              {allInsights.map((item) => (
                <Grid size={{ xs: 12, md: 6 }} key={item._id}>
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
    </LazyMotion>
  );
};
