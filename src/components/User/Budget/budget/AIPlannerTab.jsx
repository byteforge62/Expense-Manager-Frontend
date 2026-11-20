import { motion } from "framer-motion";
import { FiCpu, FiRefreshCw, FiZap, FiTarget } from "react-icons/fi";
import { Shimmer } from "./budgetUi";

const AIPlannerTab = ({ plan, loading, onGenerate }) => (
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
              Budget planning
            </h2>
            <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1 tracking-wider">
              Suggestions based on your recorded spending.
            </p>
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
                     bg-[var(--primary)] text-white
                     hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
                     shadow-xl shadow-emerald-500/20"
        >
          {loading ? (
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

      {!plan && !loading && (
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

      {loading && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Shimmer key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Shimmer className="h-64 rounded-2xl" />
        </div>
      )}

      {plan && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Est. Income",
                value: `₹${plan.snapshot.income}`,
                color: "text-emerald-500",
                bg: "bg-emerald-500/5",
                border: "border-emerald-500/20",
                glow: "bg-emerald-500",
              },
              {
                label: "Fixed Costs",
                value: `₹${plan.snapshot.expenses}`,
                color: "text-rose-500",
                bg: "bg-rose-500/5",
                border: "border-rose-500/20",
                glow: "bg-rose-500",
              },
              {
                label: "Free Surplus",
                value: `₹${plan.snapshot.surplus}`,
                color: "text-cyan-500",
                bg: "bg-cyan-500/5",
                border: "border-cyan-500/20",
                glow: "bg-cyan-500",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative overflow-hidden rounded-2xl border p-5 ${s.bg} ${s.border} shadow-sm`}
              >
                <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest mb-1">
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
                <h3 className="text-[11px] font-bold text-[var(--text-primary)] tracking-widest">
                  Recommended Allocations
                </h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {plan.budgetPlan.map((item, i) => (
                  <motion.div
                    key={i}
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
                <h3 className="text-[11px] font-bold text-emerald-500 tracking-widest">
                  Actionable Insights
                </h3>
              </div>
              <ul className="space-y-4 relative z-10">
                {plan.recommendations.map((tip, i) => (
                  <li
                    key={i}
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
);

export default AIPlannerTab;
