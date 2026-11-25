/* The four expense figures read as one account statement line rather than a
   grid of cards, so this page keeps its own shape next to Income and Budgets. */

const ExpenseStatCards = ({
  totalExpenses,
  thisMonthTotal,
  avgExpense,
  topCategory,
}) => {
  const monthShare =
    totalExpenses > 0
      ? Math.min(100, Math.round((thisMonthTotal / totalExpenses) * 100))
      : 0;

  const metrics = [
    {
      label: "This Month",
      value: `₹${thisMonthTotal.toLocaleString("en-IN")}`,
      tone: "text-[var(--text-primary)]",
    },
    {
      label: "Avg per Entry",
      value: `₹${Math.round(avgExpense).toLocaleString("en-IN")}`,
      tone: "text-[var(--text-primary)]",
    },
    {
      label: "Top Category",
      value: topCategory,
      tone: "text-[var(--text-muted)]",
    },
  ];

  return (
    <section
      aria-label="Expense summary"
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2.5 shadow-sm"
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Total Expenses
          </p>
          <p className="mt-0.5 truncate text-xl font-bold leading-none tracking-tight text-rose-500 tabular-nums">
            ₹{totalExpenses.toLocaleString("en-IN")}
          </p>
        </div>

        <dl className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {metrics.map((metric) => (
            <div key={metric.label} className="min-w-0">
              <dt className="text-[9.5px] font-medium text-[var(--text-muted)]">
                {metric.label}
              </dt>
              <dd
                className={`mt-0.5 truncate text-[13px] font-semibold tabular-nums ${metric.tone}`}
              >
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-tertiary)]">
          <div
            className="h-full rounded-full bg-rose-500/70"
            style={{ width: `${monthShare}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-[9.5px] font-medium text-[var(--text-muted)]">
          {monthShare}% booked this month
        </span>
      </div>
    </section>
  );
};

export default ExpenseStatCards;
