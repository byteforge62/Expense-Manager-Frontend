import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

/* ── One analysis sheet: trend, category ring and the inflow/outflow balance ── */

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
  "var(--chart-2)",
];

const compactINR = (value) => {
  const amount = Number(value || 0);

  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`;
  return `₹${amount}`;
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <Paper
      sx={{
        px: 1.5,
        py: 1.1,
        border: 1,
        borderColor: "divider",
        borderRadius: "8px",
        bgcolor: "background.paper",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "text.primary",
          mt: 0.2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        ₹{payload[0].value?.toLocaleString("en-IN")}
      </Typography>
    </Paper>
  );
};

const SectionHead = ({ title, subtitle, aside }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="baseline"
    spacing={2}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography component="h3" sx={{ fontSize: 12.5, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.15 }}>
        {subtitle}
      </Typography>
    </Box>
    {aside}
  </Stack>
);

const axisTick = { fill: "var(--text-muted)", fontSize: 9.5, fontWeight: 500 };

const TrendBlock = ({ data }) => (
  <Box>
    <SectionHead
      title="Spending trend"
      subtitle="Expenses over the last 30 days"
      aside={
        <Typography
          sx={{ fontSize: 10, color: "text.secondary", whiteSpace: "nowrap" }}
        >
          Daily total
        </Typography>
      }
    />
    <Box sx={{ mt: 0.75, ml: -1 }}>
      <ResponsiveContainer width="100%" height={85}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="var(--border-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            interval={4}
            dy={6}
          />
          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            tickFormatter={compactINR}
            width={46}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--border-medium)", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--card)",
              stroke: "var(--primary)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  </Box>
);

const CategoryBlock = ({ data }) => {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <Box>
      <SectionHead
        title="Spending by category"
        subtitle="Where this month went"
        aside={
          <Typography
            sx={{ fontSize: 10, color: "text.secondary", whiteSpace: "nowrap" }}
          >
            All recorded
          </Typography>
        }
      />

      <Box sx={{ position: "relative", mt: 0.25 }}>
        <ResponsiveContainer width="100%" height={78}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={36}
              innerRadius={26}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name || index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 9, color: "text.secondary" }}>
              Recorded
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {compactINR(total)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: 1.5,
          rowGap: 0.5,
          mt: 0.5,
        }}
      >
        {data.slice(0, 3).map((item, index) => (
          <Stack
            key={item.name || index}
            direction="row"
            spacing={0.4}
            alignItems="center"
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "2px",
                bgcolor: COLORS[index % COLORS.length],
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{ fontSize: 9.5, color: "text.secondary" }}
              noWrap
            >
              {item.name}{" "}
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

const BalanceBlock = ({ totalIncome, totalExpenses }) => {
  const total = totalIncome + totalExpenses;
  const incomeShare = total > 0 ? (totalIncome / total) * 100 : 0;
  const expenseShare = total > 0 ? (totalExpenses / total) * 100 : 0;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        spacing={1}
      >
        <Typography component="h3" sx={{ fontSize: 12.5, fontWeight: 600 }}>
          Inflow and outflow
        </Typography>
        <Typography sx={{ fontSize: 10, color: "text.secondary", whiteSpace: "nowrap" }}>
          Income against expenses
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mt: 0.5 }}
      >
        {[
          {
            label: "Income",
            value: totalIncome,
            share: incomeShare,
            color: "var(--positive)",
          },
          {
            label: "Expenses",
            value: totalExpenses,
            share: expenseShare,
            color: "var(--negative)",
          },
        ].map((row) => (
          <Box key={row.label} sx={{ flex: 1 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{ mb: 0.2 }}
            >
              <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                {row.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "text.secondary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {compactINR(row.value)}
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 3.5,
                borderRadius: 99,
                bgcolor: "var(--surface-tertiary)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${Math.max(row.share, row.value > 0 ? 3 : 0)}%`,
                  height: "100%",
                  bgcolor: row.color,
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export const AnalysisSheet = ({
  trendData = [],
  totalIncome = 0,
  totalExpenses = 0,
  categoryData = [],
}) => {
  const hasCategories = categoryData.length > 0;

  return (
    <Box
      component="section"
      aria-labelledby="analysis-heading"
      sx={{ borderTop: 1, borderColor: "divider", pt: { xs: 1, md: 1.25 } }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        sx={{ mb: 0.5 }}
      >
        <Typography
          id="analysis-heading"
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "0.98rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Analysis
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          The shape behind the numbers
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: hasCategories
              ? "minmax(0, 1.5fr) minmax(0, 0.85fr)"
              : "minmax(0, 1fr)",
          },
          columnGap: 3.5,
          rowGap: 2,
          alignItems: "start",
        }}
      >
        <TrendBlock data={trendData} />
        {hasCategories && <CategoryBlock data={categoryData} />}
      </Box>

      <Box sx={{ mt: 1.5, pt: 1.25, borderTop: 1, borderColor: "divider" }}>
        <BalanceBlock totalIncome={totalIncome} totalExpenses={totalExpenses} />
      </Box>
    </Box>
  );
};

export default AnalysisSheet;
