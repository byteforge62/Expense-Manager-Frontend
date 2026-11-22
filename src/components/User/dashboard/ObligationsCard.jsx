import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowUpRight, FiCalendar } from "react-icons/fi";

/**
 * Upcoming obligations: pending bills due within the next 30 days, taken from
 * `/bills/me?status=pending`. Nothing is invented — an empty account shows an
 * empty state, not sample bills.
 */
export const ObligationsCard = ({ items = [], isLoading, formatCurrency }) => {
  const total = items.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);

  return (
    <Paper
      component="section"
      aria-labelledby="obligations-heading"
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "12px",
        bgcolor: "background.paper",
        p: { xs: 2, sm: 2.5 },
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box>
          <Typography
            id="obligations-heading"
            component="h2"
            sx={{ fontSize: 14, fontWeight: 600 }}
          >
            Upcoming bills
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
            Pending, due in the next 30 days
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
          {formatCurrency(total)}
        </Typography>
      </Stack>

      {isLoading ? (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Skeleton height={22} />
          <Skeleton height={22} width="80%" />
        </Stack>
      ) : items.length === 0 ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, color: "text.secondary" }}>
          <FiCalendar size={16} />
          <Typography sx={{ fontSize: 13 }}>
            No pending bills in the next 30 days.
          </Typography>
        </Stack>
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 1.5 }}>
          {items.slice(0, 4).map((bill) => (
            <Box
              component="li"
              key={bill._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                py: 1,
                borderBottom: 1,
                borderColor: "divider",
                "&:last-of-type": { borderBottom: 0 },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }} noWrap>
                  {bill.name}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  Due{" "}
                  {new Date(bill.dueDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                {formatCurrency(bill.amount)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box
        component={RouterLink}
        to="/private/bills"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          mt: 1.5,
          fontSize: 12.5,
          fontWeight: 600,
          color: "primary.main",
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        Manage bills <FiArrowUpRight size={13} />
      </Box>
    </Paper>
  );
};

export default ObligationsCard;
