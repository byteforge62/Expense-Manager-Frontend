import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
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
            <Box sx={{ color: "primary.main", display: "flex" }}>
              <FiCpu size={17} />
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
                Recent insights
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                Saved analysis from this account
              </Typography>
            </Box>
          </Stack>
          {insights.length === 0 && !isLoading && (
            <Button
              size="small"
              onClick={onRefresh}
              startIcon={<FiRefreshCw size={12} />}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
              }}
            >
              Refresh history
            </Button>
          )}
        </Stack>

        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "12px" }} />
          </Stack>
        ) : !insights || insights.length === 0 ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ py: 6, opacity: 0.6 }}
          >
            <Box sx={{ color: "text.secondary", display: "flex" }}>
              <FiInbox size={24} />
            </Box>
            <Box textAlign="center">
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                No saved insights yet
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 280, mx: "auto", mt: 0.5 }}
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
                    borderRadius: "12px",
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
