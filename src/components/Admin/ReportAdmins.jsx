import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminReport } from "../../redux/slices/adminReportSlice";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";

// ================ Chart Engine ================
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ================ Icons ================
import {
  FiActivity,
  FiPieChart,
  FiGrid,
  FiUsers,
  FiXCircle,
  FiFileText,
} from "react-icons/fi";

const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#a855f7"];

export const ReportAdmins = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.adminReport);

  useEffect(() => {
    dispatch(fetchAdminReport());
  }, [dispatch]);

  if (loading || !stats) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ h: "70vh", color: "text.disabled" }}
      >
        <CircularProgress size={40} sx={{ mb: 2, color: "#22d3ee" }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Loading system intelligence report...
        </Typography>
      </Stack>
    );
  }

  // KPI Node Registry
  const kpis = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      trend: "+12%",
      color: "linear-gradient(to bottom right, #818cf8, #a855f7)",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      trend: "+4%",
      color: "linear-gradient(to bottom right, #34d399, #10b981)",
    },
    {
      label: "Deactivated Users",
      value: stats.deactivatedUsers,
      trend: "-3%",
      color: "linear-gradient(to bottom right, #f43f5e, #ef4444)",
    },
    {
      label: "Total Income",
      value: `export const formatCurrency = (val) => ₹${stats.totalIncome?.toLocaleString()}`,
      trend: "+8%",
      color: "linear-gradient(to bottom right, #60a5fa, #06b6d4)",
    },
    {
      label: "Total Expense",
      value: `₹${stats.totalExpense?.toLocaleString()}`,
      trend: "+6%",
      color: "linear-gradient(to bottom right, #fbbf24, #f97316)",
    },
    {
      label: "Most Active User",
      value: stats.mostActiveUser || "N/A",
      trend: "Top performer",
      color: "linear-gradient(to bottom right, #c084fc, #f43f5e)",
    },
  ];

  const barData = [
    { name: "Income", amount: stats.totalIncome },
    { name: "Expenses", amount: stats.totalExpense },
  ];

  const pieData = stats.categoryDistribution || [];

  return (
    <Box sx={{ pb: 5 }}>
      {/* ══ HEADER ══ */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "end" }}
        spacing={3}
        sx={{ mb: 5 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: -0.5,
              color: "text.primary",
              mb: 1,
            }}
          >
            Intelligence{" "}
            <Box component="span" sx={{ color: "#22d3ee" }}>
              Reports
            </Box>
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", maxWidth: 500, fontWeight: 500 }}
          >
            Aggregated analytical insights across all system nodes. High-fidelity
            data visualization for ecosystem health monitoring.
          </Typography>
        </Box>

        <Chip
          icon={
            <Box
              sx={{
                w: 8,
                h: 8,
                borderRadius: "50%",
                bgcolor: "#10b981",
                animation: "pulse 2s infinite",
              }}
            />
          }
          label="Node Analytics: Synchronized"
          sx={{
            px: 1.5,
            py: 2,
            borderRadius: 4,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            fontSize: "10px",
            fontWeight: "bold",
            color: "text.secondary",
            letterSpacing: 1,
            textTransform: "uppercase",
            "& .MuiChip-icon": { marginLeft: 0 },
          }}
        />
      </Stack>

      {/* ── KPIs GRID ── */}
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={4} xl={2} key={index}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              sx={{
                p: 2.5,
                borderRadius: 6,
                bgcolor: "action.hover",
                border: 1,
                borderColor: "divider",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s",
                "&:hover": { bgcolor: "action.selected" },
                "&:hover .kpi-title": { color: "#22d3ee" },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 10 }}>
                <Typography
                  variant="caption"
                  className="kpi-title"
                  sx={{
                    display: "block",
                    fontWeight: "bold",
                    color: "text.disabled",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    mb: 1,
                    transition: "color 0.3s",
                  }}
                >
                  {kpi.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: "text.primary",
                    noWrap: true,
                  }}
                >
                  {kpi.value}
                </Typography>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <Chip
                    label={kpi.trend}
                    size="small"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "10px",
                      color: "#22d3ee",
                      bgcolor: "rgba(34, 211, 238, 0.1)",
                      border: "1px solid rgba(34, 211, 238, 0.2)",
                      borderRadius: 1.5,
                    }}
                  />
                  <Box
                    sx={{
                      w: 32,
                      h: 32,
                      borderRadius: 2,
                      background: kpi.color,
                      opacity: 0.2,
                      filter: "blur(4px)",
                      transition: "opacity 0.3s",
                      ".MuiCard-root:hover &": { opacity: 0.4 },
                    }}
                  />
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── CHARTS ECOSYSTEM ── */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* BAR CHART LAYER */}
        <Grid item xs={12} xl={7}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{
              p: 4,
              borderRadius: 10,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 4 }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "text.disabled",
                }}
              >
                Financial Convergence
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                  color: "#22d3ee",
                }}
              >
                <FiActivity size={18} />
              </Avatar>
            </Stack>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={barData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "rgba(255, 255, 255, 0.4)",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    color: "#fff",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#barGradient)"
                  radius={[15, 15, 5, 5]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* PIE CHART LAYER */}
        <Grid item xs={12} xl={5}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{
              p: 4,
              borderRadius: 10,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 4 }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "text.disabled",
                }}
              >
                Class Distribution
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                  color: "#c084fc",
                }}
              >
                <FiPieChart size={18} />
              </Avatar>
            </Stack>

            {pieData.length > 0 ? (
              <Stack alignItems="center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={70}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={COLORS[idx % COLORS.length]}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "15px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <Grid container spacing={2} sx={{ mt: 2, w: "100%" }}>
                  {pieData.slice(0, 4).map((entry, i) => (
                    <Grid item xs={6} key={i}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            w: 8,
                            h: 8,
                            borderRadius: "50%",
                            bgcolor: COLORS[i % COLORS.length],
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: "bold",
                            color: "text.secondary",
                            textTransform: "uppercase",
                            noWrap: true,
                          }}
                        >
                          {entry.name}
                        </Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  height: 280,
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 6,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    color: "text.disabled",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Registry Empty
                </Typography>
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* ── HIGHLIGHTS / INSIGHTS PANEL ── */}
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          p: 5,
          borderRadius: 10,
          background: "linear-gradient(to bottom right, var(--surface-primary), var(--surface-secondary))",
          border: 1,
          borderColor: "divider",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
          position: "relative",
          overflow: "hidden",
          "&:hover .bg-grid-icon": { opacity: 0.2 },
        }}
      >
        <Box
          className="bg-grid-icon"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            p: 4,
            opacity: 0.1,
            transition: "opacity 0.3s",
            pointerEvents: "none",
          }}
        >
          <FiGrid size={120} />
        </Box>

        <Box sx={{ position: "relative", zIndex: 10, w: { xs: "100%", lg: "66.66%" } }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary", mb: 4 }}>
            Strategic Highlights
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      p: 1,
                      borderRadius: 3,
                      bgcolor: "rgba(6, 182, 212, 0.1)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                      color: "#22d3ee",
                    }}
                  >
                    <FiActivity size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, textTransform: "uppercase", mb: 0.5 }}>
                      Peak Capital Flow
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
                      ₹{stats.totalIncome?.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      p: 1,
                      borderRadius: 3,
                      bgcolor: "rgba(168, 85, 247, 0.1)",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      color: "#c084fc",
                    }}
                  >
                    <FiUsers size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, textTransform: "uppercase", mb: 0.5 }}>
                      Primary Operator
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
                      {stats.mostActiveUser || "STANDBY"}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      p: 1,
                      borderRadius: 3,
                      bgcolor: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.2)",
                      color: "#f43f5e",
                    }}
                  >
                    <FiXCircle size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, textTransform: "uppercase", mb: 0.5 }}>
                      Dormant Accounts
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
                      {stats.deactivatedUsers} NODES
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      p: 1,
                      borderRadius: 3,
                      bgcolor: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      color: "#fbbf24",
                    }}
                  >
                    <FiFileText size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, textTransform: "uppercase", mb: 0.5 }}>
                      Operational Outlay
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
                      ₹{stats.totalExpense?.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Box>
  );
};