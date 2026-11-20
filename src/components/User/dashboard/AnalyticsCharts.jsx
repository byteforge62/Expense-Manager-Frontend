import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { FiTrendingDown, FiBarChart2, FiPieChart } from "react-icons/fi";

/* ── Visual analytics: 30-day trend, inflow/outflow and category split ── */

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#a5b4fc",
  "#94a3b8",
  "#818cf8",
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper
      sx={{
        px: 1.5,
        py: 1.1,
        border: 0,
        borderRadius: "8px",
        bgcolor: "#0f172a",
        boxShadow: "0 12px 24px -12px rgba(15,23,42,0.5)",
      }}
    >
      <Typography sx={{ fontSize: 10.5, color: "#94a3b8" }}>{label}</Typography>
      <Typography
        sx={{ fontSize: 13, fontWeight: 600, color: "#ffffff", mt: 0.2 }}
      >
        ₹{payload[0].value?.toLocaleString("en-IN")}
      </Typography>
    </Paper>
  );
};

const ChartCard = ({ children, sx }) => (
  <Card
    sx={{
      border: 1,
      borderColor: "divider",
      borderRadius: "12px",
      p: { xs: 2, sm: 2.75 },
      bgcolor: "background.paper",
      boxShadow: "var(--shadow-panel)",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const ChartHeader = ({ icon, title, subtitle, color = "primary.main", soft = "#eef2ff" }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "10px",
        bgcolor: soft,
        color,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.15 }}>
        {subtitle}
      </Typography>
    </Box>
  </Stack>
);

const axisTick = { fill: "#94a3b8", fontSize: 10, fontWeight: 500 };

export const SpendingTrendChart = ({ data }) => (
  <Grid size={12}>
    <ChartCard>
      <ChartHeader
        icon={<FiTrendingDown size={17} />}
        title="Spending trend"
        subtitle="Expenses over the last 30 days"
        color="#ef4444"
        soft="#fef2f2"
      />
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="4 6"
            stroke="var(--border)"
            vertical={false}
            opacity={0.7}
          />
          <XAxis
            dataKey="date"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            interval={2}
            dy={6}
          />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v}`}
            width={54}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={2.6}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#ffffff",
              stroke: "#6366f1",
              strokeWidth: 2.5,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  </Grid>
);

export const CashEquilibriumChart = ({ totalIncome, totalExpenses }) => (
  <Grid size={{ xs: 12, lg: 6 }}>
    <ChartCard>
      <ChartHeader
        icon={<FiBarChart2 size={17} />}
        title="Inflow and outflow"
        subtitle="Income against expenses"
        color="#6366f1"
        soft="#eef2ff"
      />
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={[
            { name: "Income", amount: totalIncome },
            { name: "Expenses", amount: totalExpenses },
          ]}
          barSize={44}
          margin={{ top: 8, right: 8, left: -14, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            width={52}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(99,102,241,0.05)" }}
          />
          <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
            <Cell fill="#10b981" />
            <Cell fill="#ef4444" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </Grid>
);

export const CategoryBreakdownChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Grid size={{ xs: 12, lg: 6 }}>
      <ChartCard>
        <ChartHeader
          icon={<FiPieChart size={17} />}
          title="Spending by category"
          subtitle="Where this month went"
          color="#6366f1"
          soft="#eef2ff"
        />
        <Box sx={{ position: "relative" }}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                outerRadius={88}
                innerRadius={58}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  paddingTop: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <Box
            sx={{
              position: "absolute",
              top: 86,
              left: 0,
              right: 0,
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
              Total
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ₹{Number(total || 0).toLocaleString("en-IN")}
            </Typography>
          </Box>
        </Box>
      </ChartCard>
    </Grid>
  );
};
