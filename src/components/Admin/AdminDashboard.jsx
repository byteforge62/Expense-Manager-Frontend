import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../../redux/user/userSlice";
import { fetchAllTransactions } from "../../redux/transaction/transactionSlice";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { LazyMotion, m } from "framer-motion";
import { domAnimation } from "framer-motion";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// ================ Icons ================
import {
  FiUsers,
  FiActivity,
  FiLayout,
  FiTrendingUp,
  FiTrendingDown,
  FiGrid,
  FiSearch,
  FiPieChart,
  FiBarChart2,
  FiDatabase,
} from "react-icons/fi";

const COLORS = ["#22d3ee", "#6366f1", "#10b981", "#f59e0b", "#f43f5e"];

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, loading: userLoading } = useSelector((state) => state.user);
  const {
    transactions,
    summary,
    loading: txLoading,
  } = useSelector((state) => state.transaction);

  const [txSearch, setTxSearch] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Income, Expense
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadingDashboard = userLoading || txLoading;

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAllTransactions());
  }, [dispatch]);

  // Global Category Breakdown (Across all users)
  const categoryData = useMemo(() => {
    const counts = {};
    transactions
      .filter((t) => t.type === "Expense")
      .forEach((t) => {
        const catName = t.categoryID?.name || "Uncategorized";
        counts[catName] = (counts[catName] || 0) + (t.amount || 0);
      });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  // Financial Trend (Income vs Expenses Monthly)
  const financialTrend = useMemo(() => {
    const trend = {};
    const monthsOrder = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    transactions.forEach((t) => {
      const m = new Date(t.createdAt).toLocaleString("default", {
        month: "short",
      });
      if (!trend[m]) trend[m] = { income: 0, expense: 0 };
      if (t.type === "Income") trend[m].income += t.amount || 0;
      else trend[m].expense += t.amount || 0;
    });

    return monthsOrder.map((m) => ({
      name: m,
      income: trend[m]?.income || 0,
      expense: trend[m]?.expense || 0,
    }));
  }, [transactions]);

  // Filtered Ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.userID?.name?.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.categoryID?.name?.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.description?.toLowerCase().includes(txSearch.toLowerCase());

      const matchesType = filterType === "All" || tx.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [transactions, txSearch, filterType]);

  if (loadingDashboard) return <DashboardSkeleton />;

  return (
    <LazyMotion features={domAnimation}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 5, pb: 10 }}>
      
      {/* ---------- HEADER ---------- */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="between"
        alignItems={{ xs: "flex-start", md: "flex-end" }}
        spacing={3}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", tracking: "-0.02em" }}>
            System{" "}
            <Box component="span" sx={{ color: "cyan.main" }}>
              Intelligence
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxW: 440, mt: 1, lineHeight: 1.6 }}>
            Real-time infrastructure overview, system-wide financial flow, and operational audit trail.
          </Typography>
        </Box>
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 3,
              bgcolor: "cyan.main",
              opacity: 0.1,
              border: 1,
              borderColor: "cyan.main",
            }}
          >
            <Box
              component="span"
              className="animate-pulse"
              sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "cyan.main" }}
            />
            <Typography variant="caption" sx={{ fontWeight: "bold", letterSpacing: "0.15em", color: "cyan.main" }}>
              LIVE SYSTEM FEED
            </Typography>
          </Stack>
        </Box>
      </Stack>

      {/* ---------- CORE SYSTEM PILLARS (KPIs) ---------- */}
      <Grid container spacing={3}>
        {[
          { label: "Total Registrations", value: users.length, icon: <FiUsers />, color: "cyan.main" },
          { label: "Active Transactions", value: transactions.length, icon: <FiActivity />, color: "primary.main" },
          { label: "System Health", value: "99.9%", icon: <FiLayout />, color: "success.main" },
          { label: "Database Latency", value: "24ms", icon: <FiDatabase />, color: "error.main" },
        ].map((kpi, i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={`${kpi.label}-${i}`}>
            <Box
              component={m.div}
              whileHover={{ y: -5 }}
              sx={{
                p: 3,
                borderRadius: 8,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                boxShadow: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                  color: kpi.color,
                  borderRadius: 4,
                  mb: 2,
                  width: 48,
                  height: 48,
                }}
              >
                {kpi.icon}
              </Avatar>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {kpi.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                {kpi.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ---------- FINANCIAL SYSTEM ANALYSIS ---------- */}
      <Grid container spacing={3}>
        
        {/* Financial Flow Summary Cards */}
        <Grid size={12}>
          <Grid container spacing={3}>
            {[
              { label: "System Inflow", value: summary.totalIncome, icon: <FiTrendingUp />, color: "success.main" },
              { label: "System Outflow", value: summary.totalExpense, icon: <FiTrendingDown />, color: "error.main" },
              { label: "Net Infrastructure Flow", value: summary.balance, icon: <FiActivity />, color: "cyan.main" },
            ].map((card, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={`${card.label}-${i}`}>
                <Stack
                  direction="row"
                  spacing={3}
                  alignItems="center"
                  sx={{ p: 3, borderRadius: 6, bgcolor: "background.paper", border: 1, borderColor: "divider", boxShadow: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "action.hover",
                      color: card.color,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 4,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      ₹{card.value.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Global Finance Trend Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ p: 4, borderRadius: 8, bgcolor: "background.paper", border: 1, borderColor: "divider", boxShadow: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FiBarChart2 style={{ color: "var(--mui-palette-cyan-main)" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    System-wide Fiscal Trend
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Cross-platform revenue vs expenditure metrics
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ h: 350, w: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--mui-palette-divider)" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--mui-palette-text-secondary)", fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--mui-palette-text-secondary)", fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    cursor={{ fill: "var(--mui-palette-action-hover)", opacity: 0.5 }}
                    contentStyle={{
                      background: "var(--mui-palette-background-paper)",
                      border: "1px solid var(--mui-palette-divider)",
                      borderRadius: "12px",
                      color: "var(--mui-palette-text-primary)",
                    }}
                  />
                  <Bar dataKey="income" fill="var(--mui-palette-success-main)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expense" fill="var(--mui-palette-error-main)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        {/* Category Saturation Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ p: 4, borderRadius: 8, bgcolor: "background.paper", border: 1, borderColor: "divider", boxShadow: 3, h: "100%", display: "flex", flexDirection: "column" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <FiPieChart style={{ color: "var(--mui-palette-primary-main)" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Category Saturation
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 4 }}>
              Heavyweight sectors by investment volume
            </Typography>

            <Box sx={{ flex: 1, minHeight: 250, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={`${categoryData[i]?.name}-${i}`} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--mui-palette-background-paper)",
                      border: "1px solid var(--mui-palette-divider)",
                      borderRadius: "12px",
                      color: "var(--mui-palette-text-primary)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Stack alignItems="center" justifyContent="center" sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", lineHeight: 1 }}>
                  {categoryData.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", tracking: "-0.02em", textTransform: "uppercase" }}>
                  Sectors
                </Typography>
              </Stack>
            </Box>

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {categoryData.map((item, idx) => (
                <Stack
                  key={`${item.name}-${idx}`}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 1.5, borderRadius: 4, bgcolor: "action.hover", border: 1, borderColor: "divider" }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: COLORS[idx % COLORS.length] }} />
                    <Typography variant="caption" sx={{ fontWeight: 500 }} noWrap>
                      {item.name}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    ₹{item.value.toLocaleString()}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* ---------- UNIFIED GLOBAL LEDGER ---------- */}
      <Box sx={{ p: 4, borderRadius: 8, bgcolor: "background.paper", border: 1, borderColor: "divider", boxShadow: 3, position: "relative", overflow: "hidden" }}>
        
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FiGrid style={{ color: "var(--mui-palette-primary-main)" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Global Unified Ledger
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Holistic record of all financial operations across the system infra.
            </Typography>
          </Box>

          <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={2}>
            <TextField
              size="small"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Search ledger..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiSearch />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 260 }}
            />

            <ButtonGroup size="small" color="primary">
              {["All", "Income", "Expense"].map((t) => (
                <Button
                  key={t}
                  variant={filterType === t ? "contained" : "outlined"}
                  onClick={() => setFilterType(t)}
                  sx={{ fontWeight: "bold", fontSize: "11px" }}
                >
                  {t}
                </Button>
              ))}
            </ButtonGroup>
          </Stack>
        </Stack>

        <TableContainer sx={{ minHeight: 400 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold", color: "text.secondary", fontSize: "11px", textTransform: "uppercase", tracking: "0.05em" } }}>
                <TableCell>Principal Identity</TableCell>
                <TableCell>Taxonomy</TableCell>
                <TableCell>Classification</TableCell>
                <TableCell>Transaction Quantum</TableCell>
                <TableCell align="right">Synchronization Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.slice(0, itemsPerPage).map((tx, idx) => (
                <TableRow
                  key={tx._id || idx}
                  component={m.tr}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "grey.800", color: "common.white", fontSize: "14px", fontWeight: "bold" }}>
                        {tx.userID?.name?.charAt(0) || "U"}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
                          {tx.userID?.name || "System Anonymous"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tx.userID?.email || "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.light" }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {tx.categoryID?.name || "General"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        letterSpacing: "0.1em",
                        color: tx.type === "Income" ? "success.main" : "error.main",
                      }}
                    >
                      {tx.type || "Expense"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontFamily: "monospace" }}>
                      ₹{tx.amount?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" color="text.secondary">
                      {new Date(tx.createdAt).toLocaleDateString()} @{" "}
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10, opacity: 0.4 }}>
              <FiDatabase size={40} />
              <Typography variant="caption" sx={{ fontWeight: "bold", mt: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                No matching records found in system cache
              </Typography>
            </Stack>
          )}
        </TableContainer>

        {/* Scalability Pagination */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
            Showing {Math.min(filteredTransactions.length, itemsPerPage)} of {filteredTransactions.length} entries
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
              Page Size:
            </Typography>
            <ButtonGroup size="small">
              {[10, 20, 50].map((sz) => (
                <Button
                  key={sz}
                  variant={itemsPerPage === sz ? "contained" : "outlined"}
                  onClick={() => setItemsPerPage(sz)}
                  sx={{ fontSize: "11px", fontWeight: "bold" }}
                >
                  {sz}
                </Button>
              ))}
            </ButtonGroup>
          </Stack>
        </Stack>
      </Box>
      </Box>
    </LazyMotion>
  );
};

/* ---------- LOADING SKELETON ---------- */
const DashboardSkeleton = () => (
  <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 4 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="end">
      <Box sx={{ width: "40%" }}>
        <Skeleton variant="text" height={40} width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} width="100%" />
      </Box>
      <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 2 }} />
    </Stack>
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 6 }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 6 }} />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 6 }} />
      </Grid>
    </Grid>
    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 6 }} />
  </Box>
);

export default AdminDashboard;