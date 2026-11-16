import { useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "./components/Utils/axiosInstance";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";

/**
 * The wording is deliberately the same whether or not the address belongs to an
 * account, so the UI cannot be used to discover registered emails.
 */
const GENERIC_CONFIRMATION =
  "If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.";

export const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submitHandler = async (data) => {
    // Guard against a double submit while the request is in flight.
    if (loading) return;

    setLoading(true);

    try {
      await axiosInstance.post("/user/forgotpassword", {
        email: data.email.trim().toLowerCase(),
      });

      setSent(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "We could not process that request. Please try again later.",
        { position: "top-center", autoClose: 3000, theme: "colored" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ToastContainer transition={Bounce} />

      {/* Decorative ambient lights */}
      <Box
        sx={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 500,
          height: 500,
          borderRadius: "50%",
          bgcolor: "cyan.main",
          opacity: 0.1,
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -160,
          left: -160,
          width: 500,
          height: 500,
          borderRadius: "50%",
          bgcolor: "primary.main",
          opacity: 0.1,
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 6,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: "bold", tracking: "-0.01em" }}
              >
                Forgot Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter your registered email to receive a password reset link.
              </Typography>
            </Box>

            {sent && (
              <Box
                role="status"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: 1,
                  borderColor: "success.main",
                  bgcolor: "rgba(16, 185, 129, 0.08)",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Request received
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {GENERIC_CONFIRMATION}
                </Typography>
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  variant="outlined"
                  required
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: "bold",
                    textTransform: "none",
                    background: "linear-gradient(to right, var(--mui-palette-cyan-main, #00acc1), var(--mui-palette-primary-main, #1976d2))",
                    color: "white",
                    "&:hover": {
                      opacity: 0.9,
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    color="cyan.main"
                    underline="hover"
                    sx={{ fontWeight: "bold" }}
                  >
                    Back to Sign In
                  </Link>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
