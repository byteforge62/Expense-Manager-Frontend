import { FiPlus, FiTrendingDown, FiShoppingBag, FiTrash2 } from "react-icons/fi";

const fieldCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2 py-1.5 text-[10.5px] font-medium text-[var(--text-primary)] outline-none focus:border-rose-500/60";

const ExpenseRecordsTab = ({
  filters,
  categories,
  expenses,
  onFilterChange,
  onClearFilters,
  onAdd,
  onDelete,
}) => (
  <section
    aria-labelledby="expense-ledger-heading"
    className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] shadow-sm"
  >
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border)] px-3 py-2">
      <h3
        id="expense-ledger-heading"
        className="text-[11.5px] font-semibold text-[var(--text-primary)]"
      >
        Financial Ledger
      </h3>
      <span className="text-[10px] font-medium text-[var(--text-muted)] tabular-nums">
        {expenses.length} Records
      </span>
      <button
        onClick={onClearFilters}
        className="ml-auto px-1 text-[10px] font-semibold text-rose-500 hover:underline"
      >
        Clear All
      </button>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2 py-1 text-[10px] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-tertiary)]"
      >
        <FiPlus size={11} className="text-rose-500" /> NEW RECORD
      </button>
    </div>

    {/* Filter row: one line on desktop, two on narrow screens */}
    <div className="grid grid-cols-2 gap-1.5 border-b border-[var(--border)] bg-[var(--surface-secondary)]/40 p-2 sm:grid-cols-4">
      <select
        name="datePreset"
        value={filters.datePreset}
        onChange={onFilterChange}
        className={fieldCls}
      >
        <option value="all">All Time</option>
        <option value="thisMonth">This Month</option>
        <option value="last3Months">Last 3 Months</option>
        <option value="custom">Custom Range</option>
      </select>

      <select
        name="categoryID"
        value={filters.categoryID}
        onChange={onFilterChange}
        className={fieldCls}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        name="minAmount"
        value={filters.minAmount}
        onChange={onFilterChange}
        placeholder="Min ₹"
        className={fieldCls}
      />
      <input
        type="number"
        name="maxAmount"
        value={filters.maxAmount}
        onChange={onFilterChange}
        placeholder="Max ₹"
        className={fieldCls}
      />

      {filters.datePreset === "custom" && (
        <>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={onFilterChange}
            className={fieldCls}
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={onFilterChange}
            className={fieldCls}
          />
        </>
      )}
    </div>

    {expenses.length === 0 ? (
      <div className="flex flex-col items-center gap-1.5 py-8 text-center">
        <FiTrendingDown size={20} className="text-rose-500 opacity-40" />
        <p className="text-[11.5px] font-semibold text-[var(--text-primary)]">
          Your records are empty
        </p>
        <p className="text-[10.5px] text-[var(--text-muted)]">
          Start tracking your expenses by adding a new record.
        </p>
        <button
          onClick={onAdd}
          className="mt-1 rounded-lg bg-rose-500 px-3 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-rose-600"
        >
          + REGISTER EXPENSE
        </button>
      </div>
    ) : (
      <>
        <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,0.85fr)_auto_auto_28px] gap-2 border-b border-[var(--border)] px-3 py-1.5 sm:grid">
          {["Description", "Category", "Amount", "Entry Date", ""].map((h, i) => (
            <span
              key={i}
              className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
            >
              {h}
            </span>
          ))}
        </div>

        <div className="max-h-[calc(100vh-565px)] min-h-[168px] divide-y divide-[var(--border)] overflow-y-auto">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className="group grid grid-cols-[minmax(0,1fr)_auto_auto_28px] items-center gap-2 px-3 py-1.5 hover:bg-[var(--surface-secondary)] sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.85fr)_auto_auto_28px]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-tertiary)] transition-colors group-hover:border-rose-500/20 group-hover:bg-rose-500/10">
                  <FiShoppingBag
                    size={11}
                    className="text-[var(--text-muted)] group-hover:text-rose-500"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-semibold text-[var(--text-primary)]">
                    {expense.description}
                  </p>
                  <p className="truncate text-[9.5px] text-[var(--text-muted)] sm:hidden">
                    {expense.categoryID?.name || "Other"} ·{" "}
                    {new Date(expense.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>

              <span className="hidden truncate rounded-full border border-[var(--border)] bg-[var(--surface-tertiary)] px-2 py-0.5 text-[9.5px] font-semibold text-[var(--text-secondary)] sm:inline-block">
                {expense.categoryID?.name || "Other"}
              </span>

              <span className="whitespace-nowrap text-right text-[11.5px] font-bold text-rose-500 tabular-nums sm:text-left">
                ₹{expense.amount.toLocaleString("en-IN")}
              </span>

              <span className="hidden whitespace-nowrap text-[10px] font-medium text-[var(--text-muted)] sm:block">
                {new Date(expense.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <button
                onClick={() => onDelete(expense._id)}
                title="Delete Record"
                className="grid h-6 w-6 place-items-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-rose-500 hover:text-white"
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </>
    )}
  </section>
);

export default ExpenseRecordsTab;
