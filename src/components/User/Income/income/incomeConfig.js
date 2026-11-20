// --- CONFIG & UTILS ---
const sourceConfig = {
  Salary: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Salary",
  },
  Freelancing: {
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    label: "Freelancing",
  },
  Investments: {
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    label: "Investments",
  },
  Other: {
    color: "text-[var(--text-muted)]",
    bg: "bg-[var(--surface-tertiary)] border-[var(--border)]",
    label: "Other",
  },
};

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 hover:bg-[var(--surface-tertiary)] transition-all duration-200 shadow-sm";
const selectCls =
  "w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 hover:bg-[var(--surface-tertiary)] transition-all duration-200 appearance-none shadow-sm cursor-pointer";

export { sourceConfig, inputCls, selectCls };
