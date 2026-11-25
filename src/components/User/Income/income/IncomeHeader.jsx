import { FiPlus } from "react-icons/fi";

const IncomeHeader = ({ onAdd }) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
        Income
      </h1>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
        Review income sources and trends, and manage recurring income.
      </p>
    </div>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-1.5 self-start rounded-lg bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
    >
      <FiPlus size={14} /> Add income
    </button>
  </div>
);

export default IncomeHeader;
