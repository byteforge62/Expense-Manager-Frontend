import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

/* ── Loading placeholder shaped like the compact statement and side panels ── */

export const DashboardSkeleton = () => (
  <Stack spacing={2.5}>
    <Box>
      <Skeleton variant="text" height={30} width="24%" />
      <Skeleton variant="text" height={15} width="42%" />
    </Box>

    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
      {[1, 2, 3, 4].map((item) => (
        <Skeleton
          key={item}
          variant="rounded"
          height={30}
          width={118}
          sx={{ borderRadius: "999px" }}
        />
      ))}
    </Stack>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.55fr) minmax(0, 0.95fr)" },
        gap: 3,
        alignItems: "start",
      }}
    >
      <Stack spacing={3}>
        <Skeleton variant="rectangular" height={196} sx={{ borderRadius: "12px" }} />
        <Skeleton variant="rectangular" height={240} sx={{ borderRadius: "12px" }} />
      </Stack>

      <Stack spacing={3}>
        <Skeleton variant="rectangular" height={210} sx={{ borderRadius: "12px" }} />
        <Skeleton variant="rectangular" height={190} sx={{ borderRadius: "12px" }} />
      </Stack>
    </Box>
  </Stack>
);
