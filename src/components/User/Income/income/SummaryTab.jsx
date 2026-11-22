import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPercent,
  FiZap,
} from "react-icons/fi";

const SummaryTab = ({ stats, tips }) => (
  <motion.div
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
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          whileHover={{ y: -3 }}
          className={`relative overflow-hidden rounded-2xl border p-5 bg-[var(--surface-primary)] ${card.border} shadow-sm backdrop-blur-sm`}
        >
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.bg} border ${card.border} shadow-inner`}
            >
              <span className={card.color}>{card.icon}</span>
            </div>
            <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-normal mb-1">
              {card.label}
            </p>
            <p
              className={`text-2xl font-bold tracking-tight ${card.color}`}
            >
              {card.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>

    <motion.div
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
          <p className="text-[11px] font-bold text-cyan-500 tracking-normal mt-0.5">
            AI-Powered Recommendations
          </p>
        </div>
      </div>
      <ul className="space-y-4 relative z-10">
        {tips.map((tip, idx) => (
          <li
            key={idx}
            className="flex items-start gap-4 text-xs font-medium text-[var(--text-secondary)] leading-relaxed"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 mt-1 shadow-lg shadow-cyan-500/50" />
            {tip}
          </li>
        ))}
      </ul>
    </motion.div>
  </motion.div>
);

export default SummaryTab;
