import { motion } from "framer-motion";
import { FiShoppingBag } from "react-icons/fi";

const RecentExpensesPanel = ({ recentExpenses, onAdd }) => (
  <motion.div
    key="overview"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="space-y-5"
  >
    <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-secondary)]/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
            <FiShoppingBag size={14} className="text-rose-500" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Recent Expenses
          </h3>
        </div>
        <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--surface-tertiary)] border border-[var(--border)] px-3 py-1 rounded-full tracking-wider">
          {recentExpenses.length} Entries
        </span>
      </div>

      {recentExpenses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shadow-inner">
            <FiShoppingBag
              size={24}
              className="text-[var(--text-muted)]"
            />
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            No recent expenses found.
          </p>
          <button
            onClick={onAdd}
            className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors tracking-widest"
          >
            + Add New Expense
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {recentExpenses.map((exp, i) => (
            <motion.li
              key={exp._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between px-6 py-4 hover:bg-[var(--surface-secondary)] transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/10 group-hover:border-rose-500/20 transition-all shadow-sm">
                  <FiShoppingBag
                    size={14}
                    className="text-[var(--text-muted)] group-hover:text-rose-500"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {exp.description}
                  </p>
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5 tracking-wider">
                    {exp.categoryID?.name || "Uncategorized"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <div className="text-right">
                  <p className="text-sm font-extrabold text-rose-500">
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
                    {new Date(exp.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  </motion.div>
);

export default RecentExpensesPanel;
