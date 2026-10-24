import { useEffect, useState, useCallback,useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../Utils/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid"; // Using current Grid API for clean spacing layout
import CircularProgress from "@mui/material/CircularProgress";

// ================ Icons ================
import {
  FiUser,
  FiCalendar,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiActivity,
  FiShield,
  FiChevronLeft,
} from "react-icons/fi";

export const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [budgetRes, txRes, userRes] = await Promise.all([
        axiosInstance.get(`/budgetsbyUserID/${userId}`),
        axiosInstance.get(`/transactionsByUserId/${userId}`),
        axiosInstance.get(`/user/${userId}`),
      ]);

      setBudget(budgetRes.data.data || []);
      setTransactions(txRes.data.data || []);
      setUser(userRes.data.data || null);
    } catch (error) {
      console.log("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalBudget = budget.reduce((sum, b) => sum + (b.amount || 0), 0);

  const monthlyData = useMemo(() => {
  const grouped = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const m = date.toLocaleString("default", { month: "short" });

    if (!grouped[m]) {
      grouped[m] = {
        month: m,
        income: 0,
        expense: 0,
      };
    }

    if (t.type === "income") {
      grouped[m].income += t.amount;
    } else {
      grouped[m].expense += t.amount;
    }
  });

  return Object.values(grouped);
}, [transactions]);

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ py: 12 }}
        spacing={2}
      >
        <CircularProgress
          thickness={4}
          sx={{
            color: "cyan",
            width: "48px !important",
            height: "48px !important",
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: "semibold",
            color: "rgba(6, 182, 212, 0.6)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            animation: "pulse 2s infinite",
          }}
        >
          Accessing Encrypted Profile...
        </Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ pb: 5 }}>
      {/* HEADER NAVIGATION */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            p: 1.25,
            borderRadius: 3,
            bgcolor: "action.hover",
            border: 1,
            borderColor: "divider",
            color: "text.secondary",
            boxShadow: 3,
            "&:hover": { bgcolor: "action.selected", color: "text.primary" },
            transition: "all 0.2s",
          }}
        >
          <FiChevronLeft size={20} />
        </IconButton>
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              color: "text.disabled",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              fontSize: "12px",
            }}
          >
            Subject Analysis
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(6, 182, 212, 0.6)", fontFamily: "monospace" }}
          >
            ID: {userId}
          </Typography>
        </Box>
      </Stack>

      <AnimatePresence>
        <Stack
          component={motion.div}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          spacing={4}
        >
          {/* ===================== PROFILE HERO ===================== */}
          <Card
            sx={{
              position: "relative",
              borderRadius: 10,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              p: 4,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              overflow: "hidden",
              "&:hover .ambient-icon": { opacity: 0.2 },
            }}
          >
            {/* Background Ambient Decoration Icon */}
            <Box
              className="ambient-icon"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                p: 5,
                opacity: 0.1,
                filter: "blur(40px)",
                transition: "opacity 0.3s",
                pointerEvents: "none",
                color: "cyan",
              }}
            >
              <FiActivity size={200} />
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems="center"
              spacing={4}
              sx={{
                position: "relative",
                zIndex: 1,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              {/* Profile Avatar Engine */}
              <Box sx={{ position: "relative" }}>
                {user?.profilePic ? (
                  <Box
                    component="img"
                    src={user.profilePic}
                    alt={user.name}
                    sx={{
                      width: 128,
                      height: 128,
                      borderRadius: 6,
                      border: "2px solid rgba(6, 182, 212, 0.3)",
                      objectFit: "cover",
                      boxShadow: 5,
                      p: 0.5,
                      bgcolor: "rgba(255,255,255,0.02)",
                    }}
                  />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 128,
                      height: 128,
                      borderRadius: 6,
                      bgcolor: "action.hover",
                      border: 1,
                      borderColor: "divider",
                      boxShadow: "0 0 20px rgba(6, 182, 212, 0.1)",
                    }}
                  >
                    <FiUser size={64} style={{ color: "var(--text-muted)" }} />
                  </Avatar>
                )}
                {/* Shield Badge Placement */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -8,
                    right: -8,
                    p: 1,
                    borderRadius: 3,
                    bgcolor: "rgba(234, 179, 8, 0.1)",
                    border: "1px solid rgba(234, 179, 8, 0.2)",
                    color: "rgb(250, 204, 21)",
                    boxShadow: 3,
                  }}
                >
                  <FiShield size={16} />
                </Box>
              </Box>

              {/* Subject Information Stack */}
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    tracking: "-0.05em",
                    color: "text.primary",
                  }}
                >
                  {user?.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  {user?.email}
                </Typography>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent={{ xs: "center", md: "flex-start" }}
                  spacing={2}
                  sx={{ pt: 1 }}
                >
                  <Chip
                    label={`${user?.role} ACCESS`}
                    sx={{
                      fontSize: "10px",
                      fontWeight: 900,
                      letterSpacing: "0.15em",
                      borderRadius: 3,
                      border: 1,
                      ...(user?.role === "Admin"
                        ? {
                            bgcolor: "rgba(6, 182, 212, 0.1)",
                            borderColor: "rgba(6, 182, 212, 0.3)",
                            color: "cyan",
                          }
                        : {
                            bgcolor: "action.hover",
                            borderColor: "divider",
                            color: "text.disabled",
                          }),
                    }}
                  />
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      color: "text.disabled",
                      fontSize: "10px",
                      fontWeight: "bold",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    <FiCalendar style={{ color: "cyan" }} />
                    <span>
                      Decrypted:{" "}
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </span>
                  </Stack>
                </Stack>
              </Stack>

              {/* Action Vectors */}
              <Box>
                <Button
                  variant="outlined"
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 4,
                    bgcolor: "action.hover",
                    borderColor: "divider",
                    color: "text.secondary",
                    fontSize: "12px",
                    fontWeight: "bold",
                    letterSpacing: "0.15em",
                    "&:hover": {
                      bgcolor: "action.selected",
                      color: "text.primary",
                      borderColor: "action.active",
                    },
                  }}
                >
                  Moderate
                </Button>
              </Box>
            </Stack>
          </Card>

          {/* ===================== ANALYTICS STRIP ===================== */}
          <Grid container spacing={3}>
            {[
              {
                label: "Gross Inflow",
                value: totalIncome,
                icon: <FiArrowUpRight size={20} />,
                gradient:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 184, 166, 0.1) 100%)",
                accent: "rgb(52, 211, 153)",
              },
              {
                label: "Operational Outflow",
                value: totalExpense,
                icon: <FiArrowDownLeft size={20} />,
                gradient:
                  "linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(249, 115, 22) 100%)",
                accent: "rgb(251, 113, 133)",
              },
              {
                label: "Allocated Reserves",
                value: totalBudget,
                icon: <FiActivity size={20} />,
                gradient:
                  "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)",
                accent: "rgb(96, 165, 250)",
              },
            ].map((card) => (
              <Grid size={{ xs: 12, md: 4 }} key={card.label}>
                <Card
                  component={motion.div}
                  whileHover={{ y: -5 }}
                  sx={{
                    p: 3,
                    borderRadius: 6,
                    background: card.gradient,
                    border: 1,
                    borderColor: "divider",
                    boxShadow: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "between",
                    "&:hover .icon-box": { transform: "scale(1.1)" },
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontWeight: "bold",
                        color: "text.disabled",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        mb: 0.5,
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 900, color: "text.primary" }}
                    >
                      ₹{card.value.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box
                    className="icon-box"
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      color: card.accent,
                      boxShadow: "inset 0px 1px 3px rgba(0,0,0,0.4)",
                      transition: "transform 0.2s",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ===================== SPLIT CHARTS ===================== */}
          <Grid container spacing={3}>
            {/* Distribution View */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: 10,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                    color: "text.disabled",
                    mb: 4,
                  }}
                >
                  Convergent Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={[
                      { name: "Inflow", amount: totalIncome },
                      { name: "Outflow", amount: totalExpense },
                    ]}
                  >
                    <defs>
                      <linearGradient
                        id="distGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#06b6d4"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#4f46e5"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "var(--surface-tertiary)" }}
                      contentStyle={{
                        background: "var(--surface-primary)",
                        border: "1px solid var(--border)",
                        borderRadius: "15px",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="url(#distGradient)"
                      radius={[12, 12, 4, 4]}
                      barSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Cyclical Trends */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: 10,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                    color: "text.disabled",
                    mb: 4,
                  }}
                >
                  Cyclical Velocity
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="areaIn" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="areaOut" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#f43f5e"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#f43f5e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--text-muted)",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface-primary)",
                        border: "1px solid var(--border)",
                        borderRadius: "15px",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fill="url(#areaIn)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#f43f5e"
                      fill="url(#areaOut)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>

          {/* ===================== TIMELINE (RECENT ACTIVITY) ===================== */}
          <Card
            sx={{
              p: 4,
              borderRadius: 10,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "text.disabled",
                mb: 4,
              }}
            >
              Sequence Transactional Log
              <Box
                component="span"
                sx={{
                  w: 6,
                  h: 6,
                  borderRadius: "50%",
                  bgcolor: "cyan",
                  animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
            </Typography>

            {/* Custom Vertical Pipeline */}
            <Stack spacing={3} sx={{ position: "relative" }}>
              <Box
                sx={{
                  position: "absolute",
                  left: 7,
                  top: 8,
                  bottom: 8,
                  width: "2px",
                  bgcolor: "divider",
                  opacity: 0.3,
                }}
              />

              {transactions.slice(0, 8).map((tx, idx) => (
                <Stack
                  key={tx._id}
                  direction="row"
                  spacing={3}
                  alignItems="center"
                  component={motion.div}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  sx={{
                    position: "relative",
                    pl: 4,
                    "&:hover .pipeline-node": {
                      boxShadow:
                        tx.type === "income"
                          ? "0 0 15px rgba(16,185,129,0.5)"
                          : "0 0 15px rgba(244,63,94,0.5)",
                    },
                  }}
                >
                  {/* Dynamic Timeline Indicator Node */}
                  <Box
                    className="pipeline-node"
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "4px solid var(--bg)",
                      zIndex: 2,
                      transition: "box-shadow 0.3s",
                      bgcolor:
                        tx.type === "income"
                          ? "rgb(16, 185, 129)"
                          : "rgb(244, 63, 94)",
                    }}
                  />

                  {/* Transaction Detail Block */}
                  <Grid
                    container
                    alignItems="center"
                    sx={{
                      flexGrow: 1,
                      p: 2.5,
                      borderRadius: 4,
                      bgcolor: "rgba(255,255,255,0.01)",
                      border: 1,
                      borderColor: "divider",
                      "&:hover": { bgcolor: "action.hover" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontFamily: "monospace",
                          color: "text.disabled",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          mb: 0.5,
                        }}
                      >
                        {new Date(tx.date).toLocaleString()}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", color: "text.primary" }}
                      >
                        Execution Block: {tx.description || "System Payload"}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{ xs: 12, md: 4 }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        justifyContent: { xs: "flex-start", md: "flex-end" },
                        mt: { xs: 1.5, md: 0 },
                      }}
                    >
                      <Chip
                        label={tx.type?.toUpperCase()}
                        size="small"
                        sx={{
                          fontSize: "10px",
                          fontWeight: "bold",
                          borderRadius: 2,
                          border: 1,
                          ...(tx.type === "income"
                            ? {
                                bgcolor: "rgba(16,185,129,0.05)",
                                borderColor: "rgba(16,185,129,0.2)",
                                color: "rgb(52, 211, 153)",
                              }
                            : {
                                bgcolor: "rgba(244,63,94,0.05)",
                                borderColor: "rgba(244,63,94,0.2)",
                                color: "rgb(251, 113, 133)",
                              }),
                        }}
                      />
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 900,
                          color:
                            tx.type === "income"
                              ? "rgb(52, 211, 153)"
                              : "rgb(251, 113, 133)",
                        }}
                      >
                        {tx.type === "income" ? "+" : "-"}₹
                        {tx.amount.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              ))}
            </Stack>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Button
                variant="text"
                sx={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "text.disabled",
                  letterSpacing: "0.2em",
                  "&:hover": { color: "cyan", bgcolor: "transparent" },
                }}
              >
                Load Full Operational History
              </Button>
            </Box>
          </Card>
        </Stack>
      </AnimatePresence>
    </Box>
  );
};
