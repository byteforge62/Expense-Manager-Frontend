import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPercent,
  FiZap,
} from "react-icons/fi";

const SummaryTab = ({ stats, tips }) => (
  <div className="space-y-2.5">
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {[
        {
          label: "Total Wealth",
          value: `₹${stats.totalIncome.toLocaleString("en-IN")}`,
          color: "text-emerald-500",
          bg: "bg-emerald-500/5",
          border: "border-emerald-500/20",
          icon: <FiTrendingUp size={14} />,
        },
        {
          label: "Withdrawals",
          value: `₹${stats.totalExpense.toLocaleString("en-IN")}`,
          color: "text-rose-500",
          bg: "bg-rose-500/5",
          border: "border-rose-500/20",
          icon: <FiTrendingDown size={14} />,
        },
        {
          label: "Net Surplus",
          value: `₹${stats.netSavings.toLocaleString("en-IN")}`,
          color: "text-cyan-500",
          bg: "bg-cyan-500/5",
          border: "border-cyan-500/20",
          icon: <FiDollarSign size={14} />,
        },
        {
          label: "Efficiency",
          value: `${stats.savingsRate}%`,
          color: "text-amber-500",
          bg: "bg-amber-500/5",
          border: "border-amber-500/20",
          icon: <FiPercent size={14} />,
        },
      ].map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border bg-[var(--surface-primary)] p-2.5 shadow-sm ${card.border}`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-lg border ${card.bg} ${card.border} ${card.color}`}
            >
              {card.icon}
            </span>
            <p className="text-[10px] font-semibold text-[var(--text-muted)]">
              {card.label}
            </p>
          </div>
          <p className={`mt-1 text-lg font-bold tracking-tight ${card.color}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>

    <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-2.5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
          <FiZap size={13} className="text-cyan-500" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[11.5px] font-semibold text-[var(--text-primary)]">
            Wealth Optimization Insights
          </h3>
          <p className="text-[9.5px] font-semibold text-cyan-500">
            AI-Powered Recommendations
          </p>
        </div>
      </div>
      <ul className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {tips.map((tip, idx) => (
          <li
            key={idx}
            className="flex items-start gap-1.5 text-[10.5px] leading-snug text-[var(--text-secondary)]"
          >
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default SummaryTab;
