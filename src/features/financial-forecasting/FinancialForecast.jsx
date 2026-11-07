
import { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { FiChevronDown, FiActivity } from "react-icons/fi";

import {
  requestFinancialForecast,
} from "./services/financialForecast.api";

import {
  currency,
  normalizeForecast,
} from "./utils/forecastFormatters";

const palette = {
  expected: "#06b6d4",
  best: "#22c55e",
  worst: "#f97316",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const panelSx = {
  borderRadius: 3,
  borderColor: "divider",
  boxShadow: "none",
};

export function FinancialForecast() {
  const [cash, setCash] = useState("");
  const [horizon, setHorizon] = useState(6);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (event) => {
    event.preventDefault();

    const trimmed = cash.trim();
    const value = Number(trimmed);

    if (!trimmed || !Number.isFinite(value) || value < 0) {
      setError("Enter a valid opening cash amount of zero or more.");
      setResult(null);
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const payload = await requestFinancialForecast({
        openingCash: value,
        horizonMonths: horizon,
      });

      setResult(normalizeForecast(payload));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate forecast.",
      );
    } finally {
      setLoading(false);
    }
  };

  const money = (value) =>
    currency(value, result?.currency ?? "INR");

  const confidence = result?.dataConfidence;

  const confidenceColor = {
    LOW: "error",
    MEDIUM: "warning",
    HIGH: "success",
  };

  return (
    <Box
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 1, sm: 2 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary">
            FINANCIAL INTELLIGENCE
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <FiActivity size={24} />

            <Typography variant="h4" fontWeight={800}>
              Cash Flow Forecast
            </Typography>
          </Stack>

          <Typography color="text.secondary">
            Analyze projected cash flow, recurring commitments,
            and future financial position.
          </Typography>
        </Box>

        <Card variant="outlined" sx={panelSx}>
          <CardContent>
            <Box component="form" onSubmit={run} noValidate>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "flex-start" }}
              >
                <TextField
                  fullWidth
                  label="Opening cash (₹)"
                  type="number"
                  value={cash}
                  onChange={(event) => setCash(event.target.value)}
                  inputProps={{ min: 0, step: "any" }}
                  required
                  disabled={loading}
                />

                <TextField
                  select
                  fullWidth
                  label="Forecast horizon"
                  value={horizon}
                  onChange={(event) =>
                    setHorizon(Number(event.target.value))
                  }
                  disabled={loading}
                >
                  {[3, 6, 12].map((months) => (
                    <MenuItem key={months} value={months}>
                      {months} months
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    minWidth: 180,
                    minHeight: 54,
                    borderRadius: 2,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Generate forecast"
                  )}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" role="alert">
            {error}
          </Alert>
        )}

        {!result && !error && !loading && (
          <Alert severity="info">
            Enter your available opening cash to generate a forecast.
            Projections are estimates, not guarantees.
          </Alert>
        )}

        {result && (
          <>
            <Paper variant="outlined" sx={{ ...panelSx, p: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    DATA CONFIDENCE
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={confidence?.level ?? "UNKNOWN"}
                      color={confidenceColor[confidence?.level] ?? "default"}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {confidence?.explanation ??
                      "Confidence information is unavailable."}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    HISTORICAL WINDOW
                  </Typography>

                  <Typography fontWeight={700}>
                    {result.historicalWindow?.days ?? "—"} days
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {result.historicalWindow?.incomeTransactions ?? 0} income
                    transactions ·{" "}
                    {result.historicalWindow?.expenseTransactions ?? 0} expense
                    transactions
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    FORECAST PERIOD
                  </Typography>

                  <Typography fontWeight={700}>
                    {result.forecastPeriod?.horizonMonths ?? horizon} months
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Generated {formatDate(result.generatedAt)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Scenario comparison
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {result.scenarios.map((scenario) => (
                  <Card
                    key={scenario.id}
                    variant="outlined"
                    sx={panelSx}
                  >
                    <CardContent>
                      <Chip
                        size="small"
                        label={scenario.label}
                        sx={{
                          mb: 2,
                          color: palette[scenario.id],
                          fontWeight: 700,
                        }}
                      />

                      <Typography variant="h5" fontWeight={800}>
                        {money(scenario.finalCash)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Projected closing cash
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Stack spacing={1}>
                        <Metric
                          label="Total income"
                          value={money(scenario.totalIncome)}
                        />

                        <Metric
                          label="Total expenses"
                          value={money(scenario.totalExpenses)}
                        />

                        <Metric
                          label="Net cash flow"
                          value={money(scenario.netCashFlow)}
                        />
                      </Stack>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 2 }}
                      >
                        {scenario.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            <Card variant="outlined" sx={panelSx}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={2}>
                  Monthly closing cash
                </Typography>

                <Box sx={{ width: "100%", height: { xs: 300, md: 390 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={result.chart}
                      margin={{
                        top: 10,
                        right: 18,
                        left: 8,
                        bottom: 12,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.2}
                      />

                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />

                      <YAxis
                        width={75}
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("en-IN", {
                            notation: "compact",
                          }).format(value)
                        }
                      />

                      <Tooltip
                        formatter={(value) => money(value)}
                      />

                      <Legend />

                      {result.scenarios.map((scenario) => (
                        <Line
                          key={scenario.id}
                          name={scenario.label}
                          dataKey={scenario.id}
                          stroke={palette[scenario.id]}
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          type="monotone"
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={panelSx}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={1}>
                  Monthly cash-flow breakdown
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Expected scenario · All amounts in {result.currency}
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Income</TableCell>
                        <TableCell align="right">Expenses</TableCell>
                        <TableCell align="right">Pending bills</TableCell>
                        <TableCell align="right">Net flow</TableCell>
                        <TableCell align="right">Closing cash</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {result.monthlyDetails.map((month) => (
                        <TableRow key={month.month}>
                          <TableCell>
                            <Typography fontWeight={700}>
                              {month.label}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            {money(month.totalIncome)}
                          </TableCell>

                          <TableCell align="right">
                            {money(month.totalExpenses)}
                          </TableCell>

                          <TableCell align="right">
                            {money(month.pendingBills)}
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              color:
                                month.netCashFlow < 0
                                  ? "error.main"
                                  : "success.main",
                              fontWeight: 700,
                            }}
                          >
                            {money(month.netCashFlow)}
                          </TableCell>

                          <TableCell align="right" fontWeight={700}>
                            {money(month.closingBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Typography fontWeight={700} mb={1}>
                  Expected scenario details
                </Typography>

                {result.monthlyDetails.map((month) => (
                  <Accordion
                    key={`details-${month.month}`}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px !important",
                      mb: 1,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<FiChevronDown />}>
                      <Typography fontWeight={600}>
                        {month.label} · {money(month.closingBalance)}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Stack spacing={1}>
                        <Metric
                          label="Baseline income"
                          value={money(month.baselineIncome)}
                        />

                        <Metric
                          label="Scheduled income"
                          value={money(month.scheduledIncome)}
                        />

                        <Metric
                          label="Baseline expenses"
                          value={money(month.baselineExpenses)}
                        />

                        <Metric
                          label="Scheduled expenses"
                          value={money(month.scheduledExpenses)}
                        />

                        <Metric
                          label="Pending bills"
                          value={money(month.pendingBills)}
                        />

                        <Metric
                          label="Days covered"
                          value={month.daysCovered}
                        />
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>

            {result.warnings.map((warning, index) => (
              <Alert severity="warning" key={`warning-${index}`}>
                {typeof warning === "string"
                  ? warning
                  : warning.message ?? JSON.stringify(warning)}
              </Alert>
            ))}

            <Accordion variant="outlined" disableGutters sx={panelSx}>
              <AccordionSummary expandIcon={<FiChevronDown />}>
                <Typography fontWeight={800}>
                  Forecast assumptions ({result.assumptions.length})
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={1}>
                  {result.assumptions.map((assumption, index) => (
                    <Typography
                      key={`assumption-${index}`}
                      variant="body2"
                      color="text.secondary"
                    >
                      {index + 1}. {assumption}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Typography variant="caption" color="text.secondary">
              Best and worst cases are deterministic adjustments to historical
              baseline income and expenses. They are illustrative scenarios,
              not statistical confidence intervals or guarantees.
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}

function Metric({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      alignItems="center"
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body2" fontWeight={700} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

export default FinancialForecast;
