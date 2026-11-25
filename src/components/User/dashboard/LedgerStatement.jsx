import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiTarget,
} from "react-icons/fi";

/**
 * --- THE STATEMENT ---
 *
 * The dashboard opens with one account-statement sheet instead of a row of KPI
 * cards: the net position is set large, a single flow rule divides income from
 * spending, and the three supporting figures sit in the statement's right-hand
 * column like ledger totals.
 */
export const LedgerStatement = ({
  hasActivity,
  netSavings,
  totalIncome,
  totalExpenses,
  savingsRate,
  totalBudget,
  hasFinancialData,
  formatCurrency,
}) => {
  const flowTotal = totalIncome + totalExpenses;
  const incomeShare = flowTotal > 0 ? (totalIncome / flowTotal) * 100 : 0;
  const expenseShare = flowTotal > 0 ? (totalExpenses / flowTotal) * 100 : 0;

  const rows = [
    {
      label: "Income received",
      value: totalIncome,
      note: "Recorded entries",
      color: "var(--positive)",
      icon: <FiArrowUpRight size={14} />,
    },
    {
      label: "Expenses tracked",
      value: totalExpenses,
      note: "Recorded entries",
      color: "var(--negative)",
      icon: <FiArrowDownRight size={14} />,
    },
    {
      label: "Budget planned",
      value: totalBudget,
      note: "Across your budgets",
      color: "var(--primary)",
      icon: <FiTarget size={14} />,
    },
  ];

  return (
    <Box
      component="section"
      aria-labelledby="ledger-statement-heading"
      sx={{
        position: "relative",
        border: 1,
        borderColor: "divider",
        borderRadius: "12px",
        bgcolor: "background.paper",
        boxShadow: "var(--shadow-panel)",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          height: 2,
          background:
            "linear-gradient(90deg, var(--primary) 0%, var(--primary) 22%, color-mix(in srgb, var(--primary) 18%, transparent) 62%, transparent 100%)",
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.4fr) minmax(0, 0.6fr)" },
        }}
      >
        {/* ── The balance ── */}
        <Box sx={{ p: { xs: 1.75, sm: 2, md: 2.2 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            spacing={2}
          >
            <Typography
              id="ledger-statement-heading"
              sx={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.01em",
                color: "text.secondary",
              }}
            >
              Net position
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
              This month
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 0.6,
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.9rem", sm: "2.1rem", md: "2.25rem" },
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: hasActivity
                ? netSavings >= 0
                  ? "text.primary"
                  : "var(--negative)"
                : "text.disabled",
            }}
          >
            {hasActivity
              ? `${netSavings < 0 ? "−" : ""}${formatCurrency(Math.abs(netSavings))}`
              : "—"}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ mt: 0.9, flexWrap: "wrap", rowGap: 0.5 }}
          >
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {hasActivity
                ? `${formatCurrency(totalIncome)} income · ${formatCurrency(totalExpenses)} expenses`
                : "Record your first transaction to see your cash flow here."}
            </Typography>

            {hasActivity && (
              <Chip
                size="small"
                label={`${savingsRate}% saved`}
                sx={{
                  height: 20,
                  fontSize: 10.5,
                  fontWeight: 600,
                  bgcolor: "var(--accent-sage)",
                  color: "success.main",
                  "& .MuiChip-label": { px: 1.1 },
                }}
              />
            )}
          </Stack>

          {/* The flow rule: one line, split by what came in and what went out */}
          <Box
            role={hasActivity ? "img" : undefined}
            aria-label={
              hasActivity
                ? `Recorded cash flow: income ${formatCurrency(totalIncome)}, expenses ${formatCurrency(totalExpenses)}`
                : undefined
            }
            sx={{ mt: 1.2 }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              spacing={2}
            >
              <Typography
                sx={{ fontSize: 10.5, fontWeight: 600, color: "text.secondary" }}
              >
                Cash flow
              </Typography>

              {hasActivity && (
                <Stack direction="row" spacing={2.25}>
                  <Stack direction="row" spacing={0.5} alignItems="baseline">
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatCurrency(totalIncome)}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                      in
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="baseline">
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatCurrency(totalExpenses)}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                      out
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Stack>

            <Box
              sx={{
                mt: 1,
                display: "flex",
                gap: "2px",
                height: 5,
                borderRadius: "999px",
                overflow: "hidden",
                bgcolor: "var(--surface-tertiary)",
              }}
            >
              {hasActivity ? (
                <>
                  <Box
                    sx={{
                      width: `${incomeShare}%`,
                      bgcolor: "var(--positive)",
                    }}
                  />
                  <Box
                    sx={{
                      width: `${expenseShare}%`,
                      bgcolor: "var(--negative)",
                    }}
                  />
                </>
              ) : (
                <Box sx={{ width: "100%", bgcolor: "var(--border-subtle)" }} />
              )}
            </Box>

            {hasActivity ? (
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 0.7 }}
              >
                <Stack direction="row" spacing={0.65} alignItems="center">
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "var(--positive)",
                    }}
                  />
                  <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                    Income
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.65} alignItems="center">
                  <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                    Expenses
                  </Typography>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "var(--negative)",
                    }}
                  />
                </Stack>
              </Stack>
            ) : (
              <Typography
                sx={{ mt: 1, fontSize: 11.5, color: "text.secondary" }}
              >
                Your cash-flow view will take shape as you add activity.
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── The ledger totals ── */}
        <Box
          sx={{
            borderTop: { xs: 1, lg: 0 },
            borderLeft: { lg: 1 },
            borderColor: "divider",
            bgcolor: "var(--surface-secondary)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {rows.map((row, index) => (
            <Box
              key={row.label}
              sx={{
                px: { xs: 1.75, sm: 2 },
                py: 0.9,
                borderTop: index === 0 ? 0 : 1,
                borderColor: "divider",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1.5}
              >
                <Stack
                  direction="row"
                  spacing={0.85}
                  alignItems="center"
                  sx={{ minWidth: 0 }}
                >
                  <Box sx={{ color: row.color, display: "flex", flexShrink: 0 }}>
                    {row.icon}
                  </Box>
                  <Typography
                    sx={{ fontSize: 11.5, fontWeight: 500, color: "text.secondary" }}
                    noWrap
                  >
                    {row.label}
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: { xs: "0.98rem", sm: "1.08rem" },
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hasFinancialData ? formatCurrency(row.value) : "—"}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 0.3,
                  pl: 2.3,
                  fontSize: 10,
                  color: "text.secondary",
                }}
              >
                {hasFinancialData ? row.note : "Add a record to get started"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default LedgerStatement;
