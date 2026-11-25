import { FiShoppingBag } from "react-icons/fi";

const RecentExpensesPanel = ({ recentExpenses, onAdd }) => (
  <section
    aria-labelledby="recent-expenses-heading"
    className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] shadow-sm"
  >
    <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
      <div className="flex items-center gap-1.5">
        <FiShoppingBag size={12} className="text-rose-500" />
        <h3
          id="recent-expenses-heading"
          className="text-[11.5px] font-semibold text-[var(--text-primary)]"
        >
          Recent Expenses
        </h3>
      </div>
      <span className="text-[10px] font-medium text-[var(--text-muted)] tabular-nums">
        {recentExpenses.length} Entries
      </span>
    </div>

    {recentExpenses.length === 0 ? (
      <div className="flex flex-col items-center gap-1.5 py-6 text-center">
        <FiShoppingBag size={18} className="text-[var(--text-muted)] opacity-30" />
        <p className="text-[11px] font-medium text-[var(--text-muted)]">
          No recent expenses found.
        </p>
        <button
          onClick={onAdd}
          className="text-[10px] font-semibold text-rose-500 transition-colors hover:text-rose-400"
        >
          + Add New Expense
        </button>
      </div>
    ) : (
      <ul className="max-h-[calc(100vh-760px)] min-h-[120px] overflow-y-auto">
        {recentExpenses.map((exp) => (
          <li
            key={exp._id}
            className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-1.5 last:border-b-0 hover:bg-[var(--surface-secondary)]"
          >
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-tertiary)]">
              <FiShoppingBag size={11} className="text-[var(--text-muted)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-semibold text-[var(--text-primary)]">
                {exp.description}
              </p>
              <p className="flex min-w-0 items-center gap-1 text-[9.5px] text-[var(--text-muted)]">
                <span className="truncate">
                  {exp.categoryID?.name || "Uncategorized"}
                </span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">
                  {new Date(exp.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </p>
            </div>
            <span className="whitespace-nowrap text-[11.5px] font-bold text-rose-500 tabular-nums">
              ₹{exp.amount.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default RecentExpensesPanel;
