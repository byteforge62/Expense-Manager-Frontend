import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../Utils/axiosInstance";
import {
  fetchIncomeData,
  fetchRecurring,
} from "../../../redux/income/incomeSlice";
import { LazyMotion, m, AnimatePresence } from "framer-motion";
import { domAnimation } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FaPauseCircle, FaTrashAlt } from "react-icons/fa";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiRepeat,
  FiBarChart2,
  FiList,
  FiAlignLeft,
  FiZap,
  FiRefreshCw,
  FiPlus,
  FiChevronDown,
  FiX,
} from "react-icons/fi";

// ================ Material UI Components ================
import MuiDialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";


const Shimmer = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-[var(--surface-tertiary)] rounded-xl ${className}`}
  >
    <div
      className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                    bg-gradient-to-r from-transparent via-[var(--surface-primary)]/10 to-transparent"
    />
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: ₹{p.value?.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

const sourceConfig = {
  Salary: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Salary",
  },
  Freelancing: {
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    label: "Freelancing",
  },
  Investments: {
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    label: "Investments",
  },
  Other: {
    color: "text-[var(--text-muted)]",
    bg: "bg-[var(--surface-tertiary)] border-[var(--border)]",
    label: "Other",
  },
};

const Field = ({ label, error, children, icon }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10 transition-colors group-focus-within:text-cyan-500">
          {icon}
        </span>
      )}
      {children}
    </div>
    {error && (
      <p className="flex items-center gap-1.5 text-rose-500 text-[11px] font-medium animate-in fade-in slide-in-from-top-1 ml-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// --- CONFIG & UTILS ---
const inputCls =
  "w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 hover:bg-[var(--surface-tertiary)] transition-all duration-200 shadow-sm";
const selectCls =
  "w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 hover:bg-[var(--surface-tertiary)] transition-all duration-200 appearance-none shadow-sm cursor-pointer";

// --- MAIN COMPONENT ---
export const UserIncome = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { incomes, expenses, recurringPayments, loading } = useSelector(
    (state) => state.income,
  );

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("summary");
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
  });
  const [tips, setTips] = useState([]);
  const [monthlyIncomeExpense, setMonthlyIncomeExpense] = useState([]);
  const [monthlyIncomeTrend, setMonthlyIncomeTrend] = useState([]);
  const [avgIncome, setAvgIncome] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  
  const userId = user?._id;

  const [recurringForm, setRecurringForm] = useState({
    name: "",
    amount: "",
    frequency: "Monthly",
    startDate: "",
    category: "",
  });
  const [recurringLoading, setRecurringLoading] = useState(false);

  // --- ANALYTICS DERIVATION ---
  
  // Processes raw transaction data into human-readable analytics and chart data
  const computeAnalytics = (incomesData, expensesData) => {
    const totalIncome = incomesData.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expensesData.reduce((sum, e) => sum + e.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(2) : 0;

    setStats({ totalIncome, totalExpense, netSavings, savingsRate });

    const months = Array.from({ length: 12 }, () => ({
      income: 0,
      expense: 0,
    }));
    incomesData.forEach((inc) => {
      const date = new Date(inc.date);
      if (!isNaN(date)) {
        const m = date.getMonth();
        months[m].income += inc.amount;
      }
    });
    expensesData.forEach((exp) => {
      const date = new Date(exp.date);
      if (!isNaN(date)) {
        const m = date.getMonth();
        months[m].expense += exp.amount;
      }
    });

    const monthly = months.map((m, idx) => ({
      month: new Date(0, idx).toLocaleString("default", { month: "short" }),
      income: m.income,
      expense: m.expense,
    }));

    setMonthlyIncomeExpense(monthly);
    setMonthlyIncomeTrend(
      monthly.map((m) => ({ month: m.month, amount: m.income })),
    );
    setAvgIncome(months.reduce((a, b) => a + b.income, 0) / 12);

    // Generate AI-driven financial coaching tips based on savings rate
    let suggestedTips = [];
    if (savingsRate < 20) {
      suggestedTips = [
        "Your savings rate is below 20%. Consider auditing small recurring expenses.",
        "The 50/30/20 rule suggests 20% for savings. You're almost there!",
        "Try a 'no-spend' weekend once a month to boost your net savings.",
      ];
    } else if (savingsRate < 40) {
      suggestedTips = [
        "Excellent! Your savings rate is healthy. Consider an emergency fund.",
        "Automate your savings to move money before you have a chance to spend it.",
        "Review your investments; you have enough surplus to start compounding.",
      ];
    } else {
      suggestedTips = [
        "Super saver! You are building wealth rapidly. Keep it up!",
        "Look for tax-advantaged investment vehicles for your high surplus.",
        "Consider diversifying into low-risk assets to protect your gains.",
      ];
    }
    setTips(suggestedTips);
  };

  // --- ACTIONS & HANDLERS ---

  // Handle addition of a new income stream
  const onSubmitIncome = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post("/incomes", {
        ...data,
        amount: Number(data.amount),
      });
      if (res.status === 201) {
        setIsModalOpen(false);
        reset();
        dispatch(fetchIncomeData(userId));
      }
    } catch (error) {
      console.error("Failed to record income:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an income record from history
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/incomes/${id}`);
      dispatch(fetchIncomeData(userId));
    } catch (error) {
      console.error("Failed to remove record:", error);
    }
  };

  const handleRecurringChange = (e) =>
    setRecurringForm({ ...recurringForm, [e.target.name]: e.target.value });

  // Provision a new automated recurring payment
  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    try {
      setRecurringLoading(true);
      await axiosInstance.post("/recurring", { ...recurringForm, userId });
      setRecurringForm({
        name: "",
        amount: "",
        frequency: "Monthly",
        startDate: "",
        category: "",
      });
      dispatch(fetchRecurring(userId));
    } catch (error) {
      console.error("Automation setup failed:", error);
    } finally {
      setRecurringLoading(false);
    }
  };

  // Deactivate a recurring wealth stream
  const handleRecurringDelete = async (id) => {
    try {
      await axiosInstance.delete(`/recurring/${id}`);
      dispatch(fetchRecurring(userId));
    } catch (error) {
      console.error("Deactivation failed:", error);
    }
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    if (!userId) return;
    setValue("userID", userId);
    dispatch(fetchIncomeData(userId));
    dispatch(fetchRecurring(userId));
  }, [dispatch, userId, setValue]);

  useEffect(() => {
    if (!incomes.length && !expenses.length) return;
    computeAnalytics(incomes, expenses);
  }, [incomes, expenses]);

  const tabs = [
    { id: "summary", label: "Summary", icon: <FiAlignLeft size={14} /> },
    { id: "analytics", label: "Analytics", icon: <FiBarChart2 size={14} /> },
    { id: "records", label: "Records", icon: <FiList size={14} /> },
    { id: "recurring", label: "Recurring", icon: <FiRepeat size={14} /> },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-6 text-[var(--text-primary)]">
        {/* ── HEADER ── */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
            Income Center
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm font-medium">
            Analyze revenue streams, track trends, and manage recurring wealth.
          </p>
        </div>
        <button
        type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-bold text-white
                     shadow-lg shadow-cyan-500/20 hover:opacity-95 hover:-translate-y-0.5
                     transition-all duration-200 active:scale-95"
        >
          <FiPlus size={18} /> Add Income
        </button>
      </m.div>

      {/* ── PILL TABS ── */}
      <div className="flex items-center gap-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-2xl p-1.5 w-fit flex-wrap shadow-sm">
        {tabs.map((tab) => (
          <button
          type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200
              ${
                activeTab === tab.id
                  ? "bg-[var(--surface-primary)] border border-[var(--border)] text-cyan-500 shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Shimmer key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Shimmer className="h-64 rounded-2xl" />
        </div>
      )}

      {/* ── TAB CONTENT ── */}
      {!loading && (
        <AnimatePresence mode="wait">
          {activeTab === "summary" && (
            <m.div
              key="summary"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Wealth",
                    value: `₹${stats.totalIncome.toLocaleString("en-IN")}`,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/5",
                    border: "border-emerald-500/20",
                    glow: "bg-emerald-500",
                    icon: <FiTrendingUp size={18} />,
                  },
                  {
                    label: "Withdrawals",
                    value: `₹${stats.totalExpense.toLocaleString("en-IN")}`,
                    color: "text-rose-500",
                    bg: "bg-rose-500/5",
                    border: "border-rose-500/20",
                    glow: "bg-rose-500",
                    icon: <FiTrendingDown size={18} />,
                  },
                  {
                    label: "Net Surplus",
                    value: `₹${stats.netSavings.toLocaleString("en-IN")}`,
                    color: "text-cyan-500",
                    bg: "bg-cyan-500/5",
                    border: "border-cyan-500/20",
                    glow: "bg-cyan-500",
                    icon: <FiDollarSign size={18} />,
                  },
                  {
                    label: "Efficiency",
                    value: `${stats.savingsRate}%`,
                    color: "text-amber-500",
                    bg: "bg-amber-500/5",
                    border: "border-amber-500/20",
                    glow: "bg-amber-500",
                    icon: <FiPercent size={18} />,
                  },
                ].map((card, idx) => (
                  <m.div
                    key={card.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                    className={`relative overflow-hidden rounded-2xl border p-5 bg-[var(--surface-primary)] ${card.border} shadow-sm backdrop-blur-sm`}
                  >
                    <div
                      className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 ${card.glow}`}
                    />
                    <div className="relative">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.bg} border ${card.border} shadow-inner`}
                      >
                        <span className={card.color}>{card.icon}</span>
                      </div>
                      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                        {card.label}
                      </p>
                      <p
                        className={`text-2xl font-bold tracking-tight ${card.color}`}
                      >
                        {card.value}
                      </p>
                    </div>
                  </m.div>
                ))}
              </div>

              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-cyan-500/5 border border-cyan-500/10 p-6 shadow-xl relative overflow-hidden"
              >
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-500/5 blur-[80px]" />
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                    <FiZap size={18} className="text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Wealth Optimization Insights
                    </h3>
                    <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mt-0.5">
                      AI-Powered Recommendations
                    </p>
                  </div>
                </div>
                <ul className="space-y-4 relative z-10">
                  {tips.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-4 text-xs font-medium text-[var(--text-secondary)] leading-relaxed"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 mt-1 shadow-lg shadow-cyan-500/50" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </m.div>
            </m.div>
          )}

          {activeTab === "analytics" && (
            <m.div
              key="analytics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            >
              <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                    <FiBarChart2 size={14} className="text-blue-500" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Monthly Cash Flow
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyIncomeExpense} barSize={12}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "var(--surface-tertiary)", opacity: 0.1 }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-muted)",
                        paddingTop: 16,
                      }}
                    />
                    <Bar
                      dataKey="income"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      fill="#f43f5e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                    <FiTrendingUp size={14} className="text-cyan-500" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Income Projection & Baseline
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyIncomeTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine
                      y={avgIncome}
                      stroke="var(--text-muted)"
                      strokeDasharray="5 5"
                      label={{
                        value: `AVG ₹${Math.round(avgIncome / 1000)}K`,
                        position: "right",
                        fill: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#06b6d4",
                        strokeWidth: 2,
                        stroke: "var(--surface-primary)",
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </m.div>
          )}

          {activeTab === "records" && (
            <m.div
              key="records"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    Financial Records
                  </h3>
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {incomes.length} Entries
                  </span>
                </div>
                <button
                type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-secondary)]
                             border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]
                             hover:border-cyan-500/30 transition-all shadow-sm active:scale-95"
                >
                  <FiPlus size={14} className="text-cyan-500" /> NEW RECORD
                </button>
              </div>

              {incomes.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-24 text-center rounded-3xl border border-[var(--border)] bg-[var(--surface-secondary)]/20 shadow-inner">
                  <div className="w-16 h-16 rounded-3xl bg-[var(--surface-primary)] border border-[var(--border)] flex items-center justify-center shadow-lg">
                    <FiTrendingUp
                      size={32}
                      className="text-[var(--text-muted)] opacity-30"
                    />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    Income ledger is empty
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {incomes.map((income, idx) => {
                    const src =
                      sourceConfig[income.source] || sourceConfig.Other;
                    return (
                      <m.div
                        key={income._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        whileHover={{ y: -2 }}
                        className="group rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] p-6 shadow-xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rotate-45 translate-x-10 -translate-y-10" />
                        <div className="flex items-start justify-between relative z-10 mb-6">
                          <span
                            className={`inline-flex items-center gap-2 text-[10px] font-extrabold px-3 py-1.5 rounded-full border shadow-sm uppercase tracking-wider ${src.bg} ${src.color}`}
                          >
                            {income.source}
                          </span>
                          <button
                          type="button"
                            onClick={() => handleDelete(income._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-90 border border-transparent hover:border-rose-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="relative z-10">
                          <p
                            className={`text-3xl font-extrabold tracking-tight ${src.color}`}
                          >
                            ₹{income.amount.toLocaleString("en-IN")}
                          </p>
                          <p className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] mt-2 uppercase tracking-widest">
                            <FiCalendar size={12} className="text-cyan-500" />
                            {new Date(income.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </m.div>
                    );
                  })}
                </div>
              )}
            </m.div>
          )}

          {activeTab === "recurring" && (
            <m.div
              key="recurring"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                  <FiRepeat size={20} className="text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Wealth Management
                  </h2>
                  <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Configure recurring revenue & automation
                  </p>
                </div>
              </div>

              <m.form
                onSubmit={handleRecurringSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-[var(--surface-secondary)]/30 border border-[var(--border)] p-6 shadow-inner relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none" />
                <h3 className="text-xs font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2 uppercase tracking-widest">
                  <FiPlus size={14} className="text-cyan-500" />
                  PROVISION NEW AUTOMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Wealth description"
                    value={recurringForm.name}
                    onChange={handleRecurringChange}
                    className={inputCls}
                    required
                  />
                  <input
                    type="number"
                    name="amount"
                    placeholder="Revenue (₹)"
                    value={recurringForm.amount}
                    onChange={handleRecurringChange}
                    className={inputCls}
                    required
                  />
                  <div className="relative group">
                    <select
                      name="frequency"
                      value={recurringForm.frequency}
                      onChange={handleRecurringChange}
                      className={selectCls}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none group-focus-within:text-cyan-500" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    value={recurringForm.startDate}
                    onChange={handleRecurringChange}
                    className={inputCls}
                    required
                  />
                  <input
                    type="text"
                    name="category"
                    placeholder="Classification (LOB)"
                    value={recurringForm.category}
                    onChange={handleRecurringChange}
                    className={inputCls}
                  />
                  <button
                    type="submit"
                    disabled={recurringLoading}
                    className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl
                               bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-bold text-white
                               hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200 shadow-xl shadow-cyan-500/30
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {recurringLoading ? (
                      <>
                        <FiRefreshCw size={16} className="animate-spin" />{" "}
                        EXECUTING...
                      </>
                    ) : (
                      <>
                        <FiZap size={16} /> ACTIVATE TASK
                      </>
                    )}
                  </button>
                </div>
              </m.form>

              <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] overflow-hidden shadow-2xl">
                <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-secondary)]/50">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">
                    Active Revenue Operations
                  </h3>
                  <span className="text-[10px] font-extrabold text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20 uppercase tracking-widest">
                    {recurringPayments.length} RUNNING
                  </span>
                </div>

                {recurringPayments.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center opacity-30">
                      <FiRepeat size={24} />
                    </div>
                    <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      No active schedules
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]/30">
                            {[
                              "Description",
                              "Amount",
                              "Interval",
                              "Next Run",
                              "Actions",
                            ].map((h) => (
                              <th
                                key={h}
                                className="text-left px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {recurringPayments.map((pay, i) => (
                            <m.tr
                              key={pay._id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="hover:bg-[var(--surface-secondary)]/50 transition-colors"
                            >
                              <td className="px-6 py-5 font-bold text-[var(--text-primary)]">
                                {pay.name}
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-emerald-500 font-extrabold text-base">
                                  ₹{pay.amount.toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 uppercase tracking-widest">
                                  {pay.frequency}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider">
                                {new Date(pay.startDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <button
                                  type="button"
                                    onClick={() => alert("Logic coming soon")}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-amber-500/10 hover:text-amber-500 transition-all active:scale-90 border border-transparent hover:border-amber-500/20"
                                  >
                                    <FaPauseCircle size={15} />
                                  </button>
                                  <button
                                  type="button"
                                    onClick={() =>
                                      handleRecurringDelete(pay._id)
                                    }
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90 border border-transparent hover:border-rose-500/20"
                                  >
                                    <FaTrashAlt size={14} />
                                  </button>
                                </div>
                              </td>
                            </m.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="md:hidden divide-y divide-[var(--border)]">
                      {recurringPayments.map((pay) => (
                        <div
                          key={pay._id}
                          className="p-5 flex items-center justify-between group hover:bg-[var(--surface-secondary)]/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate uppercase tracking-wide">
                              {pay.name}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-emerald-500 text-sm font-extrabold">
                                ₹{pay.amount.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 uppercase">
                                {pay.frequency}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 relative z-10">
                            <button
                            type="button"
                              onClick={() => handleRecurringDelete(pay._id)}
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-500 bg-rose-500/5 border border-rose-500/10 active:scale-95 shadow-sm"
                            >
                              <FaTrashAlt size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      )}

      {/* ── ADD INCOME MODAL ── */}
      <MuiDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: "background.paper",
            backgroundImage: "none",
            border: 1,
            borderColor: "divider",
            boxShadow: 24,
            overflow: "hidden",
          },
        }}
      >
        <div className="flex items-center justify-between px-8 py-7 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-[1rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
              <FiTrendingUp size={20} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Wealth Creation
              </h2>
              <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                Record new liquidity
              </p>
            </div>
          </div>
          <IconButton
          aria-label="Close income dialog"
            onClick={() => setIsModalOpen(false)}
            size="small"
            sx={{ color: "text.secondary", border: 1, borderColor: "divider", borderRadius: 2 }}
          >
            <FiX size={18} />
          </IconButton>
        </div>

        <DialogContent sx={{ px: 4, py: 4 }}>
          <form
            onSubmit={handleSubmit(onSubmitIncome)}
            className="space-y-6"
          >
            <Field
              label="Amount (INR)"
              error={errors.amount?.message}
              icon={<FiDollarSign size={16} />}
            >
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { required: "Required" })}
                className={inputCls + " pl-10"}
              />
            </Field>

            <Field
              label="Source Channel"
              error={errors.source?.message}
              icon={<FiList size={16} />}
            >
              <div className="relative group">
                <select
                  {...register("source", { required: "Required" })}
                  className={selectCls + " pl-10"}
                >
                  <option value="">Select channel</option>
                  <option value="Salary">Salary</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Investments">Investments</option>
                  <option value="Other">Other</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none transition-colors group-focus-within:text-cyan-500" />
              </div>
            </Field>

            <Field
              label="Value Date"
              error={errors.date?.message}
              icon={<FiCalendar size={16} />}
            >
              <input
                type="date"
                {...register("date", { required: "Required" })}
                className={inputCls + " pl-10"}
              />
            </Field>

            <input type="hidden" {...register("userID")} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600
                         font-extrabold text-sm text-white shadow-2xl shadow-cyan-500/40
                         hover:opacity-95 hover:-translate-y-1 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
                         flex items-center justify-center gap-3 mt-4"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={16} sx={{ color: "white" }} />{" "}
                  COMMITTING...
                </>
              ) : (
                <>
                  <FiPlus size={20} /> AUTHORIZE ENTRY
                </>
              )}
            </button>
          </form>
        </DialogContent>
      </MuiDialog>
    </div>
    </LazyMotion>
  );
};

