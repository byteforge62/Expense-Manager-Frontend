import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectTransactions,
  selectTransactionsLoading,
} from "../../store/slices/transactionSlice";
import { fetchExpenses } from "../../store/slices/expensesSlice";
import { fetchIncomes } from "../../store/slices/incomeSlice";
import { fetchBudgets } from "../../store/slices/budgetSlice";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiArrowUpRight,
  FiArrowDownRight,
  FiActivity,
} from "react-icons/fi";
import emptyActivity from "../../assets/illustrations/empty-activity.svg";

const TAB_TYPES = { All: null, Expenses: "Expense", Incomes: "Income" };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RANGE_PRESETS = [
  { key: "month", label: "This month" },
  { key: "90d", label: "90 days" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

const axisTick = { fill: "var(--text-muted)", fontSize: 9, fontWeight: 500 };

/** Local calendar day as `yyyy-mm-dd`, so a range never shifts by timezone. */
const toISODate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const FlowTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-primary)] px-2.5 py-1.5 shadow-lg">
      <p className="text-[9.5px] font-medium text-[var(--text-muted)]">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="text-[11px] font-bold tabular-nums"
          style={{ color: entry.color }}
        >
          {entry.name} · ₹{Number(entry.value || 0).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

/**
 * --- TRANSACTION LEDGER ---
 * The historical record of all financial movements (inflow against outflow),
 * read as one dated timeline with the balance sheet beside it. The tab strip is
 * gone: the three units are a filter on the ledger, and every figure is visible
 * without switching views. A date range scopes the ledger, the totals and the
 * cash-flow analytics together.
 */

// --- ATOMIC UI: LOADING STATES ---
const Shimmer = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-[var(--surface-tertiary)] rounded-lg ${className}`}
  >
    <div
      className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                    bg-gradient-to-r from-transparent via-[var(--surface-primary)]/10 to-transparent"
    />
  </div>
);

const TransactionSkeleton = () => (
  <div className="space-y-2 p-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-2">
        <Shimmer className="h-7 w-7 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-3 w-1/3" />
          <Shimmer className="h-2.5 w-1/4" />
        </div>
        <Shimmer className="h-3 w-14" />
      </div>
    ))}
  </div>
);

// --- ATOMIC UI: SUMMARY CELL ---
const SummaryCell = ({ label, note, value, color, icon }) => (
  <div className="flex items-center gap-2 px-3 py-2">
    <span
      className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border ${color.bg} ${color.border} ${color.text}`}
    >
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[9.5px] font-medium text-[var(--text-muted)]">{label}</p>
      <p
        className={`mt-0.5 truncate text-[15px] font-bold leading-none tracking-tight tabular-nums ${color.text}`}
      >
        ₹{Math.abs(value).toLocaleString("en-IN")}
      </p>
      {note && (
        <p className="mt-0.5 truncate text-[9px] text-[var(--text-muted)]">{note}</p>
      )}
    </div>
  </div>
);

// --- ATOMIC UI: ANALYTIC FIGURE ---
const InsightCell = ({ label, value, tone }) => (
  <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2 py-1">
    <dt className="truncate text-[9px] font-medium text-[var(--text-muted)]">
      {label}
    </dt>
    <dd
      className={`mt-0.5 truncate text-[11px] font-bold tabular-nums ${
        tone || "text-[var(--text-primary)]"
      }`}
    >
      {value}
    </dd>
  </div>
);

// --- MAIN COMPONENT ---
export const Transaction = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?._id);

  // The ledger is derived from the normalized slices, so this page owns no
  // copy of the data and no merge thunk: one selector, already memoized.
  const transactions = useAppSelector(selectTransactions);
  const loading = useAppSelector(selectTransactionsLoading);

  // --- STATE & CONFIG ---
  // A filter over one list, not a set of tab panels.
  const [activeTab, setActiveTab] = useState("All");
  // Date range: a preset, or a hand-picked `from`/`to` which clears the preset.
  const [range, setRange] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const applyPreset = (key) => {
    const now = new Date();
    setRange(key);

    if (key === "month") {
      setFrom(toISODate(new Date(now.getFullYear(), now.getMonth(), 1)));
      setTo(toISODate(now));
    } else if (key === "90d") {
      const start = new Date(now);
      start.setDate(start.getDate() - 89);
      setFrom(toISODate(start));
      setTo(toISODate(now));
    } else if (key === "year") {
      setFrom(`${now.getFullYear()}-01-01`);
      setTo(toISODate(now));
    } else {
      setFrom("");
      setTo("");
    }
  };

  // --- LIFECYCLE ---
  // Make sure the three source slices are populated on a direct visit. Each
  // thunk is a no-op while its own request is already in flight.
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchExpenses({ userId }));
    dispatch(fetchIncomes(userId));
    dispatch(fetchBudgets(userId));
  }, [dispatch, userId]);

  // --- DATA PROCESSING ---

  // Everything inside the chosen date range. Totals and analytics read from
  // this, so the figures always agree with the ledger being shown.
  const rangedTransactions = useMemo(() => {
    if (!from && !to) return transactions;
    return transactions.filter((t) => {
      const day = toISODate(t.date);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }, [transactions, from, to]);

  // Filter based on selected unit and sort by date descending
  const filteredSorted = useMemo(() => {
    const filtered = TAB_TYPES[activeTab]
      ? rangedTransactions.filter((t) => t.type === TAB_TYPES[activeTab])
      : rangedTransactions;
    return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeTab, rangedTransactions]);

  // Group entries into date-based sections for better readability
  const groupedByDate = useMemo(
    () =>
      filteredSorted.reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(t);
        return acc;
      }, {}),
    [filteredSorted],
  );

  // Totals for the active range only, so "Income" is not a lifetime figure
  // sitting next to a ledger narrowed to one month.
  const rangeSummary = useMemo(
    () =>
      rangedTransactions.reduce(
        (acc, t) => {
          const amount = Number(t.amount || 0);
          if (t.type === "Income") acc.totalIncome += amount;
          else acc.totalExpense += amount;
          acc.balance = acc.totalIncome - acc.totalExpense;
          return acc;
        },
        { totalIncome: 0, totalExpense: 0, balance: 0 },
      ),
    [rangedTransactions],
  );

  // The two largest movements, so the balance sheet says something about scale.
  const peaks = useMemo(() => {
    const income = rangedTransactions.filter((t) => t.type === "Income");
    const expense = rangedTransactions.filter((t) => t.type === "Expense");
    const largest = (rows) =>
      rows.reduce(
        (best, row) => (Number(row.amount) > Number(best?.amount ?? 0) ? row : best),
        null,
      );
    return { income: largest(income), expense: largest(expense) };
  }, [rangedTransactions]);

  // One bucket per month present in the range, capped to the latest 8.
  const monthlyFlow = useMemo(() => {
    const buckets = new Map();

    rangedTransactions.forEach((t) => {
      const date = new Date(t.date);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          key,
          label: date.toLocaleDateString("en-IN", { month: "short" }),
          income: 0,
          expense: 0,
        });
      }
      const bucket = buckets.get(key);
      if (t.type === "Income") bucket.income += Number(t.amount || 0);
      else bucket.expense += Number(t.amount || 0);
    });

    const rows = [...buckets.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
    if (rows.length > 0) return rows.slice(-8);

    // An empty range still gets a scale to read against.
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-IN", { month: "short" }),
        income: 0,
        expense: 0,
      };
    });
  }, [rangedTransactions]);

  // Small figures that describe behaviour rather than totals.
  const insights = useMemo(() => {
    const incomeRows = rangedTransactions.filter((t) => t.type === "Income");
    const expenseRows = rangedTransactions.filter((t) => t.type === "Expense");
    const average = (rows) => {
      if (rows.length === 0) return 0;
      return Math.round(
        rows.reduce((sum, row) => sum + Number(row.amount || 0), 0) / rows.length,
      );
    };

    const weekdayCounts = new Array(7).fill(0);
    rangedTransactions.forEach((t) => {
      const date = new Date(t.date);
      if (!Number.isNaN(date.getTime())) weekdayCounts[date.getDay()] += 1;
    });
    const busiest = Math.max(...weekdayCounts);

    const categories = new Map();
    expenseRows.forEach((t) => {
      const name = t.categoryID?.name || "Uncategorized";
      categories.set(name, (categories.get(name) || 0) + Number(t.amount || 0));
    });
    const topCategory =
      [...categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return {
      avgIncome: average(incomeRows),
      avgExpense: average(expenseRows),
      busiestDay: busiest > 0 ? WEEKDAYS[weekdayCounts.indexOf(busiest)] : "—",
      topCategory,
    };
  }, [rangedTransactions]);

  // Handle CTA for unplanned expenses
  const handlePlanBudget = (expense) => {
    alert(
      `Initiating budget planning for ${expense.categoryID?.name || "Uncategorized"}...`,
    );
  };

  const savingsRate =
    rangeSummary.totalIncome > 0
      ? Math.round(
          ((rangeSummary.totalIncome - rangeSummary.totalExpense) /
            rangeSummary.totalIncome) *
            100,
        )
      : 0;

  const flowTotal = rangeSummary.totalIncome + rangeSummary.totalExpense;
  const incomeShare = flowTotal > 0 ? (rangeSummary.totalIncome / flowTotal) * 100 : 0;
  const expenseShare = flowTotal > 0 ? (rangeSummary.totalExpense / flowTotal) * 100 : 0;

  const filters = [
    { key: "All", label: "All", count: rangedTransactions.length },
    {
      key: "Expenses",
      label: "Expenses",
      count: rangedTransactions.filter((t) => t.type === "Expense").length,
    },
    {
      key: "Incomes",
      label: "Income",
      count: rangedTransactions.filter((t) => t.type === "Income").length,
    },
  ];

  const rangeLabel = RANGE_PRESETS.find((preset) => preset.key === range)?.label
    ?? (from || to ? "Custom range" : "All time");

  const dateInputCls =
    "w-[102px] bg-transparent text-[10px] font-medium text-[var(--text-primary)] outline-none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2.5 text-[var(--text-primary)]"
    >
      {/* ── HEADER + DATE RANGE ── */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Income and expenses, grouped by date.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div
            role="group"
            aria-label="Date range presets"
            className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-0.5"
          >
            {RANGE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => applyPreset(preset.key)}
                aria-pressed={range === preset.key}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                  range === preset.key
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-primary)] px-2 py-1">
            <FiCalendar size={12} className="flex-shrink-0 text-cyan-500" />
            <input
              type="date"
              aria-label="From date"
              value={from}
              max={to || undefined}
              onChange={(event) => {
                setFrom(event.target.value);
                setRange(null);
              }}
              className={dateInputCls}
            />
            <span className="text-[9px] text-[var(--text-muted)]">→</span>
            <input
              type="date"
              aria-label="To date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setTo(event.target.value);
                setRange(null);
              }}
              className={dateInputCls}
            />
          </div>
        </div>
      </div>

      {/* ── THREE FIGURES IN ONE RULE ── */}
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
        <SummaryCell
          label="Income"
          note={`Total inflow · ${rangeLabel.toLowerCase()}`}
          value={rangeSummary.totalIncome}
          color={{
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            text: "text-emerald-500",
          }}
          icon={<FiTrendingUp size={13} />}
        />
        <SummaryCell
          label="Expenses"
          note="Total outflow in range"
          value={rangeSummary.totalExpense}
          color={{
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            text: "text-rose-500",
          }}
          icon={<FiTrendingDown size={13} />}
        />
        <SummaryCell
          label="Net balance"
          note={`Savings rate · ${savingsRate}%`}
          value={rangeSummary.balance}
          color={{
            bg: rangeSummary.balance >= 0 ? "bg-cyan-500/10" : "bg-rose-500/10",
            border:
              rangeSummary.balance >= 0
                ? "border-cyan-500/20"
                : "border-rose-500/20",
            text: rangeSummary.balance >= 0 ? "text-cyan-500" : "text-rose-500",
          }}
          icon={<FiDollarSign size={13} />}
        />
      </div>

      <div className="grid items-start gap-2.5 xl:grid-cols-12">
        {/* ── THE TIMELINE ── */}
        <section
          aria-labelledby="transaction-ledger-heading"
          className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] shadow-sm xl:col-span-8"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-3 py-2">
            <h2
              id="transaction-ledger-heading"
              className="text-[11.5px] font-semibold text-[var(--text-primary)]"
            >
              Activity ledger
            </h2>
            <span className="text-[10px] font-medium text-[var(--text-muted)] tabular-nums">
              {filteredSorted.length} entries
            </span>

            <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-0.5">
              {filters.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                    activeTab === tab.key
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded px-1 text-[9px] tabular-nums ${
                      activeTab === tab.key
                        ? "bg-black/15 text-white"
                        : "bg-[var(--surface-tertiary)] text-[var(--text-muted)]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <TransactionSkeleton />
          ) : filteredSorted.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <img src={emptyActivity} alt="" aria-hidden="true" className="h-16 w-20" />
              <p className="text-[11.5px] font-semibold text-[var(--text-primary)]">
                No transactions yet
              </p>
              <p className="text-[10.5px] text-[var(--text-muted)]">
                Transactions matching this view will appear here.
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-277px)] min-h-[200px] overflow-y-auto">
              {Object.keys(groupedByDate).map((date) => (
                <div key={date}>
                  {/* Temporal marker */}
                  <div className="sticky top-0 flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      {date}
                    </span>
                    <span className="ml-auto text-[9px] font-medium text-[var(--text-muted)] tabular-nums">
                      {groupedByDate[date].length} operations
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--border)]">
                    {groupedByDate[date].map((t) => (
                      <div
                        key={t._id}
                        className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-1.5 hover:bg-[var(--surface-secondary)]"
                      >
                        <span
                          className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border ${
                            t.type === "Income"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                              : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {t.type === "Income" ? (
                            <FiArrowUpRight size={13} />
                          ) : (
                            <FiArrowDownRight size={13} />
                          )}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-[11.5px] font-semibold text-[var(--text-primary)]">
                            {t.description || t.source || "Unknown Vector"}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            {t.categoryID?.name && (
                              <span className="truncate rounded-full border border-[var(--border)] bg-[var(--surface-tertiary)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-muted)]">
                                {t.categoryID.name}
                              </span>
                            )}
                            {t.type === "Expense" && t.hasBudget && (
                              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-500">
                                Strategic
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[12.5px] font-bold tracking-tight tabular-nums ${
                              t.type === "Income"
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }`}
                          >
                            {t.type === "Income" ? "+" : "−"}₹
                            {Number(t.amount || 0).toLocaleString("en-IN")}
                          </span>
                          {t.type === "Expense" && !t.hasBudget && (
                            <button
                              onClick={() => handlePlanBudget(t)}
                              className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-1 text-[9px] font-semibold text-cyan-500 transition-colors hover:bg-cyan-500 hover:text-white"
                            >
                              Strategize
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── THE BALANCE SHEET + ANALYTICS ── */}
        <div className="min-w-0 space-y-2.5 xl:col-span-4">
          <section
            aria-labelledby="transaction-balance-heading"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-sm"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2
                id="transaction-balance-heading"
                className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                Net position
              </h2>
              <span className="text-[9.5px] font-medium text-[var(--text-muted)]">
                {rangedTransactions.length} entries
              </span>
            </div>

            <p
              className={`mt-0.5 truncate text-2xl font-bold leading-none tracking-tight tabular-nums ${
                rangeSummary.balance >= 0
                  ? "text-[var(--text-primary)]"
                  : "text-rose-500"
              }`}
            >
              {rangeSummary.balance < 0 ? "−" : ""}₹
              {Math.abs(rangeSummary.balance).toLocaleString("en-IN")}
            </p>

            <div className="mt-2">
              <div className="flex items-center justify-between text-[9.5px] font-semibold">
                <span className="text-[var(--text-muted)]">Efficiency score</span>
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
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--surface-tertiary)]">
                <div
                  className={`h-full rounded-full ${
                    savingsRate >= 0 ? "bg-cyan-500/80" : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(savingsRate, 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-2 space-y-1.5 border-t border-[var(--border)] pt-2">
              {[
                {
                  label: "Gross inflow",
                  value: rangeSummary.totalIncome,
                  share: incomeShare,
                  tone: "text-emerald-500",
                  bar: "bg-emerald-500",
                },
                {
                  label: "Gross outflow",
                  value: rangeSummary.totalExpense,
                  share: expenseShare,
                  tone: "text-rose-500",
                  bar: "bg-rose-500",
                },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-medium text-[var(--text-muted)]">
                      {row.label}
                    </span>
                    <span
                      className={`text-[11px] font-bold tabular-nums ${row.tone}`}
                    >
                      ₹{row.value.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-[var(--surface-tertiary)]">
                    <div
                      className={`h-full rounded-full ${row.bar}`}
                      style={{ width: `${row.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CASH-FLOW ANALYTICS ── */}
          <section
            aria-labelledby="flow-analytics-heading"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-sm"
          >
            <div className="flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-500">
                <FiActivity size={12} />
              </span>
              <h2
                id="flow-analytics-heading"
                className="text-[11.5px] font-semibold text-[var(--text-primary)]"
              >
                Cash-flow spread
              </h2>
              <span className="ml-auto whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {rangeLabel}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2.5 text-[9px] font-medium text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Inflow
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Outflow
              </span>
              <span className="ml-auto tabular-nums">
                {monthlyFlow.length} {monthlyFlow.length === 1 ? "month" : "months"}
              </span>
            </div>

            <div className="mt-1 h-[96px]">
              <ResponsiveContainer width="100%" height={96}>
                <AreaChart data={monthlyFlow} margin={{ top: 4, right: 2, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="flowIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="flowExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                    opacity={0.25}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="var(--border)"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="var(--border)"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                  />
                  <Tooltip content={<FlowTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Inflow"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#flowIncome)"
                    dot={{ r: 2, strokeWidth: 0, fill: "#10b981" }}
                    activeDot={{ r: 3 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Outflow"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fill="url(#flowExpense)"
                    dot={{ r: 2, strokeWidth: 0, fill: "#f43f5e" }}
                    activeDot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <dl className="mt-1.5 grid grid-cols-2 gap-1.5 border-t border-[var(--border)] pt-2">
              <InsightCell
                label="Avg inflow"
                value={`₹${insights.avgIncome.toLocaleString("en-IN")}`}
                tone="text-emerald-500"
              />
              <InsightCell
                label="Avg outflow"
                value={`₹${insights.avgExpense.toLocaleString("en-IN")}`}
                tone="text-rose-500"
              />
              <InsightCell label="Busiest day" value={insights.busiestDay} />
              <InsightCell label="Top category" value={insights.topCategory} />
            </dl>
          </section>

          <section
            aria-labelledby="peak-flows-heading"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-sm"
          >
            <h2
              id="peak-flows-heading"
              className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]"
            >
              Peak flows
            </h2>

            {!peaks.income && !peaks.expense ? (
              <p className="mt-1 text-[10.5px] text-[var(--text-muted)]">
                No movements recorded yet.
              </p>
            ) : (
              <ul className="mt-1.5 space-y-1.5">
                {[
                  {
                    key: "income",
                    row: peaks.income,
                    label: "Largest inflow",
                    tone: "text-emerald-500",
                  },
                  {
                    key: "expense",
                    row: peaks.expense,
                    label: "Largest outflow",
                    tone: "text-rose-500",
                  },
                ]
                  .filter((entry) => entry.row)
                  .map((entry) => (
                    <li
                      key={entry.key}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-[var(--text-primary)]">
                          {entry.row.description || entry.row.source || "—"}
                        </p>
                        <p className="text-[9px] text-[var(--text-muted)]">
                          {entry.label} ·{" "}
                          {new Date(entry.row.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <span
                        className={`whitespace-nowrap text-[11px] font-bold tabular-nums ${entry.tone}`}
                      >
                        ₹{Number(entry.row.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
              </ul>
            )}

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2">
              <span className="text-[10px] font-medium text-[var(--text-muted)]">
                Expense entries
              </span>
              <span className="text-[11px] font-semibold text-[var(--text-primary)] tabular-nums">
                {filters[1].count}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium text-[var(--text-muted)]">
                Income entries
              </span>
              <span className="text-[11px] font-semibold text-[var(--text-primary)] tabular-nums">
                {filters[2].count}
              </span>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default Transaction;
