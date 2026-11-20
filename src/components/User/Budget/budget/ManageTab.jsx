import { motion } from "framer-motion";
import { FiTarget, FiPlus, FiTrash2 } from "react-icons/fi";

const ManageTab = ({ budgets, onRequestDelete, onAdd }) => (
  <motion.div
    key="manage"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="space-y-4"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          Budget Configuration
        </h3>
        <span className="text-[11px] font-bold text-[var(--text-muted)] tracking-wider">
          {budgets.length} Items
        </span>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-secondary)]
                   border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]
                   hover:border-emerald-500/30 transition-all shadow-sm active:scale-95"
      >
        <FiPlus size={14} className="text-emerald-500" /> NEW BUDGET
      </button>
    </div>

    {budgets.length === 0 ? (
      <div className="flex flex-col items-center gap-4 py-20 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/20 shadow-inner">
        <div className="w-16 h-16 rounded-3xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center shadow-lg">
          <FiTarget size={28} className="text-emerald-500" />
        </div>
        <p className="text-sm font-bold text-[var(--text-primary)]">
          Static limits not found
        </p>
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b, idx) => (
          <motion.div
            key={b._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ y: -2 }}
            className="group rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rotate-45 translate-x-8 -translate-y-8" />

            <div className="flex items-start justify-between relative z-10">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {typeof b.categoryID === "object"
                    ? b.categoryID?.name
                    : b.description || "Uncategorized"}
                </p>
                <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 truncate max-w-[150px] tracking-wider">
                  {b.description || "NO DETAILS"}
                </p>
              </div>
              <button
                onClick={() => onRequestDelete(b)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-90 border border-transparent hover:border-rose-600"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
            <p className="text-2xl font-extrabold text-emerald-500 mt-6 tracking-tight">
              ₹{Number(b.amount).toLocaleString("en-IN")}
            </p>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
);

export default ManageTab;
