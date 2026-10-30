import { useState, useEffect } from "react";
import axiosInstance from "../../Utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBudgetPlan,
  fetchBudgetData,
  fetchCategories,
} from "../../../redux/budget/budgetSlice";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  FiTarget,
  FiTrendingDown,
  FiDollarSign,
  FiGrid,
  FiPieChart,
  FiCpu,
  FiSettings,
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiZap,
  FiRefreshCw,
  FiTag,
  FiAlignLeft,
  FiX,
} from "react-icons/fi";

// ================ Material UI Components ================
import MuiDialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * --- BUDGET CENTER ---
 * The central command for financial planning and allocation.
 * Features: Overview, AI-driven Planning, Analytics, and Budget Management.
 */

// --- ATOMIC UI & SHARED COMPONENTS ---

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
        <p
          key={p.name}
          className="text-sm font-bold"
          style={{ color: p.color }}
        >
          {p.name}: ₹{p.value?.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

const BudgetProgress = ({ pct }) => {
  const color =
    pct >= 90
      ? "from-rose-500 to-red-600"
      : pct >= 70
        ? "from-amber-400 to-orange-500"
        : "from-emerald-400 to-teal-500";
  return (
    <div className="h-2 rounded-full bg-[var(--surface-tertiary)] overflow-hidden shadow-inner">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${color} shadow-lg`}
      />
    </div>
  );
};

const Field = ({ label, icon, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10 transition-colors group-focus-within:text-emerald-500">
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
  "w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 hover:bg-[var(--surface-tertiary)] transition-all duration-200 shadow-sm";
const selectCls =
  "w-full pl-10 pr-10 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 hover:bg-[var(--surface-tertiary)] transition-all duration-200 appearance-none shadow-sm cursor-pointer";

const COLORS = [
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
  "#8b5cf6",
];

// --- MAIN COMPONENT ---
export const UserBudget = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { budgets, summary, categories, budgetPlan } = useSelector(
    (state) => state.budget,
  );
  const userId = user?._id ?? null;

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newBudget, setNewBudget] = useState({
    categoryID: "",
    amount: "",
    description: "",
  });

  // --- ACTIONS & HANDLERS ---

  // Generate an AI-optimized budget plan based on historical data
  const handleGeneratePlan = async () => {
    try {
      setLoadingPlan(true);
      await dispatch(fetchBudgetPlan(userId));
    } finally {
      setLoadingPlan(false);
    }
  };

  // Persist a new budget limit to the database
  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setIsSubmitting(true);
      await axiosInstance.post("/budget", {
        ...newBudget,
        amount: Number(newBudget.amount),
      });
      setIsModalOpen(false);
      setNewBudget({ categoryID: "", amount: "", description: "" });
      dispatch(fetchBudgetData(userId));
    } catch (error) {
      console.error("Add budget error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove a budget limit from the registry
  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/budget/${selectedBudget._id}`);
      setConfirmDeleteOpen(false);
      setSelectedBudget(null);
      dispatch(fetchBudgetData(userId));
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchCategories());
    dispatch(fetchBudgetData(userId));
  }, [dispatch, userId]);

  // --- ANALYTICS DERIVATION ---
  const totalAllocated = summary.reduce((s, i) => s + i.allocated, 0);
  const totalSpent = summary.reduce((s, i) => s + i.spent, 0);
  const totalRemaining = summary.reduce((s, i) => s + i.remaining, 0);
  const overBudgetCount = summary.filter((i) => i.spent > i.allocated).length;

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiGrid size={14} /> },
    { id: "analytics", label: "Analytics", icon: <FiPieChart size={14} /> },
    { id: "ai planner", label: "AI Planner", icon: <FiCpu size={14} /> },
    { id: "manage", label: "Manage", icon: <FiSettings size={14} /> },
  ];

  // --- INITIAL LOADING STATE ---
  if (!userId) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Shimmer className="h-8 w-48" />
          <Shimmer className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
            Budget Center
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm font-medium">
            Plan, track, and optimize your spending by category.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-bold text-white
                     shadow-lg shadow-emerald-500/20 hover:opacity-95 hover:-translate-y-0.5
                     transition-all duration-200 active:scale-95"
        >
          <FiPlus size={18} /> Add Budget
        </button>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Allocated",
            value: `₹${totalAllocated.toLocaleString("en-IN")}`,
            color: "text-cyan-500",
            bg: "bg-cyan-500/5",
            border: "border-cyan-500/20",
            glow: "bg-cyan-500",
            icon: <FiTarget size={18} />,
          },
          {
            label: "Total Spent",
            value: `₹${totalSpent.toLocaleString("en-IN")}`,
            color: "text-rose-500",
            bg: "bg-rose-500/5",
            border: "border-rose-500/20",
            glow: "bg-rose-500",
            icon: <FiTrendingDown size={18} />,
          },
          {
            label: "Remaining",
            value: `₹${Math.abs(totalRemaining).toLocaleString("en-IN")}`,
            color: totalRemaining >= 0 ? "text-emerald-500" : "text-rose-500",
            bg: "bg-emerald-500/5",
            border: "border-emerald-500/20",
            glow: "bg-emerald-500",
            icon: <FiDollarSign size={18} />,
          },
          {
            label: "Over Budget",
            value: overBudgetCount,
            color: overBudgetCount > 0 ? "text-amber-500" : "text-emerald-500",
            bg: overBudgetCount > 0 ? "bg-amber-500/5" : "bg-emerald-500/5",
            border:
              overBudgetCount > 0
                ? "border-amber-500/20"
                : "border-emerald-500/20",
            glow: overBudgetCount > 0 ? "bg-amber-500" : "bg-emerald-500",
            icon:
              overBudgetCount > 0 ? (
                <FiAlertTriangle size={18} />
              ) : (
                <FiCheckCircle size={18} />
              ),
          },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -3 }}
            className={`relative overflow-hidden rounded-2xl border p-5 bg-[var(--surface-primary)] ${card.border} backdrop-blur-sm shadow-sm`}
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
              <p className={`text-2xl font-bold tracking-tight ${card.color}`}>
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── PILL TABS ── */}
      <div className="flex items-center gap-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-2xl p-1.5 w-fit flex-wrap shadow-sm">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200
              ${activeTab === tab.id
                ? "bg-[var(--surface-primary)] border border-[var(--border)] text-emerald-500 shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        {/* --- OVERVIEW --- */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {summary.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/20 shadow-inner">
                <div className="w-16 h-16 rounded-3xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center shadow-lg">
                  <FiTarget size={28} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    Your budget plan is empty
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                    Create category budgets to keep your finances in check.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 text-xs font-extrabold text-white bg-emerald-500 px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  + CREATE BUDGET
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {summary.map((item, idx) => {
                  const pct =
                    item.allocated > 0
                      ? Math.round((item.spent / item.allocated) * 100)
                      : 0;
                  const statusColor =
                    pct >= 90
                      ? "text-rose-500"
                      : pct >= 70
                        ? "text-amber-500"
                        : "text-emerald-500";
                  const statusBg =
                    pct >= 90
                      ? "bg-rose-500/10 border-rose-500/20"
                      : pct >= 70
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-emerald-500/10 border-emerald-500/20";
                  return (
                    <motion.div
                      key={item._id || item.category}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      whileHover={{ y: -2 }}
                      className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                            {item.category}
                          </h3>
                          <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                            ₹{item.spent.toLocaleString("en-IN")} OF ₹
                            {item.allocated.toLocaleString("en-IN")} USED
                          </p>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border ${statusBg} ${statusColor} shadow-inner`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <BudgetProgress pct={pct} />
                      <div className="flex items-center justify-between mt-4 text-[11px] font-bold">
                        <span className="text-[var(--text-muted)] uppercase tracking-wide">
                          SPENT:{" "}
                          <span className="text-rose-500">
                            ₹{item.spent.toLocaleString("en-IN")}
                          </span>
                        </span>
                        <span
                          className={`uppercase tracking-wide ${item.remaining >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                        >
                          {item.remaining >= 0
                            ? `₹${item.remaining.toLocaleString("en-IN")} LEFT`
                            : `₹${Math.abs(item.remaining).toLocaleString("en-IN")} OVER`}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* --- ANALYTICS --- */}
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
                  <FiPieChart size={14} className="text-cyan-500" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Spending by Category
                </h3>
              </div>
              {summary.length === 0 ? (
                <div className="flex items-center justify-center h-56 text-[var(--text-muted)] text-sm font-medium">
                  No data available
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={summary.map((s) => ({
                          name: s.category,
                          value: s.spent,
                        }))}
                        dataKey="value"
                        outerRadius={85}
                        innerRadius={55}
                        paddingAngle={4}
                        label={false}
                      >
                        {summary.map((item, i) => (
                          <Cell
                            key={item.category}
                            fill={COLORS[i % COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {summary.map((s, i) => (
                      <span
                        key={s.category}
                        className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        {s.category}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                  <FiTarget size={14} className="text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Allocated vs Spent
                </h3>
              </div>
              {summary.length === 0 ? (
                <div className="flex items-center justify-center h-56 text-[var(--text-muted)] text-sm font-medium">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={summary.map((s) => ({
                      name: s.category,
                      allocated: s.allocated,
                      spent: s.spent,
                    }))}
                    barSize={12}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
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
                      dataKey="allocated"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar dataKey="spent" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        )}

        {/* --- AI PLANNER --- */}
        {activeTab === "ai planner" && (
          <motion.div
            key="ai planner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="rounded-2xl bg-[var(--surface-primary)] border border-emerald-500/10 backdrop-blur-sm overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-6 border-b border-[var(--border)] relative z-10 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                    <FiCpu size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      AI Budget Intelligence
                    </h2>
                    <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                      Strategic allocations powered by your data
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={loadingPlan}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
                             bg-gradient-to-r from-emerald-500 to-cyan-500 text-white
                             hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
                             shadow-xl shadow-emerald-500/20"
                >
                  {loadingPlan ? (
                    <>
                      <FiRefreshCw size={16} className="animate-spin" />{" "}
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <FiZap size={16} /> GENERATE STRATEGY
                    </>
                  )}
                </button>
              </div>

              {!budgetPlan && !loadingPlan && (
                <div className="flex flex-col items-center gap-4 py-20 text-center px-6">
                  <div className="w-16 h-16 rounded-3xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                    <FiCpu
                      size={32}
                      className="text-[var(--text-muted)] opacity-50"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      Intelligence Engine Offline
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                      Click generate to analyze your income, recurring payments,
                      and historical spending.
                    </p>
                  </div>
                </div>
              )}

              {loadingPlan && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Shimmer key={i} className="h-24 rounded-2xl" />
                    ))}
                  </div>
                  <Shimmer className="h-64 rounded-2xl" />
                </div>
              )}

              {budgetPlan && !loadingPlan && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Est. Income",
                        value: `₹${budgetPlan.snapshot.income}`,
                        color: "text-emerald-500",
                        bg: "bg-emerald-500/5",
                        border: "border-emerald-500/20",
                        glow: "bg-emerald-500",
                      },
                      {
                        label: "Fixed Costs",
                        value: `₹${budgetPlan.snapshot.expenses}`,
                        color: "text-rose-500",
                        bg: "bg-rose-500/5",
                        border: "border-rose-500/20",
                        glow: "bg-rose-500",
                      },
                      {
                        label: "Free Surplus",
                        value: `₹${budgetPlan.snapshot.surplus}`,
                        color: "text-cyan-500",
                        bg: "bg-cyan-500/5",
                        border: "border-cyan-500/20",
                        glow: "bg-cyan-500",
                      },
                    ].map((s, i) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`relative overflow-hidden rounded-2xl border p-5 ${s.bg} ${s.border} shadow-sm`}
                      >
                        <div
                          className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 ${s.glow}`}
                        />
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                          {s.label}
                        </p>
                        <p
                          className={`text-2xl font-bold tracking-tight ${s.color}`}
                        >
                          {s.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-[var(--surface-secondary)]/30 border border-[var(--border)] overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50">
                        <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">
                          Recommended Allocations
                        </h3>
                      </div>
                      <div className="divide-y divide-[var(--border)]">
                        {budgetPlan.budgetPlan.map((item, i) => (
                          <motion.div
                            key={item.category}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between px-5 py-4 hover:bg-[var(--surface-tertiary)] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <FiTarget size={14} className="text-cyan-500" />
                              </div>
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-sm font-extrabold text-cyan-500">
                              ₹{item.recommended}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-6 relative overflow-hidden shadow-sm">
                      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/5 blur-[80px]" />
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                          <FiZap size={14} className="text-emerald-500" />
                        </div>
                        <h3 className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
                          Actionable Insights
                        </h3>
                      </div>
                      <ul className="space-y-4 relative z-10">
                        {budgetPlan.recommendations.map((tip) => (
                          <li
                            key={tip}
                            className="flex items-start gap-4 text-xs font-medium text-[var(--text-secondary)] leading-relaxed"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1 shadow-lg shadow-emerald-500/50" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- MANAGE --- */}
        {activeTab === "manage" && (
          <motion.div
            key="manage"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  Budget Configuration
                </h3>
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {budgets.length} Items
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-secondary)]
                           border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]
                           hover:border-emerald-500/30 transition-all shadow-sm active:scale-95"
              >
                <FiPlus size={14} className="text-emerald-500" /> NEW BUDGET
              </button>
            </div>

            {budgets.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/20 shadow-inner">
                <div className="w-16 h-16 rounded-3xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center shadow-lg">
                  <FiTarget size={28} className="text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  Static limits not found
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((b, idx) => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    whileHover={{ y: -2 }}
                    className="group rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rotate-45 translate-x-8 -translate-y-8" />

                    <div className="flex items-start justify-between relative z-10">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {typeof b.categoryID === "object"
                            ? b.categoryID?.name
                            : b.description || "Uncategorized"}
                        </p>
                        <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 truncate max-w-[150px] uppercase tracking-wider">
                          {b.description || "NO DETAILS"}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Delete budget"
                        onClick={() => {
                          setSelectedBudget(b);
                          setConfirmDeleteOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-90 border border-transparent hover:border-rose-600"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-500 mt-6 tracking-tight">
                      ₹{Number(b.amount).toLocaleString("en-IN")}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADD BUDGET MODAL ── */}
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
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
              <FiTarget size={18} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                New Budget
              </h2>
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Set spending limits
              </p>
            </div>
          </div>
          <IconButton
            aria-label="Close budget dialog"
            onClick={() => setIsModalOpen(false)}
            size="small"
            sx={{
              color: "text.secondary",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <FiX size={18} />
          </IconButton>
        </div>
        <DialogContent sx={{ px: 4, py: 4 }}>
          <form onSubmit={handleAddBudget} className="space-y-5">
            <Field label="Category" icon={<FiTag size={16} />}>
              <select
                aria-label="Budget category"
                value={newBudget.categoryID}
                onChange={(e) =>
                  setNewBudget({
                    ...newBudget,
                    categoryID: e.target.value,
                  })
                }
                className={selectCls}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Monthly Limit (INR)"
              icon={<FiDollarSign size={16} />}
            >
              <input
                aria-label="Budget amount"
                type="number"
                placeholder="0.00"
                value={newBudget.amount}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, amount: e.target.value })
                }
                className={inputCls}
                required
                min="0.01"
                step="0.01"
              />
            </Field>
            <Field
              label="Short Note (Optional)"
              icon={<FiAlignLeft size={16} />}
            >
              <input
                aria-label="Budget description"
                type="text"
                placeholder="e.g. For household items"
                value={newBudget.description}
                onChange={(e) =>
                  setNewBudget({
                    ...newBudget,
                    description: e.target.value,
                  })
                }
                className={inputCls}
              />
            </Field>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600
                         font-bold text-sm text-white shadow-xl shadow-emerald-500/30
                         hover:opacity-95 hover:-translate-y-1 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
                         flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={16} sx={{ color: "white" }} />{" "}
                  ESTABLISHING...
                </>
              ) : (
                <>
                  <FiPlus size={20} /> INITIALIZE BUDGET
                </>
              )}
            </button>
          </form>
        </DialogContent>
      </MuiDialog>

      {/* ── DELETE CONFIRM MODAL ── */}
      <MuiDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: "background.paper",
            backgroundImage: "none",
            border: 1,
            borderColor: "divider",
            boxShadow: 24,
          },
        }}
      >
        <DialogContent sx={{ p: 5, textAlign: "center" }}>
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiTrash2 size={24} className="text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Delete Budget?
          </h3>
          <p className="text-sm font-medium text-[var(--text-muted)] mb-8 leading-relaxed">
            Permanently remove the budget for{" "}
            <span className="text-[var(--text-primary)] font-bold">
              {selectedBudget &&
                (typeof selectedBudget.categoryID === "object"
                  ? selectedBudget.categoryID?.name
                  : selectedBudget.description || "this category")}
            </span>
            ?
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleDeleteBudget}
              disabled={isDeleting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-sm font-bold text-white hover:opacity-95 transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <CircularProgress size={14} sx={{ color: "white" }} />{" "}
                  DELETING...
                </>
              ) : (
                "YES, DELETE"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDeleteOpen(false);
                setSelectedBudget(null);
              }}
              className="w-full py-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all active:scale-95"
            >
              CANCEL
            </button>
          </div>
        </DialogContent>
      </MuiDialog>
    </div>
  );
};
