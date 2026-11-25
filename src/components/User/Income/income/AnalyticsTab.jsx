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

const axisTick = { fill: "var(--text-muted)", fontSize: 9, fontWeight: 500 };

const AnalyticsTab = ({
  monthlyIncomeExpense,
  monthlyIncomeTrend,
  avgIncome,
}) => (
  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
          <FiBarChart2 size={12} className="text-blue-500" />
        </span>
        <h3 className="text-[11.5px] font-semibold text-[var(--text-primary)]">
          Monthly Cash Flow
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={monthlyIncomeExpense} barSize={8}>
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
          <Legend
            wrapperStyle={{
              fontSize: 9,
              fontWeight: 600,
              color: "var(--text-muted)",
              paddingTop: 4,
            }}
          />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
          <FiTrendingUp size={12} className="text-cyan-500" />
        </span>
        <h3 className="text-[11.5px] font-semibold text-[var(--text-primary)]">
          Income Projection &amp; Baseline
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={140}>
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
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine
            y={avgIncome}
            stroke="var(--text-muted)"
            strokeDasharray="5 5"
            label={{
              value: `AVG ₹${Math.round(avgIncome / 1000)}K`,
              position: "right",
              fill: "var(--text-muted)",
              fontSize: 9,
              fontWeight: 700,
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{
              r: 3,
              fill: "#6366f1",
              strokeWidth: 1.5,
              stroke: "var(--surface-primary)",
            }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default AnalyticsTab;
