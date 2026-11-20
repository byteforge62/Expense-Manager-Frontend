import { motion } from "framer-motion";
import { FiTarget } from "react-icons/fi";
import { BudgetProgress } from "./budgetUi";

const OverviewTab = ({ summary, onAdd }) => (
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
          onClick={onAdd}
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
              key={item.id}
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
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 tracking-wider">
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
                <span className="text-[var(--text-muted)] tracking-wide">
                  SPENT:{" "}
                  <span className="text-rose-500">
                    ₹{item.spent.toLocaleString("en-IN")}
                  </span>
                </span>
                <span
                  className={`tracking-wide ${item.remaining >= 0 ? "text-emerald-500" : "text-rose-500"}`}
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
);

export default OverviewTab;
