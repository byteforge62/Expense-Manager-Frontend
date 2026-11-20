import { motion } from "framer-motion";

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

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: ₹{p.value?.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

const BudgetProgress = ({ pct }) => {
  const color =
    pct >= 90
      ? "var(--negative)"
      : pct >= 70
        ? "var(--warning)"
        : "var(--positive)";
  return (
    <div className="h-2 rounded-full bg-[var(--surface-tertiary)] overflow-hidden">
      <motion.div
        data-testid="budget-progress"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ backgroundColor: color }}
        className="h-full rounded-full"
      />
    </div>
  );
};

const Field = ({ label, icon, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-[var(--text-muted)] tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10 transition-colors group-focus-within:text-emerald-500">
          {icon}
        </span>
      )}
      {children}
    </div>
    {error && (
      <p className="flex items-center gap-1.5 text-rose-500 text-[11px] font-medium animate-in fade-in slide-in-from-top-1 ml-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

export { Shimmer, ChartTooltip, BudgetProgress, Field };
