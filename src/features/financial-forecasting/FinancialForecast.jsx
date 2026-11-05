
import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
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

    if (
      !trimmed ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      setError(
        "Enter a valid opening cash amount of zero or more.",
      );
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

          <Typography variant="h4" fontWeight={800}>
            Cash Flow Forecast
          </Typography>

          <Typography color="text.secondary">
            Compare projected closing cash across three
            assumption-based scenarios.
          </Typography>
        </Box>

        <Card variant="outlined" sx={{ borderRadius: 4 }}>
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
                  onChange={(event) =>
                    setCash(event.target.value)
                  }
                  inputProps={{
                    min: 0,
                    step: "any",
                  }}
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
                    <MenuItem
                      key={months}
                      value={months}
                    >
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
                    <CircularProgress
                      size={22}
                      color="inherit"
                    />
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
            Enter your current available cash to generate
            a forecast. Figures are projections, not guarantees.
          </Alert>
        )}

        {result && (
          <>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
            >
              {result.scenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 4,
                    flex: 1,
                  }}
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

                    <Typography
                      variant="h5"
                      fontWeight={800}
                    >
                      {currency(scenario.finalCash)}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Projected closing cash at horizon
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Card
              variant="outlined"
              sx={{ borderRadius: 4 }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  mb={2}
                >
                  Monthly closing cash
                </Typography>

                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 300, md: 390 },
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
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

                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis
                        width={75}
                        tickFormatter={(value) =>
                          new Intl.NumberFormat("en-IN", {
                            notation: "compact",
                          }).format(value)
                        }
                      />

                      <Tooltip
                        formatter={(value) => currency(value)}
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

            {result.warnings.map((warning, index) => (
              <Alert
                severity="warning"
                key={index}
              >
                {typeof warning === "string"
                  ? warning
                  : warning.message ||
                    JSON.stringify(warning)}
              </Alert>
            ))}

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Best and worst cases are deterministic
              assumptions, not statistical confidence intervals.
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}
