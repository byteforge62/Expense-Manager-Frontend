import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/* ── Upcoming automated transactions on a single dated line ── */

export const RecurringOperationsCard = ({ items, isLoading }) => {
  if (isLoading || !items.length) return null;

  const visible = items.slice(0, 4);

  return (
    <Box
      component="section"
      aria-labelledby="recurring-heading"
      sx={{ borderTop: 1, borderColor: "divider", pt: { xs: 3, md: 3.5 } }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        spacing={2}
      >
        <Box>
          <Typography
            id="recurring-heading"
            component="h2"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Pending Executions
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.25 }}>
            Due before the end of the month
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "text.secondary",
            whiteSpace: "nowrap",
          }}
        >
          {items.length} Scheduled
        </Typography>
      </Stack>

      <Box sx={{ position: "relative", mt: 2.5 }}>
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", sm: "block" },
            position: "absolute",
            left: 0,
            right: 0,
            top: 4,
            height: 1,
            bgcolor: "divider",
          }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: `repeat(${visible.length}, minmax(0, 1fr))`,
            },
            columnGap: 3,
            rowGap: 2.25,
          }}
        >
          {visible.map((item) => (
            <Box
              key={item._id}
              sx={{ position: "relative", pt: { sm: 2.5 }, minWidth: 0 }}
            >
              <Box
                aria-hidden
                sx={{
                  display: { xs: "none", sm: "block" },
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: "warning.main",
                  boxShadow: "0 0 0 4px var(--background)",
                }}
              />

              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "text.secondary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {new Date(item.nextDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </Typography>
              <Typography
                sx={{ mt: 0.35, fontSize: 13, fontWeight: 600 }}
                noWrap
              >
                {item.title}
              </Typography>
              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: 12.5,
                  color: "text.secondary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ₹{Number(item.amount || 0).toLocaleString("en-IN")}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
