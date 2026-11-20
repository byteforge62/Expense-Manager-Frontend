import { motion } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";
import { FiTrendingUp, FiCalendar, FiPlus } from "react-icons/fi";
import { sourceConfig } from "./incomeConfig";

const RecordsTab = ({ incomes, onDelete, onAdd }) => (
  <motion.div
    key="records"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="space-y-6"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          Financial Records
        </h3>
        <span className="text-[11px] font-bold text-[var(--text-muted)] tracking-wider">
          {incomes.length} Entries
        </span>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-secondary)]
                   border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]
                   hover:border-cyan-500/30 transition-all shadow-sm active:scale-95"
      >
        <FiPlus size={14} className="text-cyan-500" /> NEW RECORD
      </button>
    </div>

    {incomes.length === 0 ? (
      <div className="flex flex-col items-center gap-4 py-24 text-center rounded-3xl border border-[var(--border)] bg-[var(--surface-secondary)]/20 shadow-inner">
        <div className="w-16 h-16 rounded-3xl bg-[var(--surface-primary)] border border-[var(--border)] flex items-center justify-center shadow-lg">
          <FiTrendingUp
            size={32}
            className="text-[var(--text-muted)] opacity-30"
          />
        </div>
        <p className="text-sm font-bold text-[var(--text-primary)]">
          Income ledger is empty
        </p>
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {incomes.map((income, idx) => {
          const src =
            sourceConfig[income.source] || sourceConfig.Other;
          return (
            <motion.div
              key={income._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              whileHover={{ y: -2 }}
              className="group rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] p-6 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rotate-45 translate-x-10 -translate-y-10" />
              <div className="flex items-start justify-between relative z-10 mb-6">
                <span
                  className={`inline-flex items-center gap-2 text-[10px] font-extrabold px-3 py-1.5 rounded-full border shadow-sm tracking-wider ${src.bg} ${src.color}`}
                >
                  {income.source}
                </span>
                <button
                  onClick={() => onDelete(income._id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-90 border border-transparent hover:border-rose-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="relative z-10">
                <p
                  className={`text-3xl font-extrabold tracking-tight ${src.color}`}
                >
                  ₹{income.amount.toLocaleString("en-IN")}
                </p>
                <p className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] mt-2 tracking-widest">
                  <FiCalendar size={12} className="text-cyan-500" />
                  {new Date(income.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    )}
  </motion.div>
);

export default RecordsTab;
