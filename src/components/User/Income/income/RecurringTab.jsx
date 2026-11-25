import { FaPauseCircle, FaTrashAlt } from "react-icons/fa";
import {
  FiRepeat,
  FiChevronDown,
  FiRefreshCw,
  FiZap,
  FiPlus,
} from "react-icons/fi";

const fieldCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1.5 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-cyan-500/60";

const RecurringTab = ({
  form,
  onChange,
  onSubmit,
  isLoading,
  payments,
  onDelete,
}) => (
  <div className="space-y-2.5">
    <section
      aria-labelledby="recurring-income-heading"
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
            <FiRepeat size={14} className="text-cyan-500" />
          </span>
          <div>
            <h2
              id="recurring-income-heading"
              className="text-[11.5px] font-semibold text-[var(--text-primary)]"
            >
              Recurring income
            </h2>
            <p className="text-[9.5px] font-semibold text-[var(--text-muted)]">
              Manage scheduled income entries.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-500">
          {payments.length} RUNNING
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-2.5 border-t border-[var(--border)] pt-2.5">
        <h3 className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-[var(--text-primary)]">
          <FiPlus size={11} className="text-cyan-500" />
          PROVISION NEW AUTOMATION
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          <input
            type="text"
            name="name"
            placeholder="Wealth description"
            value={form.name}
            onChange={onChange}
            className={`${fieldCls} col-span-2`}
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Revenue (₹)"
            value={form.amount}
            onChange={onChange}
            className={fieldCls}
            required
          />
          <div className="relative">
            <select
              name="frequency"
              value={form.frequency}
              onChange={onChange}
              className={`${fieldCls} appearance-none pr-6`}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            className={fieldCls}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Classification (LOB)"
            value={form.category}
            onChange={onChange}
            className={fieldCls}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-[10.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <FiRefreshCw size={12} className="animate-spin" /> EXECUTING...
              </>
            ) : (
              <>
                <FiZap size={12} /> ACTIVATE TASK
              </>
            )}
          </button>
        </div>
      </form>
    </section>

    <section
      aria-labelledby="active-recurring-heading"
      className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <h3
          id="active-recurring-heading"
          className="text-[11px] font-semibold text-[var(--text-primary)]"
        >
          Active Revenue Operations
        </h3>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-6">
          <FiRepeat size={18} className="text-[var(--text-muted)] opacity-30" />
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">
            No active schedules
          </p>
        </div>
      ) : (
        <ul className="max-h-[152px] divide-y divide-[var(--border)] overflow-y-auto">
          {payments.map((pay) => (
            <li
              key={pay._id}
              className="flex items-center gap-2 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-[var(--text-primary)]">
                  {pay.name}
                </p>
                <p className="mt-0.5 text-[9.5px] text-[var(--text-muted)]">
                  <span>{pay.frequency}</span> ·{" "}
                  <span>
                    {new Date(pay.startDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <span className="text-[11px] font-bold tabular-nums text-emerald-500">
                ₹{pay.amount.toLocaleString("en-IN")}
              </span>
              <button
                onClick={() => alert("Logic coming soon")}
                aria-label={`Pause ${pay.name}`}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-amber-500/10 hover:text-amber-500"
              >
                <FaPauseCircle size={12} />
              </button>
              <button
                onClick={() => onDelete(pay._id)}
                aria-label={`Delete ${pay.name}`}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
              >
                <FaTrashAlt size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  </div>
);

export default RecurringTab;
