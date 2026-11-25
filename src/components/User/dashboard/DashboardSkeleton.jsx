import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

/* ── Loading placeholder shaped like the statement, not a KPI grid ── */

export const DashboardSkeleton = () => (
  <Stack spacing={4}>
    <Box>
      <Skeleton variant="text" height={44} width="34%" />
      <Skeleton variant="text" height={18} width="52%" />
    </Box>

    <Skeleton variant="rectangular" height={286} sx={{ borderRadius: "14px" }} />

    <Stack spacing={1.25}>
      <Skeleton variant="text" height={20} width="18%" />
      {[1, 2, 3].map((row) => (
        <Skeleton key={row} variant="text" height={34} />
      ))}
    </Stack>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        columnGap: 5,
        rowGap: 4,
      }}
    >
      {[1, 2].map((column) => (
        <Stack key={column} spacing={1.5}>
          <Skeleton variant="text" height={22} width="38%" />
          <Skeleton variant="text" height={16} width="60%" />
          <Skeleton variant="rectangular" height={128} sx={{ borderRadius: "8px" }} />
        </Stack>
      ))}
    </Box>

    <Skeleton variant="rectangular" height={260} sx={{ borderRadius: "12px" }} />
  </Stack>
);
