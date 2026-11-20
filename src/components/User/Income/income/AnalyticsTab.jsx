import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FiTrendingUp, FiBarChart2 } from "react-icons/fi";
import { ChartTooltip } from "./incomeUi";

const AnalyticsTab = ({
  monthlyIncomeExpense,
  monthlyIncomeTrend,
  avgIncome,
}) => (
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
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
          <FiBarChart2 size={14} className="text-blue-500" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Monthly Cash Flow
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={monthlyIncomeExpense} barSize={12}>
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
            dataKey="income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="expense"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="rounded-2xl bg-[var(--surface-primary)] border border-[var(--border)] backdrop-blur-sm p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner">
          <FiTrendingUp size={14} className="text-cyan-500" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Income Projection & Baseline
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={monthlyIncomeTrend}>
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
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine
            y={avgIncome}
            stroke="var(--text-muted)"
            strokeDasharray="5 5"
            label={{
              value: `AVG ₹${Math.round(avgIncome / 1000)}K`,
              position: "right",
              fill: "var(--text-muted)",
              fontSize: 10,
              fontWeight: 700,
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#6366f1",
              strokeWidth: 2,
              stroke: "var(--surface-primary)",
            }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default AnalyticsTab;
