import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
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
            borderRadius: 6,
            p: 4,
            position: "relative",
            overflow: "hidden",
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 256,
              height: 256,
              bgcolor: "warning.main",
              opacity: 0.03,
              filter: "blur(96px)",
            }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4, position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: "rgba(245, 158, 11, 0.1)",
                  border: 1,
                  borderColor: "rgba(245, 158, 11, 0.2)",
                  color: "warning.main",
                  borderRadius: 1.5,
                  width: 40,
                  height: 40,
                }}
              >
                <FiRepeat size={16} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Pending Executions
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "0.1em",
                  }}
                >
                  Upcoming Automated Events
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={`${items.length} Scheduled`}
              size="small"
              sx={{
                fontWeight: "black",
                fontSize: "10px",
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
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: "background.paper",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1.5,
                        width: 36,
                        height: 36,
                      }}
                    >
                      <FiCalendar
                        size={14}
                        style={{ color: "var(--mui-palette-warning-main)" }}
                      />
                    </Avatar>
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
