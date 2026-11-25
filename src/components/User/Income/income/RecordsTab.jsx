import { TrashIcon } from "@heroicons/react/24/outline";
import { FiTrendingUp, FiPlus } from "react-icons/fi";
import { sourceConfig } from "./incomeConfig";

const RecordsTab = ({ incomes, onDelete, onAdd }) => (
  <section
    aria-labelledby="income-records-heading"
    className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-sm"
  >
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="flex items-baseline gap-1.5">
        <h3
          id="income-records-heading"
          className="text-[11.5px] font-semibold text-[var(--text-primary)]"
        >
          Financial Records
        </h3>
        <span className="text-[10px] font-semibold text-[var(--text-muted)]">
          {incomes.length} Entries
        </span>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2 py-1 text-[10px] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-tertiary)]"
      >
        <FiPlus size={11} className="text-cyan-500" /> NEW RECORD
      </button>
    </div>

    {incomes.length === 0 ? (
      <div className="flex flex-col items-center gap-1.5 py-6 text-center">
        <FiTrendingUp size={20} className="text-[var(--text-muted)] opacity-30" />
        <p className="text-xs font-semibold text-[var(--text-primary)]">
          Income ledger is empty
        </p>
      </div>
    ) : (
      <ul className="max-h-[196px] divide-y divide-[var(--border)] overflow-y-auto">
        {incomes.map((income) => {
          const src = sourceConfig[income.source] || sourceConfig.Other;
          return (
            <li
              key={income._id}
              className="group flex items-center gap-2 py-1.5"
            >
              <span
                className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${src.bg} ${src.color}`}
              >
                {income.source}
              </span>
              <span className="min-w-0 flex-1 truncate text-[10.5px] text-[var(--text-muted)]">
                {new Date(income.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className={`text-xs font-bold tabular-nums ${src.color}`}>
                ₹{income.amount.toLocaleString("en-IN")}
              </span>
              <button
                onClick={() => onDelete(income._id)}
                aria-label={`Delete ${income.source} income`}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

export default RecordsTab;
