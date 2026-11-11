import { useSelector } from "react-redux";

// ================ Material UI Components ================
import Backdrop from "@mui/material/Backdrop";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";

/**
 * --- GLOBAL APPLICATION LOADER ---
 * This overlay appears whenever a global API request is in progress.
 * It uses Redux to know when to show itself and what text to display.
 */
const GlobalLoader = () => {
  const { isLoading, loadingText } = useSelector((state) => state.ui);

  return (
    isLoading && (
      <Backdrop
        open
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 2000,
          bgcolor: "rgba(23, 27, 35, 0.72)",
          backdropFilter: "blur(5px)",
        }}
      >
        <Paper
          role="status"
          aria-live="polite"
          elevation={0}
          sx={{
            minWidth: 240,
            p: 3,
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box sx={{ color: "primary.main", display: "flex", p: 0.5 }}>
            <CircularProgress color="inherit" size={34} thickness={4} />
          </Box>
          <Stack spacing={0.5} sx={{ textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
              {loadingText || "Processing…"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait a moment
            </Typography>
          </Stack>
          <Box sx={{ width: 128, mt: 0.5 }}>
            <LinearProgress
              variant="indeterminate"
              color="primary"
              sx={{ height: 3, borderRadius: 2 }}
            />
          </Box>
        </Paper>
      </Backdrop>
    )
  );
};

export default GlobalLoader;