import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiDollarSign,
  FiRefreshCw,
  FiRepeat,
  FiSearch,
  FiShield,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { getFinancialIntelligenceOverview } from "../Utils/financialIntelligenceApi";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  MISSING_VALUE,
} from "../Utils/financialIntelligenceFormatting";
import {
  ChartContainer,
  ConfidenceIndicator,
  EmptyState,
  ErrorState,
  InsightCard,
  MetricCard,
  SectionHeader,
  StatusBadge,
} from "./FinancialIntelligenceComponents";

const colorPalette = [
  "#3985ff",
  "#45b889",
  "#e8b66b",
  "#f07870",
  "#a9c8f5",
  "#8297b7",
  "#4d74ad",
];

const safeArray = (value) => (Array.isArray(value) ? value : []);

const kebabToTitle = (value) =>
  String(value ?? "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getSeverityTone = (severity) => {
  const normalized = String(severity || "").toLowerCase();
  if (normalized.includes("high") || normalized.includes("critical")) {
    return {
      bg: "color-mix(in srgb, var(--negative) 12%, transparent)",
      border: "color-mix(in srgb, var(--negative) 28%, transparent)",
      color: "var(--negative)",
    };
  }
  if (normalized.includes("medium") || normalized.includes("warning")) {
    return {
      bg: "color-mix(in srgb, var(--warning) 14%, transparent)",
      border: "color-mix(in srgb, var(--warning) 28%, transparent)",
      color: "var(--warning)",
    };
  }
  return {
    bg: "color-mix(in srgb, var(--positive) 12%, transparent)",
    border: "color-mix(in srgb, var(--positive) 28%, transparent)",
    color: "var(--positive)",
  };
};

const getHealthTone = (score) => {
  if (score === null || Number.isNaN(Number(score))) {
    return {
      abs: "color-mix(in srgb, var(--text-muted) 14%, transparent)",
      color: "var(--text-muted)",
      label: "Insufficient data",
    };
  }
  if (score >= 75) {
    return {
      abs: "color-mix(in srgb, var(--positive) 14%, transparent)",
      color: "var(--positive)",
      label: "Strong",
    };
  }
  if (score >= 50) {
    return {
      abs: "color-mix(in srgb, var(--warning) 16%, transparent)",
      color: "var(--warning)",
      label: "Moderate",
    };
  }
  return {
    abs: "color-mix(in srgb, var(--negative) 14%, transparent)",
    color: "var(--negative)",
    label: "At risk",
  };
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: "1px solid var(--border-medium)",
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
        {formatCurrency(value)}
      </Typography>
    </Box>
  );
};

export default function FinancialIntelligencePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRules, setExpandedRules] = useState({});
  const requestIdRef = useRef(0);
  const requestControllerRef = useRef(null);
  const hasDataRef = useRef(false);

  const loadOverview = useCallback(async () => {
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    const isRefresh = hasDataRef.current;
    setLoading(!isRefresh);
    setRefreshing(isRefresh);
    setError("");

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 89);

      const overview = await getFinancialIntelligenceOverview(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        { signal: controller.signal },
      );
      if (requestId === requestIdRef.current) {
        setData(overview);
        hasDataRef.current = true;
      }
    } catch (loadError) {
      const cancelled =
        loadError?.name === "AbortError" || loadError?.code === "ERR_CANCELED";
      if (!cancelled && requestId === requestIdRef.current) {
        setError(
          loadError?.response?.data?.message ||
            loadError?.message ||
            "Unable to load financial intelligence right now.",
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
        requestControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    loadOverview();
    return () => {
      requestIdRef.current += 1;
      requestControllerRef.current?.abort();
    };
  }, [loadOverview]);

  const overview = data || {};
  const financialHealth = overview.financialHealth || {};
  const metrics = overview.metrics;
  const behavior = overview.behavior;
  const anomalies = Array.isArray(overview.anomalies) ? overview.anomalies : null;
  const anomalySummary = overview.anomalySummary || {};
  const recommendations = Array.isArray(overview.recommendations)
    ? overview.recommendations
    : null;
  const rules = Array.isArray(overview.rules) ? overview.rules : null;
  const ruleSummary = overview.ruleSummary || {};

  const summaryCards = useMemo(() => {
    const totals = metrics?.totals || {};
    const cashFlow = totals.netCashFlow;
    return [
      {
        label: "Income",
        value: formatCurrency(totals.income),
        icon: FiTrendingUp,
        tone: "color-mix(in srgb, var(--positive) 10%, transparent)",
      },
      {
        label: "Expenses",
        value: formatCurrency(totals.expenses),
        icon: FiTrendingDown,
        tone: "color-mix(in srgb, var(--negative) 10%, transparent)",
      },
      {
        label: "Net cash flow",
        value:
          cashFlow === null || cashFlow === undefined
            ? MISSING_VALUE
            : `${cashFlow > 0 ? "+" : ""}${formatCurrency(cashFlow)}`,
        icon: FiDollarSign,
        tone: "color-mix(in srgb, var(--accent-electric) 10%, transparent)",
      },
      {
        label: "Savings rate",
        value: formatPercentage(totals.savingsRate, { fraction: true }),
        icon: FiShield,
        tone: "color-mix(in srgb, var(--accent-electric) 10%, transparent)",
      },
    ];
  }, [metrics]);

  const trendData = useMemo(() => {
    const dailyTotals = safeArray(metrics?.spending?.dailyTotals);
    return dailyTotals
      .filter((entry) => entry?.date && Number.isFinite(entry.amount))
      .map((entry) => ({
        label: entry.date.slice(5),
        value: entry.amount,
      }));
  }, [metrics]);

  const monthlySeries = useMemo(() => {
    const monthly = safeArray(metrics?.cashFlow?.monthly);
    return monthly
      .filter(
        (entry) =>
          entry?.month &&
          (Number.isFinite(entry.income) || Number.isFinite(entry.expenses)),
      )
      .map((entry) => ({
        label: entry.month,
        income: entry.income,
        expenses: entry.expenses,
        netCashFlow: entry.netCashFlow,
      }));
  }, [metrics]);

  const categoryBreakdown = useMemo(() => {
    const categories = Array.isArray(metrics?.categoryBreakdown)
      ? metrics.categoryBreakdown
      : [];
    return categories
      .filter((entry) => Number.isFinite(entry?.amount))
      .map((entry, index) => ({
      name: entry.category || `Category ${index + 1}`,
      value: entry.amount,
      share: entry.shareOfSpending,
      fill: colorPalette[index % colorPalette.length],
      }));
  }, [metrics]);

  const behaviorObservations = Array.isArray(behavior?.observations)
    ? behavior.observations
    : null;

  const score = financialHealth?.score;
  const healthTone = getHealthTone(financialHealth?.score ?? null);

  const ruleCount = rules?.length;
  const triggeredRules = rules?.filter((rule) => rule.status === "triggered").length;

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, display: "grid", gap: 3 }}>
        <Card sx={{ borderRadius: 5, p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Loading intelligence…</Typography>
        </Card>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, display: "grid", gap: 3 }}>
        <ErrorState
          title="Financial intelligence unavailable"
          message={error}
          actionLabel="Retry"
          onAction={loadOverview}
          refreshing={refreshing}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: "grid", gap: 3, maxWidth: 1400, mx: "auto" }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Financial intelligence
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.04em", mt: 0.5 }}>
              Money signals and decisions
            </Typography>
            {overview.generatedAt && (
              <Typography variant="caption" color="text.secondary">
                Updated {formatDate(overview.generatedAt, { options: { dateStyle: "medium", timeStyle: "short" } })}
              </Typography>
            )}
          </Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {overview.dataConfidence && (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography variant="caption" color="text.secondary">Data confidence</Typography>
                <ConfidenceIndicator level={overview.dataConfidence.level} />
              </Stack>
            )}
            <Button
              variant="contained"
              onClick={loadOverview}
              disabled={refreshing}
              aria-busy={refreshing}
              startIcon={<FiRefreshCw size={16} />}
              sx={{ borderRadius: 3, fontWeight: 700, px: 2.5 }}
            >
              {refreshing ? "Refreshing…" : "Refresh overview"}
            </Button>
          </Stack>
        </Stack>
      </motion.div>

      {error && (
        <ErrorState
          title="Refresh failed"
          message={`${error} Showing the last successfully loaded overview.`}
          actionLabel="Retry"
          onAction={loadOverview}
          refreshing={refreshing}
        />
      )}
      {overview.dataConfidence?.limitations?.length > 0 && (
        <InsightCard tone="warning">
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Data limitations</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {overview.dataConfidence.limitations.join(" ")}
          </Typography>
        </InsightCard>
      )}
      {overview.validationWarnings?.length > 0 && (
        <InsightCard tone="warning">
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Some insights are unavailable</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {overview.validationWarnings.length} response field(s) did not match the expected format. Affected values are shown as unavailable.
          </Typography>
        </InsightCard>
      )}

      <Grid container spacing={2.5}>
        {summaryCards.map(({ label, value, icon: Icon, tone }) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={label}>
            <MetricCard icon={Icon} label={label} value={value} tone={tone} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(139,92,246,0.18)", boxShadow: "0 18px 45px rgba(139,92,246,0.08)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader icon={FiActivity} title="Financial health" eyebrow="Health score" />
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CircularProgress
                    variant="determinate"
                    value={Number.isFinite(score) ? Math.max(0, Math.min(score, 100)) : 0}
                    size={110}
                    thickness={7}
                    sx={{ color: healthTone.color }}
                    aria-label={`Financial health score: ${Number.isFinite(score) ? Math.round(score) : "unavailable"} out of 100`}
                  />
                  <Box sx={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: healthTone.color }}>
                      {Number.isFinite(score) ? Math.round(score) : MISSING_VALUE}
                    </Typography>
                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
                      / 100
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Chip label={financialHealth?.label || "Insufficient data"} sx={{ bgcolor: healthTone.abs, color: healthTone.color, fontWeight: 800, borderRadius: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
                    {financialHealth?.summary || "Use more transaction history to produce a health score."}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "text.secondary" }}>
                  Component check
                </Typography>
                <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                  {(financialHealth?.components ? Object.entries(financialHealth.components) : []).map(([key, value]) => (
                    <Stack key={key} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>{kebabToTitle(key)}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                        {formatPercentage(value?.score)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartContainer
            icon={FiActivity}
            title="Spending trend"
            eyebrow="Daily expenses"
            description="Daily expense amounts over the selected period. Values are localized numbers because no account currency is supplied by the API."
          >
              {trendData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3985ff" stopOpacity={0.34} />
                        <stop offset="95%" stopColor="#3985ff" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
                    <XAxis dataKey="label" stroke="rgba(100,116,139,0.8)" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(100,116,139,0.8)" tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value, { notation: "compact", maximumFractionDigits: 1 })} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#3985ff" strokeWidth={2.5} fill="url(#spendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="Not enough spending data">No daily expense values are available for this period.</EmptyState>
              )}
          </ChartContainer>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(148,163,184,0.15)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader icon={FiBarChart2} title="Behavior analysis" eyebrow="Spending signals" />
              <Stack spacing={1.8}>
                {behaviorObservations?.length ? (
                  behaviorObservations.map((observation, index) => (
                    <InsightCard key={`${observation?.type || "observation"}-${index}`}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {kebabToTitle(observation?.category || observation?.type || `Observation ${index + 1}`)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6, lineHeight: 1.7 }}>
                        {observation?.summary || "No description is available for this observation."}
                      </Typography>
                    </InsightCard>
                  ))
                ) : (
                  <EmptyState title={behaviorObservations ? "No behavior signals" : "Behavior data unavailable"}>
                    {behaviorObservations
                      ? "No behavioral observations are available for this selection yet."
                      : "Behavioral analytics were not included in the response."}
                  </EmptyState>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartContainer
            icon={FiTarget}
            title="Month-by-month flows"
            eyebrow="Cash flow"
            height={270}
            description="Monthly income and expense totals."
          >
              {monthlySeries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySeries}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" stroke="rgba(100,116,139,0.8)" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(100,116,139,0.8)" tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value, { notation: "compact", maximumFractionDigits: 1 })} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill="#45b889" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="expenses" fill="#f07870" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No monthly cash-flow data">Monthly totals are not available for this period.</EmptyState>
              )}
          </ChartContainer>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(148,163,184,0.15)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader icon={FiSearch} title="Anomaly center" eyebrow="Risk watch" />
              {Number.isFinite(anomalySummary.count) && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  {anomalySummary.count} findings · {formatNumber(anomalySummary.eligibleTransactionCategories)} categories with transaction baselines
                </Typography>
              )}
              <Stack spacing={1.8}>
                {anomalies?.length ? (
                  anomalies.map((anomaly, index) => {
                    const tones = getSeverityTone(anomaly.severity || anomaly.type);
                    return (
                      <Box key={`${anomaly?.type || "anomaly"}-${index}`} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: tones.border, bgcolor: tones.bg }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Avatar sx={{ bgcolor: tones.bg, color: tones.color, width: 30, height: 30 }}><FiSearch size={14} /></Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{anomaly?.title || anomaly?.type || "Unusual activity"}</Typography>
                          </Stack>
                          <StatusBadge status={anomaly?.severity || "medium"} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.2, lineHeight: 1.7 }}>
                          {anomaly?.reason || "Deviation detected against the recent spending baseline."}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
                          Observed {formatCurrency(anomaly?.amount)} vs baseline {formatCurrency(anomaly?.baseline)}
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <EmptyState
                    title={anomalies ? "No unusual activity" : "Anomaly data unavailable"}
                    icon={FiShield}
                  >
                    {anomalies
                      ? "No unusual spending patterns detected for this period."
                      : "Anomaly findings were not included in the response."}
                  </EmptyState>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(148,163,184,0.15)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader icon={FiTrendingUp} title="Recommendations" eyebrow="Next actions" />
              <Stack spacing={1.8}>
                {recommendations?.length ? (
                  recommendations.map((item, index) => (
                    <Box key={`${item.id || item.title || "recommendation"}-${index}`} sx={{ p: 2.2, borderRadius: 3, border: "1px solid rgba(139,92,246,0.18)", bgcolor: "rgba(139,92,246,0.04)" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 28, height: 28, bgcolor: "rgba(57,133,255,0.12)", color: "#3985ff" }}><FiTrendingUp size={14} /></Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{item.title || "Recommendation"}</Typography>
                        </Stack>
                        <StatusBadge status={item.priority || "medium"} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>{item.description || item.nextStep}</Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5} sx={{ mt: 1.5 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Typography variant="caption" color="text.secondary">Confidence</Typography>
                          <ConfidenceIndicator level={item.confidenceLevel} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Impact: {item.estimatedFinancialImpact && Number.isFinite(item.estimatedFinancialImpact.amount)
                            ? formatCurrency(item.estimatedFinancialImpact.amount, { currency: item.estimatedFinancialImpact.currency })
                            : "Not estimated"}
                        </Typography>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <EmptyState title={recommendations ? "No recommendations" : "Recommendation data unavailable"} icon={FiShield}>
                    {recommendations
                      ? "No recommendations are active for this period."
                      : "Recommendations were not included in the response."}
                  </EmptyState>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(148,163,184,0.15)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader icon={FiBarChart2} title="Adaptive rules" eyebrow="Policy engine" />
              <Stack spacing={1.8}>
                {rules?.length ? rules.map((rule, index) => {
                  const isOpen = Boolean(expandedRules[index]);
                  const status = rule.status || "not-evaluated";
                  return (
                    <Box key={`${rule.ruleId || rule.id || "rule"}-${index}`} sx={{ p: 2.2, borderRadius: 3, border: "1px solid rgba(148,163,184,0.16)", bgcolor: "rgba(148,163,184,0.02)" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{rule.ruleId || rule.type || `Rule ${index + 1}`}</Typography>
                        <StatusBadge status={status} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>{rule.explanation || rule.trigger || "This rule did not produce a specific explanation."}</Typography>
                      <Button size="small" onClick={() => setExpandedRules((prev) => ({ ...prev, [index]: !prev[index] }))} endIcon={<FiArrowRight size={14} />} sx={{ mt: 1.2, textTransform: "none", fontWeight: 700, color: "text.primary" }}>
                        {isOpen ? "Hide details" : "View details"}
                      </Button>
                      {isOpen && (
                        <Box sx={{ mt: 1.3, p: 1.5, borderRadius: 2, bgcolor: "rgba(15,23,42,0.04)", border: "1px solid rgba(148,163,184,0.12)" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Threshold</Typography>
                          <Typography variant="body2" sx={{ mt: 0.6, fontWeight: 700 }}>
                            {rule.threshold ? JSON.stringify(rule.threshold) : "No threshold configured"}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                }) : (
                  <EmptyState title={rules ? "No adaptive rules" : "Rule data unavailable"}>
                    {rules
                      ? "No adaptive rules are available for this period."
                      : "Adaptive rule results were not included in the response."}
                  </EmptyState>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(148,163,184,0.15)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader icon={FiShield} title="Rule summary" eyebrow="Engine snapshot" />
              <Stack spacing={2}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.16)" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Total rules</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.6 }}>{ruleSummary.total ?? ruleCount ?? MISSING_VALUE}</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.16)" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Triggered</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.6 }}>{ruleSummary.triggered ?? triggeredRules ?? MISSING_VALUE}</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(148,163,184,0.05)", border: "1px solid rgba(148,163,184,0.16)" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Not evaluated</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.6 }}>{ruleSummary.notEvaluated ?? (rules ? rules.filter((rule) => rule.status === "not-evaluated").length : MISSING_VALUE)}</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.18)" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Clear</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.6 }}>{rules ? rules.filter((rule) => rule.status === "clear").length : MISSING_VALUE}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ChartContainer
        icon={FiRepeat}
        title="Category allocation"
        eyebrow="Spending mix"
        description="Expense totals by category. Amount labels are localized numbers because no account currency is supplied by the API."
      >
              {categoryBreakdown.length ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4} stroke="none">
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              ) : (
                <EmptyState title="No category data">Category spending is not available for this period.</EmptyState>
              )}
      </ChartContainer>
    </Box>
  );
}
