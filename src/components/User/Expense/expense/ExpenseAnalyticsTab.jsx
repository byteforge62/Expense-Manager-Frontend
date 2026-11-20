import { motion } from "framer-motion";
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

const ExpenseAnalyticsTab = ({ chartData, categoryBreakdown }) => (
  <motion.div
    key="analytics"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
    className="grid grid-cols-1 xl:grid-cols-2 gap-6"
  >
    <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
          <FiBarChart2 size={14} className="text-rose-500" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Monthly trend
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} barSize={14}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
            opacity={0.3}
          />
          <XAxis
            dataKey="month"
            stroke="var(--border)"
            tick={{
              fill: "var(--text-muted)",
              fontSize: 11,
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="var(--border)"
            tick={{
              fill: "var(--text-muted)",
              fontSize: 11,
              fontWeight: 500,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--surface-tertiary)", opacity: 0.1 }}
          />
          <Bar dataKey="amount" fill="#e0564b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
          <FiTag size={14} className="text-cyan-500" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Spending Breakdown
        </h3>
      </div>

      {categoryBreakdown.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 gap-2">
          <FiTag size={32} className="text-[var(--border)]" />
          <p className="text-sm text-[var(--text-muted)] font-medium">
            No categorization data available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={55}
                paddingAngle={4}
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

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto px-2 custom-scrollbar">
            {categoryBreakdown.map((cat, i) => (
              <div
                key={i}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] truncate max-w-[80px]">
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-[var(--text-primary)]">
                  ₹{cat.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default ExpenseAnalyticsTab;
