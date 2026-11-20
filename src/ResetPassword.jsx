import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "./components/Utils/axiosInstance";
import { ToastContainer, Bounce } from "react-toastify";
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

const INVALID_LINK_MESSAGE =
  "This password reset link is invalid or has expired. Request a new link to continue.";

/**
 * The raw token lives only in the URL and in this component's props. It is
 * never written to localStorage, Redux or any other persistent browser store.
 */
export const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [formError, setFormError] = useState("");

  const submitHandler = async (data) => {
    if (loading) return;

    setFormError("");

    if (!token) {
      setFormError(INVALID_LINK_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/user/resetpassword", {
        token,
        password: data.password,
      });

      setSucceeded(true);
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "We could not reset your password. Please try again later.",
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
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {succeeded
                  ? "Your password has been updated."
                  : "Enter your new password below."}
              </Typography>
            </Box>

            {succeeded ? (
              <Stack spacing={3}>
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
                    Password updated
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    You can now sign in with your new password. Any other active
                    sessions have been signed out.
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate("/login")}
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
                  Continue to Sign In
                </Button>
              </Stack>
            ) : (
              <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
                <Stack spacing={3}>
                  {formError && (
                    <Box
                      role="alert"
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        border: 1,
                        borderColor: "error.main",
                        bgcolor: "rgba(239, 68, 68, 0.08)",
                      }}
                    >
                      <Typography variant="body2" color="error.main">
                        {formError}
                      </Typography>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    variant="outlined"
                    required
                    error={!!errors.password}
                    helperText={
                      errors.password?.message ||
                      "At least 8 characters with upper case, lower case and a number."
                    }
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                      maxLength: { value: 100, message: "Maximum 100 characters" },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                        message:
                          "Password must contain uppercase, lowercase and a number",
                      },
                    })}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    placeholder="Re-enter new password"
                    variant="outlined"
                    required
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === getValues("password") ||
                        "Passwords do not match",
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
                      "Reset Password"
                    )}
                  </Button>

                  <Box sx={{ textAlign: "center" }}>
                    <Link
                      component={RouterLink}
                      to="/forgot-password"
                      variant="body2"
                      color="cyan.main"
                      underline="hover"
                      sx={{ fontWeight: "bold" }}
                    >
                      Request a new link
                    </Link>
                  </Box>

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
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
