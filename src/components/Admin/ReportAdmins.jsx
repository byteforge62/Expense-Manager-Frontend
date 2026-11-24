import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAdminReport,
  selectAdminReportLoading,
  selectAdminStats,
} from "../../store/slices/adminReportSlice";

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

const COLORS = ["#a78bfa", "#10b981", "#f59e0b", "#ef4444", "#3E6BB5"];

export const ReportAdmins = () => {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAdminStats);
  const loading = useAppSelector(selectAdminReportLoading);

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
        <CircularProgress size={40} sx={{ mb: 2, color: "#10b981" }} />
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
      trend: "All accounts",
      color: "linear-gradient(to bottom right, #a78bfa, #3E6BB5)",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      trend: "Enabled",
      color: "linear-gradient(to bottom right, #10b981, #10b981)",
    },
    {
      label: "Deactivated Users",
      value: stats.deactivatedUsers,
      trend: "Disabled",
      color: "linear-gradient(to bottom right, #ef4444, #ef4444)",
    },
    {
      label: "Total Income",
      value: `₹${stats.totalIncome?.toLocaleString("en-IN") || 0}`,
      trend: "Recorded",
      color: "linear-gradient(to bottom right, #6366f1, #6366f1)",
    },
    {
      label: "Total Expense",
      value: `₹${stats.totalExpense?.toLocaleString("en-IN") || 0}`,
      trend: "Recorded",
      color: "linear-gradient(to bottom right, #f59e0b, #f97316)",
    },
    {
      label: "Most Active User",
      value: stats.mostActiveUser || "N/A",
      trend: "Most entries",
      color: "linear-gradient(to bottom right, #a78bfa, #ef4444)",
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
              fontWeight: 600,
              letterSpacing: -0.5,
              color: "text.primary",
              mb: 1,
            }}
          >
            Intelligence{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              reports
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
            borderRadius: 1,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            fontSize: "10px",
            fontWeight: "bold",
            color: "text.secondary",
            letterSpacing: 1,
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
                borderRadius: 1,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                position: "relative",
                overflow: "hidden",
                boxShadow: "none",
                transition: "border-color 160ms ease",
                "&:hover": { borderColor: "var(--border-medium)" },
                "&:hover .kpi-title": { color: "primary.main" },
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
                    mb: 1,
                    transition: "color 0.3s",
                  }}
                >
                  {kpi.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
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
                      fontSize: "10.5px",
                      color: "text.secondary",
                      bgcolor: "background.default",
                      border: "1px solid var(--border)",
                      borderRadius: 999,
                    }}
                  />
                  <Box
                    sx={{
                      w: 32,
                      h: 32,
                      borderRadius: 1,
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
              borderRadius: 1.5,
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
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                  color: "#10b981",
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
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#4A5F55" stopOpacity={0.1} />
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
              borderRadius: 1.5,
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
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                  color: "#a78bfa",
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
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    color: "text.disabled",
                    letterSpacing: "0.2em",
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
          borderRadius: 1.5,
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
                      borderRadius: 1.5,
                      bgcolor: "rgba(79,70,229, 0.1)",
                      border: "1px solid rgba(79,70,229, 0.2)",
                      color: "#10b981",
                    }}
                  >
                    <FiActivity size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, mb: 0.5 }}>
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
                      borderRadius: 1.5,
                      bgcolor: "rgba(168, 85, 247, 0.1)",
                      border: "1px solid rgba(168, 85, 247, 0.2)",
                      color: "#a78bfa",
                    }}
                  >
                    <FiUsers size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, mb: 0.5 }}>
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
                      borderRadius: 1.5,
                      bgcolor: "rgba(239,68,68, 0.1)",
                      border: "1px solid rgba(239,68,68, 0.2)",
                      color: "#ef4444",
                    }}
                  >
                    <FiXCircle size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, mb: 0.5 }}>
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
                      borderRadius: 1.5,
                      bgcolor: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      color: "#f59e0b",
                    }}
                  >
                    <FiFileText size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, mb: 0.5 }}>
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