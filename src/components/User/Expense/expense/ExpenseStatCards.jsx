import { motion } from "framer-motion";
import { FiTrendingDown, FiCalendar, FiDollarSign, FiTag } from "react-icons/fi";

const ExpenseStatCards = ({
  totalExpenses,
  thisMonthTotal,
  avgExpense,
  topCategory,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      {
        label: "Total Expenses",
        value: `₹${totalExpenses.toLocaleString("en-IN")}`,
        color: "text-rose-500",
        bg: "bg-rose-500/5",
        border: "border-rose-500/20",
        glow: "bg-rose-500",
        icon: <FiTrendingDown size={18} />,
      },
      {
        label: "This Month",
        value: `₹${thisMonthTotal.toLocaleString("en-IN")}`,
        color: "text-amber-500",
        bg: "bg-amber-500/5",
        border: "border-amber-500/20",
        glow: "bg-amber-500",
        icon: <FiCalendar size={18} />,
      },
      {
        label: "Avg per Entry",
        value: `₹${Math.round(avgExpense).toLocaleString("en-IN")}`,
        color: "text-cyan-500",
        bg: "bg-cyan-500/5",
        border: "border-cyan-500/20",
        glow: "bg-cyan-500",
        icon: <FiDollarSign size={18} />,
      },
      {
        label: "Top Category",
        value: topCategory,
        color: "text-indigo-500",
        bg: "bg-indigo-500/5",
        border: "border-indigo-500/20",
        glow: "bg-indigo-500",
        icon: <FiTag size={18} />,
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
          <p
            className={`text-2xl font-bold tracking-tight truncate ${card.color}`}
          >
            {card.value}
          </p>
        </div>
      </motion.div>
    ))}
  </div>
);

export default ExpenseStatCards;
