import { FiTrendingDown, FiCalendar, FiDollarSign, FiTag } from "react-icons/fi";

/* Four figures about one dataset belong in one frame. Hairlines separate
   them; the numbers carry the weight, the labels stay quiet. */

const ExpenseStatCards = ({
  totalExpenses,
  thisMonthTotal,
  avgExpense,
  topCategory,
}) => (
  <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] shadow-[var(--shadow-panel)] sm:grid-cols-2 lg:grid-cols-4">
    {[
      {
        label: "Total Expenses",
        value: `₹${totalExpenses.toLocaleString("en-IN")}`,
        color: "var(--negative)",
        icon: <FiTrendingDown size={15} />,
      },
      {
        label: "This Month",
        value: `₹${thisMonthTotal.toLocaleString("en-IN")}`,
        color: "var(--primary)",
        icon: <FiCalendar size={15} />,
      },
      {
        label: "Avg per Entry",
        value: `₹${Math.round(avgExpense).toLocaleString("en-IN")}`,
        color: "var(--text-muted)",
        icon: <FiDollarSign size={15} />,
      },
      {
        label: "Top Category",
        value: topCategory,
        color: "var(--text-muted)",
        icon: <FiTag size={15} />,
      },
    ].map((card) => (
      <div key={card.label} className="min-w-0 bg-[var(--surface-primary)] p-5">
        <div className="flex items-center gap-2">
          <span style={{ color: card.color, display: "flex" }}>{card.icon}</span>
          <p className="truncate text-[12.5px] font-medium text-[var(--text-muted)]">
            {card.label}
          </p>
        </div>
        <p
          className="mt-2.5 truncate text-[1.6rem] font-bold leading-none tracking-tight text-[var(--text-primary)]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {card.value}
        </p>
      </div>
    ))}
  </div>
);

export default ExpenseStatCards;
