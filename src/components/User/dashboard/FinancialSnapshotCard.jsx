import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { FiActivity } from "react-icons/fi";

/* ── Hero card: net cash flow and the income/expense split ── */

export const FinancialSnapshotCard = ({
  hasActivity,
  netSavings,
  totalIncome,
  totalExpenses,
  savingsRate,
  formatCurrency,
}) => (
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          border: "1px solid rgba(123, 164, 230, 0.22)",
          background:
            "radial-gradient(circle at 85% 12%, rgba(95, 151, 255, 0.22), transparent 30%), linear-gradient(116deg, #151d2a 0%, #1c2b41 56%, #263f64 100%)",
          color: "#f5f8ff",
          boxShadow: "0 22px 48px rgba(25, 42, 66, 0.16)",
          "&::after": {
            content: '""',
            position: "absolute",
            width: 280,
            height: 280,
            right: -120,
            bottom: -180,
            borderRadius: "50%",
            border: "1px solid rgba(194, 216, 255, 0.15)",
            boxShadow: "0 0 0 28px rgba(194, 216, 255, 0.025), 0 0 0 58px rgba(194, 216, 255, 0.02)",
            pointerEvents: "none",
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1, p: { xs: 2.5, sm: 4 } }}>
          <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#8bc2ff", boxShadow: "0 0 0 5px rgba(139, 194, 255, 0.13)" }} />
                <Typography variant="overline" sx={{ color: "#b9d5ff", fontWeight: 700, letterSpacing: "0.13em" }}>
                  YOUR FINANCIAL SNAPSHOT
                </Typography>
              </Stack>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 600, letterSpacing: "-0.025em" }}>
                Your money, in focus.
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(235, 242, 255, 0.68)", mt: 0.75, maxWidth: 430, lineHeight: 1.7 }}>
                A thoughtful overview of income, spending and the plans you’re building.
              </Typography>

              <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                <Typography variant="caption" sx={{ color: "rgba(235, 242, 255, 0.65)", fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase" }}>
                  Net cash flow
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    color: hasActivity ? (netSavings >= 0 ? "#a9d8c3" : "#ffaaa4") : "#f5f8ff",
                    fontWeight: 700,
                    letterSpacing: "-0.055em",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: { xs: "2.5rem", sm: "3.2rem" },
                    mt: 0.5,
                  }}
                >
                  {hasActivity ? `${netSavings < 0 ? "−" : ""}${formatCurrency(Math.abs(netSavings))}` : "—"}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(235, 242, 255, 0.62)", mt: 0.75 }}>
                  {hasActivity
                    ? `${formatCurrency(totalIncome)} income · ${formatCurrency(totalExpenses)} expenses`
                    : "Record your first transaction to see your cash flow here."}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                role={hasActivity ? "img" : undefined}
                aria-label={hasActivity ? `Recorded cash flow: income ${formatCurrency(totalIncome)}, expenses ${formatCurrency(totalExpenses)}` : undefined}
                sx={{
                  p: { xs: 2.25, sm: 2.75 },
                  borderRadius: 3,
                  border: "1px solid rgba(226, 237, 255, 0.12)",
                  bgcolor: "rgba(9, 17, 29, 0.24)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.25 }}>
                  <Typography variant="subtitle2" sx={{ color: "#f5f8ff", fontWeight: 700 }}>
                    Cash flow
                  </Typography>
                  {hasActivity && (
                    <Chip
                      size="small"
                      icon={<FiActivity size={13} />}
                      label={`${savingsRate}% saved`}
                      sx={{
                        height: 27,
                        color: "#c4e7d4",
                        bgcolor: "rgba(94, 183, 135, 0.12)",
                        border: "1px solid rgba(146, 218, 180, 0.2)",
                        "& .MuiChip-icon": { color: "inherit", ml: 1 },
                        "& .MuiChip-label": { px: 1, fontSize: 11, fontWeight: 700 },
                      }}
                    />
                  )}
                </Stack>
                {hasActivity ? (
                  <Stack spacing={2}>
                    {[
                      { label: "Income", value: totalIncome, color: "#70d5aa" },
                      { label: "Expenses", value: totalExpenses, color: "#ff9289" },
                    ].map((item) => (
                      <Box key={item.label}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                          <Typography variant="caption" sx={{ color: "rgba(235, 242, 255, 0.72)", fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#f5f8ff", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                            {formatCurrency(item.value)}
                          </Typography>
                        </Stack>
                        <Box sx={{ height: 7, borderRadius: 99, bgcolor: "rgba(238, 244, 255, 0.09)", overflow: "hidden" }}>
                          <Box
                            sx={{
                              width: `${item.value > 0 ? Math.max((item.value / Math.max(totalIncome, totalExpenses)) * 100, 4) : 0}%`,
                              height: "100%",
                              borderRadius: "inherit",
                              bgcolor: item.color,
                              transition: "width 300ms ease",
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                    <Typography variant="caption" sx={{ color: "rgba(235, 242, 255, 0.46)", pt: 0.25 }}>
                      Totals across your recorded transactions
                    </Typography>
                  </Stack>
                ) : (
                  <Box sx={{ py: 1.5 }}>
                    <Box aria-hidden="true" sx={{ display: "flex", alignItems: "flex-end", gap: 0.75, height: 38, mb: 1.5 }}>
                      {[18, 30, 23, 38, 27, 34, 22].map((height, index) => (
                        <Box key={index} sx={{ flex: 1, height, borderRadius: "4px 4px 2px 2px", bgcolor: "rgba(170, 202, 255, 0.22)" }} />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ color: "rgba(235, 242, 255, 0.75)", lineHeight: 1.6 }}>
                      Your cash-flow view will take shape as you add activity.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
);
