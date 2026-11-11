import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../../redux/transaction/transactionSlice";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiFilter,
  FiList,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";
import emptyActivity from "../../assets/illustrations/empty-activity.svg";

const TAB_TYPES = { All: null, Expenses: "Expense", Incomes: "Income" };

/**
 * --- TRANSACTION LEDGER ---
 * The historical record of all financial movements (Inflow vs Outflow).
 * Features advanced filtering, grouping by date, and efficiency scoring.
 */

// --- ATOMIC UI: LOADING STATES ---
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

const TransactionSkeleton = () => (
  <div className="space-y-4 p-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4">
        <Shimmer className="w-12 h-12 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-1/3 rounded-lg" />
          <Shimmer className="h-3 w-1/4 rounded-lg" />
        </div>
        <Shimmer className="h-5 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

// --- MAIN COMPONENT ---
export const Transaction = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { transactions, summary, loading } = useSelector(
    (state) => state.transaction,
  );
  
  // --- STATE & CONFIG ---
  const [activeTab, setActiveTab] = useState("All");
  const userId = useMemo(() => user?._id, [user]);

  // --- LIFECYCLE ---
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchTransactions(userId));
  }, [dispatch, userId]);

  // --- DATA PROCESSING ---

  // Filter based on selected tab and sort by date descending
  const filteredSorted = useMemo(() => {
    const filtered = TAB_TYPES[activeTab]
      ? transactions.filter((t) => t.type === TAB_TYPES[activeTab])
      : transactions;
    return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeTab, transactions]);

  // Group entries into date-based sections for better readability
  const groupedByDate = useMemo(() => {
    return filteredSorted.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(t);
      return acc;
    }, {});
  }, [filteredSorted]);

  // Handle CTA for unplanned expenses
  const handlePlanBudget = (expense) => {
    alert(
      `Initiating budget planning for ${expense.categoryID?.name || "Uncategorized"}...`,
    );
  };

  const savingsRate =
    summary.totalIncome > 0
      ? Math.round(
          ((summary.totalIncome - summary.totalExpense) / summary.totalIncome) *
            100,
        )
      : 0;

  const tabs = [
    { key: "All", label: "All", count: transactions.length },
    {
      key: "Expenses",
      label: "Expenses",
      count: transactions.filter((t) => t.type === "Expense").length,
    },
    {
      key: "Incomes",
      label: "Income",
      count: transactions.filter((t) => t.type === "Income").length,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-[var(--text-primary)] pb-10"
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Transactions</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Income and expenses, grouped by date.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2 text-xs text-[var(--text-muted)]">
          <FiCalendar size={14} className="text-[var(--accent-electric)]" />
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-[var(--border)] border-y border-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          {
            title: "Income",
            value: summary.totalIncome,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            icon: <FiTrendingUp size={18} />,
          },
          {
            title: "Expenses",
            value: summary.totalExpense,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            icon: <FiTrendingDown size={18} />,
          },
          {
            title: "Net balance",
            value: summary.balance,
            color: summary.balance >= 0 ? "text-cyan-500" : "text-rose-500",
            bg: summary.balance >= 0 ? "bg-cyan-500/10" : "bg-rose-500/10",
            border:
              summary.balance >= 0
                ? "border-cyan-500/20"
                : "border-rose-500/20",
            icon: <FiDollarSign size={18} />,
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className="flex items-center gap-3 px-4 py-4 first:pl-0"
          >
            <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${card.bg} ${card.color}`}>
              {card.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-[var(--text-muted)]">{card.title}</p>
              <p className={`mt-1 truncate text-xl font-semibold tabular-nums tracking-tight ${card.color}`}>
                ₹{Math.abs(card.value).toLocaleString("en-IN")}
              </p>
              {idx === 2 && <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Savings rate · {savingsRate}%</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN INTERFACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Central Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selection */}
          <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors active:scale-[0.98]
                  ${
                    activeTab === tab.key
                      ? "bg-[#3985ff] text-[#101a2b]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
                  }`}
              >
                {tab.label}
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 font-medium
                  ${activeTab === tab.key ? "bg-[#101a2b]/10 text-[#101a2b]" : "bg-[var(--surface-tertiary)] text-[var(--text-muted)]"}`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Activity List */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)]">
            {loading ? (
              <TransactionSkeleton />
            ) : filteredSorted.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <img src={emptyActivity} alt="" aria-hidden="true" className="h-24 w-28" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    No transactions yet
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Transactions matching this view will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="divide-y divide-[var(--border)]"
                >
                  {Object.keys(groupedByDate).map((date) => (
                    <div key={date}>
                      {/* TEMPORAL MARKER (Section Header) */}
                      <div
                        className={`flex items-center gap-4 px-8 py-5 bg-[var(--surface-secondary)]/30`}
                      >
                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                        <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em]">
                          {date}
                        </span>
                        <div className="flex-1 h-px bg-[var(--border)]/50" />
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] border border-[var(--border)] px-2 py-1 rounded-md">
                          {groupedByDate[date].length} OPERATIONS
                        </span>
                      </div>

                      {/* INDIVIDUAL ENTRIES */}
                      <div className="divide-y divide-[var(--border)]/50">
                        {groupedByDate[date].map((t, i) => (
                          <motion.div
                            key={t._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="flex items-center gap-5 px-8 py-6 hover:bg-[var(--surface-secondary)]/50 transition-all group"
                          >
                            {/* Direction Icon */}
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner transition-transform group-hover:scale-110
                              ${t.type === "Income" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}
                            >
                              {t.type === "Income" ? (
                                <FiArrowUpRight
                                  size={18}
                                  className="text-emerald-500"
                                />
                              ) : (
                                <FiArrowDownRight
                                  size={18}
                                  className="text-rose-500"
                                />
                              )}
                            </div>

                            {/* Core Telemetry (Description/Category) */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <h5 className="text-sm font-black text-[var(--text-primary)] truncate uppercase tracking-tight">
                                  {t.description ||
                                    t.source ||
                                    "Unknown Vector"}
                                </h5>
                                {t.type === "Expense" && t.hasBudget && (
                                  <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 uppercase tracking-widest">
                                    Strategic
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {t.categoryID?.name && (
                                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--text-muted)] uppercase tracking-widest">
                                    {t.categoryID.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Monetary Data */}
                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                              <p
                                className={`text-lg font-black tracking-tighter ${t.type === "Income" ? "text-emerald-500" : "text-rose-500"}`}
                              >
                                {t.type === "Income" ? "+" : "−"}₹
                                {Number(t.amount || 0).toLocaleString("en-IN")}
                              </p>
                              {t.type === "Expense" && !t.hasBudget && (
                                <button
                                  onClick={() => handlePlanBudget(t)}
                                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl
                                             bg-cyan-500/10 border border-cyan-500/20 text-cyan-500
                                             hover:bg-cyan-500 hover:text-white shadow-lg shadow-cyan-500/10
                                             transition-all duration-300 whitespace-nowrap active:scale-95"
                                >
                                  Strategize
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ANALYTICS ── */}
        <div className="space-y-6">
          {/* Quick Filters */}
          <div className="rounded-[2rem] bg-[var(--surface-primary)] border border-[var(--border)] shadow-xl overflow-hidden backdrop-blur-md">
            <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <FiFilter size={14} className="text-cyan-500" />
              </div>
              <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">
                Parameter Matrix
              </h4>
            </div>
            <div className="p-3 space-y-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${
                      activeTab === tab.key
                        ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-500"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    {tab.key === "All" && <FiList size={14} />}
                    {tab.key === "Expenses" && <FiTrendingDown size={14} />}
                    {tab.key === "Incomes" && <FiTrendingUp size={14} />}
                    {tab.label} UNIT
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-md font-black
                    ${activeTab === tab.key ? "bg-cyan-500/20 text-cyan-500" : "bg-[var(--surface-tertiary)] text-[var(--text-muted)]"}`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Totality Ledger */}
          <div className="rounded-[2rem] bg-[var(--surface-primary)] border border-[var(--border)] shadow-xl overflow-hidden backdrop-blur-md">
            <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FiDollarSign size={14} className="text-blue-500" />
              </div>
              <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">
                Totality Ledger
              </h4>
            </div>
            <div className="p-6 space-y-5">
              {[
                {
                  label: "Gross Inflow",
                  value: summary.totalIncome,
                  color: "text-emerald-500",
                },
                {
                  label: "Gross Outflow",
                  value: summary.totalExpense,
                  color: "text-rose-500",
                },
                {
                  label: "Net Surplus",
                  value: summary.balance,
                  color:
                    summary.balance >= 0 ? "text-cyan-500" : "text-rose-500",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between group ${i < 2 ? "pb-4 border-b border-[var(--border)]/50" : ""}`}
                >
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    {row.label}
                  </span>
                  <span
                    className={`text-sm font-black tracking-tight ${row.color}`}
                  >
                    {row.value < 0 ? "−" : ""}₹
                    {Math.abs(row.value).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}

              {/* Progress Indicator */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span className="text-[var(--text-muted)]">
                    Efficiency Score
                  </span>
                  <span
                    className={
                      savingsRate >= 20
                        ? "text-emerald-500"
                        : savingsRate >= 0
                          ? "text-amber-500"
                          : "text-rose-500"
                    }
                  >
                    {savingsRate}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-tertiary)] overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.max(0, Math.min(savingsRate, 100))}%`,
                    }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={`h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.2)] ${
                      savingsRate >= 20
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                        : savingsRate >= 0
                          ? "bg-gradient-to-r from-amber-500 to-orange-600"
                          : "bg-gradient-to-r from-rose-500 to-red-700"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
