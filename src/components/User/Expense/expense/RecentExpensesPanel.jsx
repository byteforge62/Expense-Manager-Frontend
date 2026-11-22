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
    <div className="rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <FiShoppingBag size={15} className="text-rose-500" />
          <h3 className="text-[13.5px] font-semibold text-[var(--text-primary)]">
            Recent Expenses
          </h3>
        </div>
        <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--surface-tertiary)] px-2 py-0.5 rounded-md">
          {recentExpenses.length} Entries
        </span>
      </div>

      {recentExpenses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FiShoppingBag size={24} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)] font-medium">
            No recent expenses found.
          </p>
          <button
            onClick={onAdd}
            className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors"
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
                <FiShoppingBag
                  size={15}
                  className="flex-shrink-0 text-[var(--text-muted)] group-hover:text-rose-500"
                />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate">
                    {exp.description}
                  </p>
                  <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                    {exp.categoryID?.name || "Uncategorized"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <div className="text-right">
                  <p className="text-[13.5px] font-semibold text-rose-500">
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
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
