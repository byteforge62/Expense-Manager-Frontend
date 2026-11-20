import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "./components/Utils/axiosInstance";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import {
  FiUser,
  FiCalendar,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import fintrackMark from "./assets/brand/fintrack-mark.svg";

/**
 * --- SIGNUP ---
 * Creates a standard user account; administrative roles are never issued here.
 */
export const Signup = () => {
  const { isLoading } = useSelector((state) => state.ui);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (data) => {
    try {
      const res = await axiosInstance.post("/user", { ...data, role: "User" });

      if (res.status === 201) {
        toast.success("Account created! Redirecting to login...", {
          position: "top-center",
          autoClose: 2000,
        });

        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again.",
        { position: "top-center", autoClose: 3000 },
      );
    }
  };

  return (
    <Box
      sx={{
        color: "text.primary",
        py: { xs: 4, md: 6 },
        background:
          "radial-gradient(80% 70% at 12% 0%, var(--accent-electric-soft) 0%, transparent 58%), var(--background)",
      }}
    >
      <ToastContainer transition={Bounce} theme="light" />

      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 4, lg: 8 }}
          alignItems="center"
          sx={{ minHeight: { lg: "calc(100vh - 160px)" } }}
        >
          {/* Left: the statement */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack spacing={3.5} sx={{ maxWidth: 440 }}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box component="img" src={fintrackMark} alt="" sx={{ width: 30, height: 30 }} />
                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  FinTrack
                </Typography>
              </Stack>

              <Typography
                component="h1"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "2.15rem", sm: "2.8rem" },
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.045em",
                }}
              >
                Start a ledger
                <br />
                you will keep.
              </Typography>

              <Typography sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 380 }}>
                One account holds your income, spending, budgets and forecasts.
                Add your first entry today and the month already makes more sense.
              </Typography>

              <Stack sx={{ borderTop: 1, borderColor: "divider", display: { xs: "none", md: "flex" } }}>
                {[
                  "No card required to start",
                  "Recurring entries handled for you",
                  "Export or delete your records any time",
                ].map((item) => (
                  <Stack
                    key={item}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ py: 1.5, borderBottom: 1, borderColor: "divider" }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "secondary.main",
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Right: the form */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box
              sx={{
                maxWidth: 520,
                mx: "auto",
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: "12px",
                boxShadow: "var(--shadow-panel)",
                p: { xs: 3, sm: 4.5 },
              }}
            >
              <Box sx={{ mb: 3.5 }}>
                <Typography
                  component="h2"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.85rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.15,
                  }}
                >
                  Create account
                </Typography>
                <Typography sx={{ mt: 0.75, color: "text.secondary", fontSize: 13.5 }}>
                  A name, an email and a password is all it takes.
                </Typography>
              </Box>

              <Stack
                component="form"
                onSubmit={handleSubmit(submitHandler)}
                spacing={2.5}
                noValidate
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      type="text"
                      placeholder="John Doe"
                      variant="outlined"
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      {...register("name", { required: "Name is required" })}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiUser size={15} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      placeholder="25"
                      variant="outlined"
                      required
                      error={!!errors.age}
                      helperText={errors.age?.type === "min" ? "Must be 18+" : errors.age?.message}
                      {...register("age", { required: "Age is required", min: 18 })}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiCalendar size={15} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                </Grid>

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
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiMail size={15} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  variant="outlined"
                  required
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Min. 8 characters required",
                    },
                  })}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiLock size={15} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            size="small"
                          >
                            {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  endIcon={isLoading ? null : <FiArrowRight size={17} />}
                  sx={{ minHeight: 46 }}
                >
                  {isLoading ? (
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <CircularProgress size={16} sx={{ color: "inherit" }} />
                      <span>Creating account…</span>
                    </Stack>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center" }}>
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
