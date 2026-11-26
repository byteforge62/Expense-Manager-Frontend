import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowUpRight, FiImage } from "react-icons/fi";

/**
 * --- RECENT PURCHASES & THEIR IMPACT ---
 *
 * The latest recorded purchases, beside what they did to this month's money:
 * how much was spent, how much of the month's income that is, and the single
 * largest buy. Every number comes from `/purchases/summary` (month to date)
 * and the already-loaded income rows; nothing is recalculated locally.
 */

const formatDate = (value) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
};

const Thumb = ({ purchase }) => (
  <Box
    sx={{
      width: 34,
      height: 34,
      flexShrink: 0,
      borderRadius: "8px",
      border: 1,
      borderColor: "divider",
      bgcolor: "var(--surface-secondary)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "text.secondary",
    }}
  >
    {purchase.imageUrl ? (
      <Box
        component="img"
        src={purchase.imageUrl}
        alt={`Product thumbnail for ${purchase.name}`}
        loading="lazy"
        decoding="async"
        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : (
      <FiImage size={15} aria-hidden="true" />
    )}
  </Box>
);

const ImpactRow = ({ label, value, detail }) => (
  <Box sx={{ py: 0.9, borderTop: 1, borderColor: "divider", "&:first-of-type": { borderTop: 0 } }}>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
      <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Stack>
    <Typography sx={{ mt: 0.15, fontSize: 10.5, color: "text.secondary" }} noWrap>
      {detail}
    </Typography>
  </Box>
);

export const RecentPurchases = ({
  purchases = [],
  summary,
  monthIncome = 0,
  isLoading,
  formatCurrency,
}) => {
  const totals = summary?.totals;
  const largest = summary?.largest?.[0];
  const hasPurchases = Boolean(totals && totals.purchaseCount > 0);
  const incomeShare =
    hasPurchases && monthIncome > 0
      ? Math.round((Number(totals.totalSpend || 0) / monthIncome) * 100)
      : null;

  return (
    <Box
      component="section"
      aria-labelledby="recent-purchases-heading"
      sx={{ borderTop: 1, borderColor: "divider", pt: 1.1 }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            id="recent-purchases-heading"
            component="h2"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "0.98rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Recent purchases
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.15 }}>
            Latest orders and what they cost this month
          </Typography>
        </Box>
        <Box
          component={RouterLink}
          to="/private/purchases"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
            fontSize: 11.5,
            fontWeight: 600,
            color: "primary.main",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Open purchase log <FiArrowUpRight size={13} />
        </Box>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.6fr) minmax(0, 1fr)" },
          gap: { xs: 1.5, md: 2 },
          mt: 0.75,
        }}
      >
        {/* ── The latest purchases ── */}
        <Box>
          {isLoading && purchases.length === 0 ? (
            <Stack spacing={1} sx={{ pt: 0.5 }}>
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} variant="rounded" height={34} />
              ))}
            </Stack>
          ) : purchases.length === 0 ? (
            <Typography sx={{ pt: 0.5, fontSize: 11.5, color: "text.secondary" }}>
              No purchases recorded yet. Record one from the purchase log and it
              will appear here.
            </Typography>
          ) : (
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {purchases.slice(0, 5).map((purchase, index) => (
                <Box
                  component="li"
                  key={purchase._id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "34px minmax(0, 1fr) auto",
                    alignItems: "center",
                    columnGap: 1.25,
                    py: 0.6,
                    borderTop: index === 0 ? 0 : 1,
                    borderColor: "divider",
                  }}
                >
                  <Thumb purchase={purchase} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 600 }} noWrap>
                      {purchase.name}
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: "text.secondary" }} noWrap>
                      {[purchase.merchant || "Store not recorded", formatDate(purchase.purchaseDate)].join(" · ")}
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
                    {formatCurrency(purchase.totalAmount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* ── What those purchases did to this month ── */}
        <Box
          sx={{
            borderTop: { xs: 1, md: 0 },
            borderLeft: { md: 1 },
            borderColor: "divider",
            pt: { xs: 1, md: 0 },
            pl: { md: 2 },
          }}
        >
          {isLoading && !summary ? (
            <Stack spacing={1}>
              <Skeleton height={16} width="42%" />
              <Skeleton height={28} width="60%" />
              <Skeleton height={28} width="52%" />
            </Stack>
          ) : !hasPurchases ? (
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              No purchases this month, so they have not changed this month&apos;s
              cash flow yet.
            </Typography>
          ) : (
            <Box>
              <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Impact this month
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <ImpactRow
                  label="Purchase spend"
                  value={formatCurrency(totals.totalSpend)}
                  detail={`${totals.purchaseCount} purchase${totals.purchaseCount === 1 ? "" : "s"} · ${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"}`}
                />
                <ImpactRow
                  label="Of monthly income"
                  value={incomeShare == null ? "—" : `${incomeShare}%`}
                  detail={
                    incomeShare == null
                      ? "No income recorded this month"
                      : `Against ${formatCurrency(monthIncome)} income`
                  }
                />
                <ImpactRow
                  label="Largest purchase"
                  value={largest ? formatCurrency(largest.totalAmount) : "—"}
                  detail={largest?.name || "No purchases yet"}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RecentPurchases;
