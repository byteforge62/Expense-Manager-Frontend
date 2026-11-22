import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { FiPieChart, FiTarget } from "react-icons/fi";
import { ChartTooltip } from "./budgetUi";
import { COLORS } from "./budgetConfig";

const AnalyticsTab = ({ summary }) => (
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
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
          <FiPieChart size={14} className="text-cyan-500" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Spending by Category
        </h3>
      </div>
      {summary.length === 0 ? (
        <div className="flex items-center justify-center h-56 text-[var(--text-muted)] text-sm font-medium">
          No data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={summary.map((s) => ({
                  name: s.category,
                  value: s.spent,
                }))}
                dataKey="value"
                outerRadius={85}
                innerRadius={55}
                paddingAngle={4}
                label={false}
              >
                {summary.map((_, i) => (
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
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {summary.map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)] tracking-wider"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                {s.category}
              </span>
            ))}
          </div>
        </>
      )}
    </div>

    <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
          <FiTarget size={14} className="text-emerald-500" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Allocated vs Spent
        </h3>
      </div>
      {summary.length === 0 ? (
        <div className="flex items-center justify-center h-56 text-[var(--text-muted)] text-sm font-medium">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={summary.map((s) => ({
              name: s.category,
              allocated: s.allocated,
              spent: s.spent,
            }))}
            barSize={12}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
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
            <Legend
              wrapperStyle={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                paddingTop: 16,
              }}
            />
            <Bar
              dataKey="allocated"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
            />
            <Bar dataKey="spent" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </motion.div>
);

export default AnalyticsTab;
