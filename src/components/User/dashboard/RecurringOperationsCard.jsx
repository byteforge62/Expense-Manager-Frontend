import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { FiRepeat, FiCalendar, FiClock } from "react-icons/fi";

/* ── Upcoming automated transactions; hidden while loading or empty ── */

export const RecurringOperationsCard = ({ items, isLoading }) => {
  if (isLoading || !items.length) return null;

  return (
        <Card
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "12px",
            p: { xs: 2.5, sm: 3 },
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-panel)",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4, position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ color: "warning.main", display: "flex" }}>
                <FiRepeat size={17} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.97rem",
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                  }}
                >
                  Pending Executions
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  Due before the end of the month
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={`${items.length} Scheduled`}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "11px",
                bgcolor: "rgba(245, 158, 11, 0.1)",
                color: "warning.main",
                border: 1,
                borderColor: "divider",
              }}
            />
          </Stack>
          <Grid container spacing={3} sx={{ position: "relative", zIndex: 1 }}>
            {items.map((item) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item._id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: 1,
                    borderColor: "divider",
                    borderStyle: "dashed",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ color: "warning.main", display: "flex" }}>
                      <FiCalendar size={15} />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          display: "block",
                          maxWidth: 120,
                        }}
                        noWrap
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: "bold",
                          letterSpacing: "0.05em",
                          mt: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <FiClock size={10} />
                        {new Date(item.nextDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "black", color: "error.main" }}
                  >
                    ₹{item.amount.toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
  );
};
