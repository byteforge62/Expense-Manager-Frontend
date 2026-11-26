import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Link as RouterLink } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCalendar,
  FiShoppingBag,
} from "react-icons/fi";

/**
 * --- MONEY FLOW ---
 *
 * Bills and purchases share one section, split by a single vertical rule. Bills
 * read as a dated rail (day in the margin), purchases as a receipt: total,
 * count, and the stores that account for it. No separate KPI cards.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const SectionHeading = ({ id, children, aside }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="baseline"
    spacing={2}
  >
    <Typography id={id} component="h2" sx={{ fontSize: 13, fontWeight: 600 }}>
      {children}
    </Typography>
    {aside}
  </Stack>
);

const SectionLink = ({ to, children }) => (
  <Box
    component={RouterLink}
    to={to}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      mt: 0.7,
      fontSize: 11.5,
      fontWeight: 600,
      color: "primary.main",
      textDecoration: "none",
      "&:hover": { textDecoration: "underline" },
    }}
  >
    {children} <FiArrowUpRight size={13} />
  </Box>
);

export const MoneyFlow = ({
  bills = [],
  billsLoading,
  purchaseSummary,
  purchasesLoading,
  formatCurrency,
  monthLabel,
}) => {
  const billsTotal = bills.reduce(
    (sum, bill) => sum + Number(bill.amount || 0),
    0,
  );
  const totals = purchaseSummary?.totals;
  const topMerchant = purchaseSummary?.byMerchant?.[0];

  return (
    <Box
      component="section"
      sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
    >
      {/* ── Bills, on a date rail ── */}
      <Box component="div">
        <SectionHeading
          id="obligations-heading"
          aside={
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(billsTotal)}
            </Typography>
          }
        >
          Upcoming bills
        </SectionHeading>
        <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.2 }}>
          Pending, due in the next 30 days
        </Typography>

        {billsLoading ? (
          <Stack spacing={1} sx={{ mt: 1.25 }}>
            <Skeleton height={32} />
            <Skeleton height={32} width="82%" />
          </Stack>
        ) : bills.length === 0 ? (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 1.25, color: "text.secondary" }}
          >
            <FiCalendar size={14} />
            <Typography sx={{ fontSize: 11.5 }}>
              No pending bills in the next 30 days.
            </Typography>
          </Stack>
        ) : (
          <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, mt: 0.75 }}>
            {bills.slice(0, 2).map((bill) => {
              const due = new Date(bill.dueDate);

              return (
                <Box
                  component="li"
                  key={bill._id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "42px minmax(0, 1fr) auto",
                    alignItems: "center",
                    columnGap: 1.5,
                    py: 0.5,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      pr: 1.5,
                      borderRight: 1,
                      borderColor: "divider",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "var(--font-display)",
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {String(due.getDate()).padStart(2, "0")}
                    </Typography>
                    <Typography
                      sx={{ mt: 0.2, fontSize: 9, color: "text.secondary" }}
                    >
                      {MONTHS[due.getMonth()]}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }} noWrap>
                      {bill.name}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                      Due{" "}
                      {due.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatCurrency(bill.amount)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        <SectionLink to="/private/bills">Manage bills</SectionLink>
      </Box>

      {/* ── Purchases, as a receipt ── */}
      <Box sx={{ borderTop: 1, borderColor: "divider", pt: 1.25 }}>
        <SectionHeading
          id="purchase-snapshot-heading"
          aside={<FiShoppingBag size={15} style={{ color: "var(--text-muted)" }} />}
        >
          Purchases
        </SectionHeading>
        <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.2 }}>
          {monthLabel}
        </Typography>

        {purchasesLoading ? (
          <Stack spacing={1} sx={{ mt: 1.25 }}>
            <Skeleton height={36} width="55%" />
            <Skeleton height={16} width="78%" />
          </Stack>
        ) : !totals || totals.purchaseCount === 0 ? (
          <Typography sx={{ mt: 1.25, fontSize: 11.5, color: "text.secondary" }}>
            No purchases recorded this month.
          </Typography>
        ) : (
          <>
            <Stack
              direction="row"
              alignItems="baseline"
              spacing={2}
              sx={{ mt: 0.6 }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  letterSpacing: "-0.045em",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatCurrency(totals.totalSpend)}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                {totals.purchaseCount} purchase
                {totals.purchaseCount === 1 ? "" : "s"} · {totals.itemCount} item
                {totals.itemCount === 1 ? "" : "s"}
              </Typography>
            </Stack>

            {topMerchant && (
              <Typography sx={{ mt: 0.5, fontSize: 11, color: "text.secondary" }}>
                Top store{" "}
                <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                  {topMerchant.merchant}
                </Box>{" "}
                ({formatCurrency(topMerchant.spend)})
              </Typography>
            )}

            
          </>
        )}

        <SectionLink to="/private/purchases">Open purchase log</SectionLink>
      </Box>
    </Box>
  );
};

export default MoneyFlow;
