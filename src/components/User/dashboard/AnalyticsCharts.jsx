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
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { FiTrendingDown, FiBarChart2, FiPieChart } from "react-icons/fi";

/* ── Visual analytics: 30-day trend, inflow/outflow and category split ── */

const COLORS = [
  "#6735c8",
  "#1f9d6b",
  "#b07c26",
  "#e0564b",
  "#a78bfa",
  "#8a8a99",
  "#4c6fa8",
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 1.5,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          tracking: "0.05em",
          fontWeight: "bold",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: "extrabold", mt: 0.5 }}>
        ₹{payload[0].value?.toLocaleString("en-IN")}
      </Typography>
    </Paper>
  );
};

export const SpendingTrendChart = ({ data }) => (
            <Grid size={12}>
              <Card
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 6,
                  p: 4,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: 3,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 256,
                    height: 256,
                    bgcolor: "error.main",
                    opacity: 0.03,
                    filter: "blur(96px)",
                  }}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 4, position: "relative", zIndex: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(169, 75, 63, 0.1)",
                      border: 1,
                      borderColor: "rgba(169, 75, 63, 0.2)",
                      color: "error.main",
                      borderRadius: 1.5,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <FiTrendingDown size={16} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Spending trend
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: "bold",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Expenses over the last 30 days
                    </Typography>
                  </Box>
                </Stack>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={2}
                    />
                    <YAxis
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#e0564b"
                      strokeWidth={4}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
);

export const CashEquilibriumChart = ({ totalIncome, totalExpenses }) => (
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 6,
                  p: 4,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: 3,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 192,
                    height: 192,
                    bgcolor: "primary.main",
                    opacity: 0.03,
                    filter: "blur(80px)",
                  }}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 4, position: "relative", zIndex: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(163, 119, 58, 0.1)",
                      border: 1,
                      borderColor: "rgba(163, 119, 58, 0.2)",
                      color: "primary.main",
                      borderRadius: 1.5,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <FiBarChart2 size={16} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Cash Equilibrium
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: "bold",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Aggregate Flow Comparison
                    </Typography>
                  </Box>
                </Stack>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={[
                      { name: "INFLOW", amount: totalIncome },
                      { name: "OUTFLOW", amount: totalExpenses },
                    ]}
                    barSize={52}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="var(--border)"
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "var(--surface-tertiary)", opacity: 0.1 }}
                    />
                    <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                      <Cell fill="#1f9d6b" />
                      <Cell fill="#e0564b" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
);

export const CategoryBreakdownChart = ({ data }) => (
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 6,
                    p: 4,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: 3,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 192,
                      height: 192,
                      bgcolor: "cyan.main",
                      opacity: 0.03,
                      filter: "blur(80px)",
                    }}
                  />
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 4, position: "relative", zIndex: 1 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "rgba(74, 47, 203, 0.1)",
                        border: 1,
                        borderColor: "rgba(74, 47, 203, 0.2)",
                        color: "cyan.main",
                        borderRadius: 1.5,
                        width: 40,
                        height: 40,
                      }}
                    >
                      <FiPieChart size={16} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        Disbursement Profile
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: "bold",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Sector Allocation
                      </Typography>
                    </Box>
                  </Stack>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        outerRadius={90}
                        innerRadius={55}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {data.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "var(--text-muted)",
                          paddingTop: 20,
                        }}
                      />
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
);
