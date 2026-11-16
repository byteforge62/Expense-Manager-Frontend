import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

/* ── Loading placeholder shown while the financial slices load ── */

export const DashboardSkeleton = () => (
  <Stack spacing={4}>
    <Stack direction="row" justifyContent="space-between" alignItems="end">
      <Stack spacing={1} sx={{ width: "40%" }}>
        <Skeleton variant="text" height={40} width="60%" />
        <Skeleton variant="text" height={20} width="40%" />
      </Stack>
      <Skeleton
        variant="rectangular"
        width={140}
        height={40}
        sx={{ borderRadius: 3 }}
      />
    </Stack>
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 4 }}
          />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      {[1, 2].map((i) => (
        <Grid size={{ xs: 12, lg: 6 }} key={i}>
          <Skeleton
            variant="rectangular"
            height={240}
            sx={{ borderRadius: 4 }}
          />
        </Grid>
      ))}
    </Grid>
  </Stack>
);
