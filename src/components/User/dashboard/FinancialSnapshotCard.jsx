import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { FiArrowUpRight, FiArrowDownRight, FiActivity } from "react-icons/fi";

/* ── Hero card: net cash flow and the income/expense split ── */

export const FinancialSnapshotCard = ({
  hasActivity,
  netSavings,
  totalIncome,
  totalExpenses,
  savingsRate,
  formatCurrency,
}) => {
  const scale = Math.max(totalIncome, totalExpenses, 1);

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      <Box sx={{ position: "relative", p: { xs: 2.5, sm: 3.5 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
            columnGap: 5,
            rowGap: 3.5,
            alignItems: "center",
          }}
        >
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "8px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "var(--accent-electric-soft)",
                    color: "primary.main",
                  }}
                >
                  <FiActivity size={14} />
                </Box>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: "-0.005em",
                    textTransform: "none",
                    color: "text.secondary",
                  }}
                >
                  This month
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1.1}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={
                      hasActivity
                        ? Math.min(100, Math.max(0, savingsRate))
                        : 0
                    }
                    size={38}
                    thickness={5}
                    sx={{
                      color:
                        hasActivity && savingsRate < 0
                          ? "error.main"
                          : "primary.main",
                      "& .MuiCircularProgress-circle": {
                        strokeLinecap: "round",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 9.5, fontWeight: 700, lineHeight: 1 }}
                    >
                      {hasActivity ? `${Math.round(savingsRate)}%` : "—"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography
                    sx={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.2 }}
                  >
                    Savings rate
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                    of income
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Typography sx={{ mt: 2, fontSize: 13, color: "text.secondary" }}>
              Net cash flow
            </Typography>
            <Typography
              sx={{
                mt: 0.25,
                fontFamily: "var(--font-display)",
                fontSize: { xs: "2.5rem", sm: "3.05rem" },
                fontWeight: 700,
                letterSpacing: "-0.05em",
                lineHeight: 1.02,
                fontVariantNumeric: "tabular-nums",
                color: hasActivity
                  ? netSavings >= 0
                    ? "text.primary"
                    : "error.main"
                  : "text.disabled",
              }}
            >
              {hasActivity
                ? `${netSavings < 0 ? "−" : ""}${formatCurrency(Math.abs(netSavings))}`
                : "—"}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                {hasActivity
                  ? `${formatCurrency(totalIncome)} income · ${formatCurrency(totalExpenses)} expenses`
                  : "Record your first transaction to see your cash flow here."}
              </Typography>
              {hasActivity && (
                <Chip
                  size="small"
                  label={`${savingsRate}% saved`}
                  sx={{
                    bgcolor: "var(--accent-sage)",
                    color: "success.main",
                    fontWeight: 600,
                    "& .MuiChip-label": { px: 1.25 },
                  }}
                />
              )}
            </Stack>
          </Box>

          <Box
            role={hasActivity ? "img" : undefined}
            aria-label={
              hasActivity
                ? `Recorded cash flow: income ${formatCurrency(totalIncome)}, expenses ${formatCurrency(totalExpenses)}`
                : undefined
            }
            sx={{
              p: 2.25,
              borderRadius: "12px",
              border: 1,
              borderColor: "divider",
              bgcolor: "var(--surface-secondary)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.75 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>Cash flow</Typography>
              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>All recorded</Typography>
            </Stack>

            {hasActivity ? (
              <Stack spacing={1.9}>
                {[
                  {
                    label: "Income",
                    value: totalIncome,
                    color: "success.main",
                    icon: <FiArrowUpRight size={13} />,
                    iconBg: "var(--accent-sage)",
                  },
                  {
                    label: "Expenses",
                    value: totalExpenses,
                    color: "error.main",
                    icon: <FiArrowDownRight size={13} />,
                    iconBg: "var(--accent-peach)",
                  },
                ].map((item) => (
                  <Box key={item.label}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: "6px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: item.iconBg,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                          {item.label}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatCurrency(item.value)}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 7,
                        borderRadius: 99,
                        bgcolor: "var(--surface-tertiary)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${Math.max((item.value / scale) * 100, item.value > 0 ? 4 : 0)}%`,
                          height: "100%",
                          borderRadius: "inherit",
                          bgcolor: item.color,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ py: 1 }}>
                <Box aria-hidden="true" sx={{ display: "flex", alignItems: "flex-end", gap: 0.75, height: 34, mb: 1.25 }}>
                  {[16, 26, 20, 32, 24, 30, 18].map((height, index) => (
                    <Box
                      key={index}
                      sx={{ flex: 1, height, borderRadius: "4px 4px 2px 2px", bgcolor: "var(--accent-electric-soft)" }}
                    />
                  ))}
                </Box>
                <Typography sx={{ fontSize: 12, lineHeight: 1.6, color: "text.secondary" }}>
                  Your cash-flow view will take shape as you add activity.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};
