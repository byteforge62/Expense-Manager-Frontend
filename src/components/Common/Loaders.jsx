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
 * --- LOADING INDICATORS ---
 * Two shapes of one concern, kept in one place so they cannot drift apart:
 *
 * - GlobalLoader: app-wide overlay driven by Redux request state.
 * - LoadingSpinner: local indicator for a card, panel or button-sized area.
 */

/**
 * --- GLOBAL APPLICATION LOADER ---
 * This overlay appears whenever a global API request is in progress.
 * It uses Redux to know when to show itself and what text to display.
 */
export const GlobalLoader = () => {
  const { isLoading, loadingText } = useSelector((state) => state.ui);

  return (
    isLoading && (
      <Backdrop
        open
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 2000,
          bgcolor: "rgba(25, 25, 34, 0.42)",
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
            borderRadius: 1.5,
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

/**
 * --- REUSABLE LOADING SPINNER ---
 * A lightweight spinner for localized loading states (e.g., inside a button or small card).
 */
export const LoadingSpinner = ({
  size = 24,
  label = "Loading...",
  color = "cyan.main", // Standardized to accept a theme token pathway
  sx = {}, // Standardized override hook matching standard MUI best practices
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5, // Equivalent to gap-3 (3 * 4px = 12px)
        ...sx,
      }}
    >
      {/* ── SPINNER ELEMENT ── */}
      <Box sx={{ color: color, display: "flex" }}>
        <CircularProgress
          size={size}
          color="inherit" // Inherits the wrapper's text token context
          thickness={4.5}
          sx={{
            animationDuration: "1.5s", // Maintains the original customized linear cadence
          }}
        />
      </Box>

      {/* ── TEXT LABEL ── */}
      {label && (
        <Typography
          variant="caption"
          sx={{
            fontSize: "10px",
            fontWeight: "bold",
            letterSpacing: "0.15em", // Equivalent to tracking-widest
            color: color,
            opacity: 0.8,
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", // Recreates Tailwind's animate-pulse inline
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};
