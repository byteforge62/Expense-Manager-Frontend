import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowUpRight, FiShoppingBag } from "react-icons/fi";

/**
 * Dashboard purchase summary, fed by `/purchases/summary` for the current
 * month. It is the same aggregation the Purchases page uses.
 */
export const PurchaseSnapshotCard = ({ summary, isLoading, formatCurrency, monthLabel }) => {
  const totals = summary?.totals;
  const topMerchant = summary?.byMerchant?.[0];

  return (
    <Paper
      component="section"
      aria-labelledby="purchase-snapshot-heading"
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "12px",
        bgcolor: "background.paper",
        p: { xs: 2, sm: 2.5 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box>
          <Typography
            id="purchase-snapshot-heading"
            component="h2"
            sx={{ fontSize: 14, fontWeight: 600 }}
          >
            Purchases
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
            {monthLabel}
          </Typography>
        </Box>
        <FiShoppingBag size={16} style={{ color: "var(--text-muted)" }} />
      </Stack>

      {isLoading ? (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Skeleton height={30} width="60%" />
          <Skeleton height={18} width="80%" />
        </Stack>
      ) : !totals || totals.purchaseCount === 0 ? (
        <Typography sx={{ mt: 2, fontSize: 13, color: "text.secondary" }}>
          No purchases recorded this month.
        </Typography>
      ) : (
        <>
          <Typography
            sx={{ mt: 1.5, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            {formatCurrency(totals.totalSpend)}
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}>
            {totals.purchaseCount} purchase{totals.purchaseCount === 1 ? "" : "s"} ·{" "}
            {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"}
          </Typography>

          {topMerchant && (
            <Typography sx={{ mt: 1.5, fontSize: 12.5, color: "text.secondary" }}>
              Top store:{" "}
              <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                {topMerchant.merchant}
              </Box>{" "}
              ({formatCurrency(topMerchant.spend)})
            </Typography>
          )}
        </>
      )}

      <Box sx={{ mt: "auto", pt: 1.5 }}>
        <Box
          component={RouterLink}
          to="/private/purchases"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: 12.5,
            fontWeight: 600,
            color: "primary.main",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Open purchase log <FiArrowUpRight size={13} />
        </Box>
      </Box>
    </Paper>
  );
};

export default PurchaseSnapshotCard;
