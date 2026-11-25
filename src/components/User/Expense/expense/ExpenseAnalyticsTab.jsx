import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FiBarChart2, FiTag } from "react-icons/fi";
import { ChartTooltip } from "./expenseUi";
import { COLORS } from "./expenseConfig";

const axisTick = { fill: "var(--text-muted)", fontSize: 9, fontWeight: 500 };

const CardShell = ({ id, icon, tone, title, aside, children }) => (
  <section
    aria-labelledby={id}
    className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-sm"
  >
    <div className="mb-2 flex items-center gap-1.5">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-lg border ${tone}`}
      >
        {icon}
      </span>
      <h3 id={id} className="text-[11.5px] font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      {aside && (
        <span className="ml-auto whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {aside}
        </span>
      )}
    </div>
    {children}
  </section>
);

export const MonthlyTrendCard = ({ chartData }) => (
  <CardShell
    id="expense-trend-heading"
    icon={<FiBarChart2 size={12} className="text-rose-500" />}
    tone="border-rose-500/20 bg-rose-500/10"
    title="Monthly trend"
    aside="Last 12 months"
  >
    <ResponsiveContainer width="100%" height={132}>
      <BarChart data={chartData} barSize={10}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
          opacity={0.3}
        />
        <XAxis
          dataKey="month"
          stroke="var(--border)"
          tick={axisTick}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="var(--border)"
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "var(--surface-tertiary)", opacity: 0.1 }}
        />
        <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </CardShell>
);

export const CategoryMixCard = ({ categoryBreakdown }) => {
  const total = categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <CardShell
      id="expense-breakdown-heading"
      icon={<FiTag size={12} className="text-cyan-500" />}
      tone="border-cyan-500/20 bg-cyan-500/10"
      title="Spending Breakdown"
      aside={`${categoryBreakdown.length} categories`}
    >
      {categoryBreakdown.length === 0 ? (
        <div className="flex h-[132px] flex-col items-center justify-center gap-1.5">
          <FiTag size={18} className="text-[var(--text-muted)] opacity-30" />
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">
            No categorization data available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-2">
          <div className="h-[112px] w-[112px]">
            <ResponsiveContainer width="100%" height={112}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={54}
                  innerRadius={38}
                  paddingAngle={3}
                  label={false}
                >
                  {categoryBreakdown.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="max-h-[112px] space-y-1 overflow-y-auto pr-1">
            {categoryBreakdown.map((cat, i) => {
              const share = total > 0 ? Math.round((cat.value / total) * 100) : 0;
              return (
                <li key={cat.name + i} className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[var(--text-secondary)]">
                    {cat.name}
                  </span>
                  <span className="text-[9.5px] font-semibold text-[var(--text-muted)] tabular-nums">
                    {share}%
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-primary)] tabular-nums">
                    ₹{cat.value.toLocaleString("en-IN")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </CardShell>
  );
};

export default MonthlyTrendCard;
