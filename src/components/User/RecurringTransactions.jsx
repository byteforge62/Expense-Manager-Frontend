import { useState, useEffect, useMemo, useCallback } from "react";
import axiosInstance from "../Utils/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import { fetchRecurring } from "../../redux/income/incomeSlice";
import { LazyMotion, m, AnimatePresence, domAnimation } from "framer-motion";
import {
  FiRepeat,
  FiEdit2,
  FiTrash2,
  FiPause,
  FiPlay,
  FiPlus,
  FiX,
  FiCalendar,
  FiTag,
  FiDollarSign,
  FiClock,
  FiRefreshCw,
  FiActivity,
} from "react-icons/fi";

// --- ATOMIC UI & STYLING ---
const Shimmer = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-[var(--surface-tertiary)] rounded-xl ${className}`}
  >
    <div
      className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                    bg-gradient-to-r from-transparent via-[var(--surface-primary)]/10 to-transparent"
    />
  </div>
);

const Field = ({ label, icon, children }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-cyan-500 transition-colors z-10 pointer-events-none">
          {icon}
        </span>
      )}
      {children}
    </div>
  </div>
);

const inputCls =
  "w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-300";
const selectCls =
  "w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all duration-300 appearance-none cursor-pointer";

const freqConfig = {
  daily: { color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  weekly: {
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  monthly: { color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" },
  yearly: {
    color: "text-violet-500",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
};

// --- MAIN COMPONENT ---
export const RecurringTransactions = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id;
  const { recurringPayments: recurringList, loading } = useSelector(
    (state) => state.income,
  );

  // --- STATE ---
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    frequency: "monthly",
    nextDate: "",
  });

  // --- ACTIONS & LOGIC ---

  const fetchRecurringList = useCallback(() => {
    if (userId) {
      dispatch(fetchRecurring());
    }
  }, [dispatch, userId]);

  const deleteRecurring = async (id) => {
    try {
      await axiosInstance.delete(`/recurring/${id}`);
      fetchRecurringList();
    } catch (error) {
      console.error("Error Deleting recurring:", error);
    }
  };

  const toggleRecurring = async (id) => {
    try {
      await axiosInstance.patch(`/recurring/toggle/${id}`);
      fetchRecurringList();
    } catch (error) {
      console.error("Error toggling recurring", error);
    }
  };

  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(formData.amount);

    if (!formData.title.trim()) {
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid amount greater than zero.");
      return;
    }

    if (!formData.category.trim()) {
      alert("Please enter a category.");
      return;
    }

    if (!formData.nextDate) {
      alert("Please select the next execution date.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        amount,
        category: formData.category.trim(),
        frequency: formData.frequency,
        nextDate: formData.nextDate,
      };

      if (editingId) {
        await axiosInstance.put(`/recurring/${editingId}`, payload);
      } else {
        await axiosInstance.post("/recurring", payload);
      }

      await dispatch(fetchRecurring()).unwrap();

      handleCancelEdit();
    } catch (error) {
      console.error(
        "Recurring transaction error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to save recurring transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      amount: item.amount,
      category: item.category,
      frequency: item.frequency,
      nextDate: item.nextDate.slice(0, 10),
    });
    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setFormData({
      title: "",
      amount: "",
      category: "",
      frequency: "monthly",
      nextDate: "",
    });
    setEditingId(null);
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    fetchRecurringList();
  }, [fetchRecurringList]);
  // --- MEMOIZED ANALYTICS DERIVATION ---
  const { activeCount, pausedCount, monthlyTotal, nextDue } = useMemo(() => {
    const active = recurringList.filter((r) => r.isActive !== false);
    const paused = recurringList.length - active.length;

    const totalBurn = active.reduce((sum, r) => {
      if (r.frequency === "monthly") return sum + r.amount;
      if (r.frequency === "yearly") return sum + r.amount / 12;
      if (r.frequency === "weekly") return sum + r.amount * 4.33;
      if (r.frequency === "daily") return sum + r.amount * 30;
      return sum;
    }, 0);

    const dueItems = active.filter((r) => r.nextDate);
    const earliestDue =
      dueItems.length > 0
        ? dueItems.reduce((earliest, current) =>
          new Date(current.nextDate) < new Date(earliest.nextDate)
            ? current
            : earliest,
        )
        : null;

    return {
      activeCount: active.length,
      pausedCount: paused,
      monthlyTotal: totalBurn,
      nextDue: earliestDue,
    };
  }, [recurringList]);
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 text-[var(--text-primary)] pb-10"
      >
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent uppercase">
              Automated Flows
            </h1>
            <p className="text-sm font-bold text-[var(--text-muted)] mt-1 uppercase tracking-[0.2em]">
              Protocols for Recurring Capital Events
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-sm transition-all
          ${activeCount > 0 ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-500" : "bg-[var(--surface-primary)] border-[var(--border)] text-[var(--text-muted)]"}`}
          >
            <FiActivity
              size={12}
              className={activeCount > 0 ? "animate-pulse" : ""}
            />
            {activeCount} OPERATIONAL · {pausedCount} SUSPENDED
          </div>
        </div>

        {/* ── ANALYTICS GRID ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Total Vectors",
              value: recurringList.length,
              suffix: "PROTOCOLS",
              color: "text-cyan-500",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
              glow: "bg-cyan-500",
              icon: <FiRepeat size={18} />,
            },
            {
              label: "Active Nodes",
              value: activeCount,
              suffix: "EXECUTING",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
              glow: "bg-emerald-500",
              icon: <FiPlay size={18} />,
            },
            {
              label: "Burn Velocity",
              value: `₹${Math.round(monthlyTotal).toLocaleString("en-IN")}`,
              suffix: "PER CYCLE",
              color: "text-rose-500",
              bg: "bg-rose-500/10",
              border: "border-rose-500/20",
              glow: "bg-rose-500",
              icon: <FiDollarSign size={18} />,
            },
            {
              label: "Critical Marker",
              value: nextDue
                ? new Date(nextDue.nextDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
                : "N/A",
              suffix: nextDue?.title || "NO PENDING",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
              glow: "bg-amber-500",
              icon: <FiCalendar size={18} />,
            },
          ].map((card, idx) => (
            <m.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`relative overflow-hidden rounded-[2rem] border p-6 bg-[var(--surface-primary)] ${card.border} shadow-xl backdrop-blur-md group hover:-translate-y-1 transition-all duration-300`}
            >
              <div
                className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 ${card.glow} group-hover:opacity-20 transition-opacity`}
              />
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 border shadow-inner ${card.bg} ${card.border}`}
                >
                  <span className={card.color}>{card.icon}</span>
                </div>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">
                  {card.label}
                </p>
                <p
                  className={`text-2xl font-black tracking-tighter truncate ${card.color}`}
                >
                  {card.value}
                </p>
                <p className="text-[9px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest opacity-60 truncate">
                  {card.suffix}
                </p>
              </div>
            </m.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Construct Module (Form) */}
          <div className="lg:col-span-5">
            <m.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2.5rem] bg-[var(--surface-primary)] border border-[var(--border)] shadow-2xl overflow-hidden backdrop-blur-md sticky top-24"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--surface-secondary)]/30">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner
                  ${editingId ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-500"}`}
                  >
                    {editingId ? <FiEdit2 size={18} /> : <FiPlus size={18} />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                      {editingId ? "Modify Protocol" : "Initialize Flow"}
                    </h2>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-0.5">
                      Vector Definition
                    </p>
                  </div>
                </div>
                {editingId && (
                  <button
                    type="button"
                    aria-label="Cancel edit"
                    onClick={handleCancelEdit}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-90"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <Field label="Protocol Title" icon={<FiRepeat size={14} />}>
                  <input
                    aria-label="Recurring transaction title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Subscription Alpha..."
                    className={inputCls}
                    required
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Magnitude (₹)"
                    icon={<FiDollarSign size={14} />}
                  >
                    <input
                      aria-label="Recurring transaction amount"
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={inputCls}
                      required
                    />
                  </Field>
                  <Field
                    label="Temporal Cycle"
                    icon={<FiRefreshCw size={14} />}
                  >
                    <select
                      aria-label="Recurring transaction frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className={selectCls}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </Field>
                </div>

                <Field label="Sector Category" icon={<FiTag size={14} />}>
                  <input
                    aria-label="Reccurring transaction category"
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Infrastructure..."
                    className={inputCls}
                  />
                </Field>

                <Field label="Target Execution" icon={<FiCalendar size={14} />}>
                  <input
                    aria-label="Next recurring transaction date"
                    type="date"
                    name="nextDate"
                    value={formData.nextDate}
                    onChange={handleChange}
                    className={inputCls}
                    required
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all duration-300 shadow-2xl active:scale-[0.98] disabled:opacity-50
                ${editingId ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30" : "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30"}`}
                >
                  {submitting ? (
                    <FiRefreshCw size={16} className="animate-spin mx-auto" />
                  ) : editingId ? (
                    "Save Modification"
                  ) : (
                    "Deploy Protocol"
                  )}
                </button>
              </form>
            </m.div>
          </div>

          {/* Operation Ledger (List) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-primary)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                  <FiRepeat size={16} className="text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                    Active Inventory
                  </h2>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                    Execution Registry
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-black text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 uppercase tracking-[0.2em]">
                {recurringList.length} TELEMETRIES
              </span>
            </div>

            <div className="rounded-[2.5rem] bg-[var(--surface-primary)] border border-[var(--border)] shadow-2xl overflow-hidden backdrop-blur-md">
              {loading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Shimmer key={i} className="h-24 rounded-[2rem]" />
                  ))}
                </div>
              ) : recurringList.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-24 text-center">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                    <FiRepeat
                      size={40}
                      className="text-[var(--text-muted)] opacity-20"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">
                      No active protocols
                    </p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest max-w-[200px]">
                      Define your first recurring capital event in the
                      constructor.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  <AnimatePresence>
                    {recurringList.map((item, i) => {
                      const freq =
                        freqConfig[item.frequency] || freqConfig.monthly;
                      const isActive = item.isActive !== false;
                      const isEditing = editingId === item._id;
                      return (
                        <m.div
                          key={item._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-8 hover:bg-[var(--surface-secondary)]/50 transition-all group flex flex-col sm:flex-row items-center gap-6
                          ${isEditing ? "bg-amber-500/5 ring-2 ring-inset ring-amber-500/20 shadow-inner" : ""}
                          ${!isActive ? "opacity-60 grayscale" : ""}`}
                        >
                          {/* Status + Label */}
                          <div className="flex-1 min-w-0 flex items-center gap-6 w-full">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner transition-transform group-hover:scale-110
                            ${isActive ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-500" : "bg-[var(--surface-tertiary)] border-[var(--border)] text-[var(--text-muted)]"}`}
                            >
                              <FiRepeat size={24} />
                            </div>
                            <div className="min-w-0 space-y-2">
                              <h4 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight truncate group-hover:text-cyan-500 transition-colors">
                                {item.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${freq.bg} ${freq.color}`}
                                >
                                  {item.frequency}
                                </span>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                  <FiClock
                                    size={11}
                                    className="text-cyan-500"
                                  />
                                  {new Date(item.nextDate).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "long" },
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Value + Actions */}
                          <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto">
                            <p className="text-2xl font-black tracking-tighter text-emerald-500 group-hover:scale-105 transition-transform origin-right">
                              ₹{Number(item.amount).toLocaleString("en-IN")}
                            </p>
                            <div className="flex items-center gap-1.5 bg-[var(--surface-tertiary)]/50 p-1.5 rounded-2xl border border-[var(--border)] self-start sm:self-auto">
                              <button
                                type="button"
                                aria-label="Edit recurring transaction"
                                onClick={() => handleEdit(item)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                type="button"
                                aria-label={
                                  isActive
                                    ? "Pause recurring transaction"
                                    : "Resume recurring transaction"
                                }
                                onClick={() => toggleRecurring(item._id)}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border border-transparent
                              ${isActive
                                    ? "text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/20"
                                    : "text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20"
                                  }`}
                              >
                                {isActive ? (
                                  <FiPause size={16} />
                                ) : (
                                  <FiPlay size={16} />
                                )}
                              </button>
                              <button
                                type="button"
                                aria-label="Delete recurring transaction"
                                onClick={() => deleteRecurring(item._id)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </m.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
};
