import { motion } from "framer-motion";
import {
  FiTarget,
  FiTrendingDown,
  FiDollarSign,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

const BudgetStatCards = ({
  totalAllocated,
  totalSpent,
  totalRemaining,
  overBudgetCount,
}) => (
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
        key={idx}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: idx * 0.05 }}
        whileHover={{ y: -3 }}
        className={`relative overflow-hidden rounded-2xl border p-5 bg-[var(--surface-primary)] ${card.border} backdrop-blur-sm shadow-sm`}
      >
        <div className="relative">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.bg} border ${card.border} shadow-inner`}
          >
            <span className={card.color}>{card.icon}</span>
          </div>
          <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest mb-1">
            {card.label}
          </p>
          <p className={`text-2xl font-bold tracking-tight ${card.color}`}>
            {card.value}
          </p>
        </div>
      </motion.div>
    ))}
  </div>
);

export default BudgetStatCards;
