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
  const [devResetUrl, setDevResetUrl] = useState("");

  const submitHandler = async (data) => {
    // Guard against a double submit while the request is in flight.
    if (loading) return;

    setLoading(true);
    setDevResetUrl("");

    try {
      const response = await axiosInstance.post("/user/forgotpassword", {
        email: data.email.trim().toLowerCase(),
      });

      // Development only: the API returns a one-time link when SMTP is down.
      setDevResetUrl(response?.data?.data?.devResetUrl || "");
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
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(70% 60% at 50% 0%, var(--accent-electric-soft) 0%, transparent 65%), var(--background)",
        color: "text.primary",
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ToastContainer transition={Bounce} />

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography
                component="h1"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.85rem",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.15,
                }}
              >
                Forgot Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter your registered email to receive a password reset link.
              </Typography>
            </Box>

            {sent && devResetUrl && (
              <Box
                role="status"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: 1,
                  borderColor: "warning.main",
                  bgcolor: "rgba(245,158,11, 0.08)",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Email delivery is unavailable
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  This development environment could not send the email. Use the
                  one-time link below to reset the password.
                </Typography>
                <Button
                  href={devResetUrl}
                  variant="contained"
                  size="small"
                  sx={{ mt: 1.5, textTransform: "none", fontWeight: "bold" }}
                >
                  Open reset link
                </Button>
              </Box>
            )}

            {sent && !devResetUrl && (
              <Box
                role="status"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: 1,
                  borderColor: "success.main",
                  bgcolor: "rgba(16,185,129, 0.08)",
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
                    borderRadius: 1,
                    fontWeight: "bold",
                    textTransform: "none",

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
