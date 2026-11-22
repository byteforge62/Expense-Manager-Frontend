import {
  FiTarget,
  FiTrendingDown,
  FiDollarSign,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

const BudgetStatCards = ({
  totalAllocated,
  totalSpent,
  totalRemaining,
  overBudgetCount,
}) => (
  <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] shadow-[var(--shadow-panel)] sm:grid-cols-2 lg:grid-cols-4">
    {[
      {
        label: "Total Allocated",
        value: `₹${totalAllocated.toLocaleString("en-IN")}`,
        color: "var(--primary)",
        valueColor: "var(--text-primary)",
        icon: <FiTarget size={15} />,
      },
      {
        label: "Total Spent",
        value: `₹${totalSpent.toLocaleString("en-IN")}`,
        color: "var(--negative)",
        valueColor: "var(--text-primary)",
        icon: <FiTrendingDown size={15} />,
      },
      {
        label: "Remaining",
        value: `₹${Math.abs(totalRemaining).toLocaleString("en-IN")}`,
        color: totalRemaining >= 0 ? "var(--positive)" : "var(--negative)",
        valueColor:
          totalRemaining >= 0 ? "var(--text-primary)" : "var(--negative)",
        icon: <FiDollarSign size={15} />,
      },
      {
        label: "Over Budget",
        value: overBudgetCount,
        color: overBudgetCount > 0 ? "var(--warning)" : "var(--positive)",
        valueColor:
          overBudgetCount > 0 ? "var(--warning)" : "var(--text-primary)",
        icon:
          overBudgetCount > 0 ? (
            <FiAlertTriangle size={15} />
          ) : (
            <FiCheckCircle size={15} />
          ),
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
          className="mt-2.5 truncate text-[1.6rem] font-bold leading-none tracking-tight"
          style={{
            color: card.valueColor,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {card.value}
        </p>
      </div>
    ))}
  </div>
);

export default BudgetStatCards;
