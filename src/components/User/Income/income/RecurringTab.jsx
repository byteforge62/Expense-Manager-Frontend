import { motion } from "framer-motion";
import { FaPauseCircle, FaTrashAlt } from "react-icons/fa";
import {
  FiRepeat,
  FiPlus,
  FiChevronDown,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import { inputCls, selectCls } from "./incomeConfig";

const RecurringTab = ({
  form,
  onChange,
  onSubmit,
  isLoading,
  payments,
  onDelete,
}) => (
  <motion.div
    key="recurring"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
        <FiRepeat size={20} className="text-cyan-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Recurring income
        </h2>
        <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-wider">
          Manage scheduled income entries.
        </p>
      </div>
    </div>

    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-[var(--surface-secondary)]/30 border border-[var(--border)] p-6 shadow-inner relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none" />
      <h3 className="text-xs font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2 tracking-normal">
        <FiPlus size={14} className="text-cyan-500" />
        PROVISION NEW AUTOMATION
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Wealth description"
          value={form.name}
          onChange={onChange}
          className={inputCls}
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Revenue (₹)"
          value={form.amount}
          onChange={onChange}
          className={inputCls}
          required
        />
        <div className="relative group">
          <select
            name="frequency"
            value={form.frequency}
            onChange={onChange}
            className={selectCls}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none group-focus-within:text-cyan-500" />
        </div>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={onChange}
          className={inputCls}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Classification (LOB)"
          value={form.category}
          onChange={onChange}
          className={inputCls}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl
                     bg-[var(--primary)] text-sm font-bold text-white
                     hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200 shadow-xl shadow-cyan-500/30
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isLoading ? (
            <>
              <FiRefreshCw size={16} className="animate-spin" />{" "}
              EXECUTING...
            </>
          ) : (
            <>
              <FiZap size={16} /> ACTIVATE TASK
            </>
          )}
        </button>
      </div>
    </motion.form>

    <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-secondary)]/50">
        <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-normal">
          Active Revenue Operations
        </h3>
        <span className="text-[11px] font-extrabold text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20 tracking-normal">
          {payments.length} RUNNING
        </span>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-tertiary)] border border-[var(--border)] flex items-center justify-center opacity-30">
            <FiRepeat size={24} />
          </div>
          <p className="text-sm font-bold text-[var(--text-muted)] tracking-wider">
            No active schedules
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]/30">
                  {[
                    "Description",
                    "Amount",
                    "Interval",
                    "Next Run",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-[11px] font-bold text-[var(--text-muted)] tracking-[0.2em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payments.map((pay, i) => (
                  <motion.tr
                    key={pay._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-[var(--surface-secondary)]/50 transition-colors"
                  >
                    <td className="px-6 py-5 font-bold text-[var(--text-primary)]">
                      {pay.name}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-emerald-500 font-extrabold text-base">
                        ₹{pay.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 tracking-normal">
                        {pay.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[var(--text-muted)] font-bold text-xs tracking-wider">
                      {new Date(pay.startDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => alert("Logic coming soon")}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-amber-500/10 hover:text-amber-500 transition-all active:scale-90 border border-transparent hover:border-amber-500/20"
                        >
                          <FaPauseCircle size={15} />
                        </button>
                        <button
                          onClick={() =>
                            onDelete(pay._id)
                          }
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90 border border-transparent hover:border-rose-500/20"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-[var(--border)]">
            {payments.map((pay) => (
              <div
                key={pay._id}
                className="p-5 flex items-center justify-between group hover:bg-[var(--surface-secondary)]/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate tracking-wide">
                    {pay.name}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-emerald-500 text-sm font-extrabold">
                      ₹{pay.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
                      {pay.frequency}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 relative z-10">
                  <button
                    onClick={() => onDelete(pay._id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-500 bg-rose-500/5 border border-rose-500/10 active:scale-95 shadow-sm"
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </motion.div>
);

export default RecurringTab;
