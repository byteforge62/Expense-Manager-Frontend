import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import { FiCpu, FiInbox, FiRefreshCw } from "react-icons/fi";

/* ── Saved analysis history (skeleton / empty / populated) ── */

export const InsightsHistoryCard = ({ insights, isLoading, onRefresh }) => (
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4, position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "rgba(6, 182, 212, 0.1)",
                border: 1,
                borderColor: "rgba(6, 182, 212, 0.2)",
                color: "cyan.main",
                borderRadius: 3,
                width: 40,
                height: 40,
              }}
            >
              <FiCpu size={16} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Recent insights
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Analysis history
              </Typography>
            </Box>
          </Stack>
          {insights.length === 0 && !isLoading && (
            <Button
              size="small"
              onClick={onRefresh}
              startIcon={<FiRefreshCw size={12} />}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 3,
              }}
            >
              Refresh history
            </Button>
          )}
        </Stack>

        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 4 }}
            />
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 4 }}
            />
          </Stack>
        ) : !insights || insights.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ py: 6, opacity: 0.6 }}
          >
            <Avatar
              sx={{
                bgcolor: "action.hover",
                border: 1,
                borderColor: "divider",
                width: 48,
                height: 48,
              }}
            >
              <FiInbox style={{ color: "var(--mui-palette-text-secondary)" }} />
            </Avatar>
            <Box textAlign="center">
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                No saved insights yet
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxW: 280, mx: "auto", mt: 0.5 }}
              >
                Results from your analyses will appear here.
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Grid container spacing={3} sx={{ position: "relative", zIndex: 1 }}>
            {insights.map((item, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={item._id || index}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2">
                    {item.content || JSON.stringify(item)}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>
);
