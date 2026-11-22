import { motion } from "framer-motion";
import { FiPlus, FiTrendingDown, FiShoppingBag, FiTrash2 } from "react-icons/fi";

const ExpenseRecordsTab = ({
  filters,
  categories,
  expenses,
  onFilterChange,
  onClearFilters,
  onAdd,
  onDelete,
}) => (
  <motion.div
    key="records"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="space-y-4"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
          Financial Ledger
        </h3>
        <span className="text-[11px] font-bold text-[var(--text-muted)] tracking-wider">
          {expenses.length} Records
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClearFilters}
          className="text-[11px] font-bold text-rose-500 tracking-normal hover:underline px-2"
        >
          Clear All
        </button>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-secondary)]
                    border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]
                    hover:border-rose-500/30 transition-all shadow-sm active:scale-95"
        >
          <FiPlus size={14} className="text-rose-500" /> NEW RECORD
        </button>
      </div>
    </div>

    {/* Filter Bar */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-[var(--surface-primary)] border border-[var(--border)] rounded-2xl shadow-sm">
      <select
        name="datePreset"
        value={filters.datePreset}
        onChange={onFilterChange}
        className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-rose-500/50"
      >
        <option value="all">All Time</option>
        <option value="thisMonth">This Month</option>
        <option value="last3Months">Last 3 Months</option>
        <option value="custom">Custom Range</option>
      </select>

      {filters.datePreset === "custom" && (
        <>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={onFilterChange}
            className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={onFilterChange}
            className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
          />
        </>
      )}

      <select
        name="categoryID"
        value={filters.categoryID}
        onChange={onFilterChange}
        className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-rose-500/50"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <input
          type="number"
          name="minAmount"
          value={filters.minAmount}
          onChange={onFilterChange}
          placeholder="Min ₹"
          className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
        />
        <input
          type="number"
          name="maxAmount"
          value={filters.maxAmount}
          onChange={onFilterChange}
          placeholder="Max ₹"
          className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
        />
      </div>
    </div>

    {expenses.length === 0 ? (
      <div className="flex flex-col items-center gap-4 py-20 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)]/20 shadow-inner">
        <div className="w-16 h-16 rounded-3xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center shadow-lg">
          <FiTrendingDown size={28} className="text-rose-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            Your records are empty
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
            Start tracking your expenses by adding a new record.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="mt-2 text-xs font-extrabold text-white bg-rose-500 px-5 py-2.5 rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-none"
        >
          + REGISTER EXPENSE
        </button>
      </div>
    ) : (
      <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50">
          {[
            "Description",
            "Category",
            "Amount",
            "Entry Date",
            "Action",
          ].map((h, i) => (
            <span
              key={i}
              className="text-[11px] font-bold text-[var(--text-muted)] tracking-[0.15em]"
            >
              {h}
            </span>
          ))}
        </div>

        <div className="divide-y divide-[var(--border)]">
          {expenses.map((expense, i) => (
            <motion.div
              key={expense._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex sm:grid sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-4
                         px-6 py-4 hover:bg-[var(--surface-secondary)] transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/10 group-hover:border-rose-500/20 transition-all shadow-sm">
                  <FiShoppingBag
                    size={14}
                    className="text-[var(--text-muted)] group-hover:text-rose-500"
                  />
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {expense.description}
                </p>
              </div>

              <div className="hidden sm:block">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[var(--surface-tertiary)] border border-[var(--border)] text-[var(--text-secondary)] tracking-wider">
                  {expense.categoryID?.name || "Other"}
                </span>
              </div>

              <div className="text-right sm:text-left">
                <span className="text-sm font-extrabold text-rose-500">
                  ₹{expense.amount.toLocaleString("en-IN")}
                </span>
              </div>

              <span className="hidden sm:block text-[11px] font-semibold text-[var(--text-muted)]">
                {new Date(expense.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <button
                onClick={() => onDelete(expense._id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                           text-[var(--text-muted)] hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-90 border border-transparent hover:border-rose-600"
                title="Delete Record"
              >
                <FiTrash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

export default ExpenseRecordsTab;
