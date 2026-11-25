import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { FiInbox, FiRefreshCw } from "react-icons/fi";

/* ── Saved analysis history: skeleton / empty / ruled archive ── */

const savedOn = (item) => {
  if (!item?.createdAt) return "Saved analysis";

  const date = new Date(item.createdAt);

  if (Number.isNaN(date.getTime())) return "Saved analysis";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const InsightsHistoryCard = ({ insights, isLoading, onRefresh }) => (
  <Box
    component="section"
    aria-labelledby="insights-history-heading"
    sx={{ borderTop: 1, borderColor: "divider", pt: { xs: 3, md: 3.5 } }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={2}
    >
      <Box>
        <Typography
          id="insights-history-heading"
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Recent insights
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.25 }}>
          Saved analysis from this account
        </Typography>
      </Box>

      {insights.length === 0 && !isLoading && (
        <Button
          size="small"
          onClick={onRefresh}
          startIcon={<FiRefreshCw size={12} />}
          sx={{
            minHeight: 30,
            px: 1.25,
            fontSize: 11.5,
            fontWeight: 600,
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          Refresh history
        </Button>
      )}
    </Stack>

    {isLoading ? (
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        <Skeleton height={54} />
        <Skeleton height={54} width="84%" />
      </Stack>
    ) : !insights || insights.length === 0 ? (
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{ mt: 2, color: "text.secondary" }}
      >
        <FiInbox size={17} />
        <Box>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
            No saved insights yet
          </Typography>
          <Typography sx={{ fontSize: 11.5 }}>
            Results from your analyses will appear here.
          </Typography>
        </Box>
      </Stack>
    ) : (
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 1.25 }}>
        {insights.map((item, index) => (
          <Box
            component="li"
            key={item._id || index}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "112px minmax(0, 1fr)" },
              columnGap: 2.5,
              rowGap: 0.5,
              py: 1.65,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "text.secondary",
                pt: 0.2,
                whiteSpace: "nowrap",
              }}
            >
              {savedOn(item)}
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                lineHeight: 1.65,
                color: "text.primary",
                "& p": { my: 0.3 },
              }}
            >
              {item.content || JSON.stringify(item)}
            </Typography>
          </Box>
        ))}
      </Box>
    )}
  </Box>
);
