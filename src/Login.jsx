import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "./redux/slices/authSlice";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "./components/Utils/axiosInstance";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import fintrackMark from "./assets/brand/fintrack-mark.svg";

/**
 * --- LOGIN ---
 * Authenticates the user and routes them to the right dashboard.
 */
export const Login = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.ui);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (data) => {
    let wakingUpToast = null;

    const wakingUpTimer = setTimeout(() => {
      wakingUpToast = toast.info(
        "Backend is waking up... this might take a minute.",
        {
          position: "top-center",
          autoClose: false,
        },
      );
    }, 10000);

    try {
      const res = await axiosInstance.post("/user/login", data);
      clearTimeout(wakingUpTimer);
      if (wakingUpToast) toast.dismiss(wakingUpToast);

      if (res.status === 200) {
        const responseData = res.data?.data || res.data;
        const user =
          responseData?.user ||
          (responseData?._id ? responseData : null) ||
          res.data?.user ||
          null;
        const role = user?.role || responseData?.role || res.data?.role;
        const token = responseData?.token || res.data?.token;

        const loginData = { user, role, token };

        if (!loginData.user?._id || !loginData.token) {
          console.error("Incomplete user data from API:", res.data);
          toast.error("Login failed: Missing user details.", {
            position: "top-center",
            autoClose: 3000,
          });
          return;
        }

        toast.success("Login successful! Welcome back.", {
          position: "top-center",
          autoClose: 2000,
        });

        dispatch(loginSuccess(loginData));

        if (role === "Admin") {
          navigate("/admin/admindashboard");
        } else {
          navigate("/private/userdashboard");
        }
      }
    } catch (error) {
      clearTimeout(wakingUpTimer);
      if (wakingUpToast) toast.dismiss(wakingUpToast);

      const errorMessage =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "Login timed out. Please try again."
          : "Login failed");

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <Box
      sx={{
        color: "text.primary",
        py: { xs: 4, md: 6 },
        background:
          "radial-gradient(80% 70% at 88% 0%, var(--accent-electric-soft) 0%, transparent 62%), var(--background)",
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
          <Grid size={{ xs: 12, lg: 6 }} sx={{ order: { xs: 2, lg: 1 } }}>
            <Stack spacing={3.5} sx={{ maxWidth: 480 }}>
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
                Keep the book.
                <br />
                The numbers follow.
              </Typography>

              <Typography sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 400 }}>
                Sign in to see this month&apos;s balance, what is left in each
                budget, and the entries that still need your attention.
              </Typography>

              <Stack sx={{ borderTop: 1, borderColor: "divider", display: { xs: "none", md: "flex" } }}>
                {[
                  {
                    label: "One ledger",
                    text: "Income, spending, budgets and forecasts, kept together.",
                  },
                  {
                    label: "Your records",
                    text: "Scoped to your account and served over an authenticated API.",
                  },
                  {
                    label: "Open data",
                    text: "Export your entries whenever you need them.",
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{ py: 1.5, borderBottom: 1, borderColor: "divider" }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Right: the form */}
          <Grid size={{ xs: 12, lg: 6 }} sx={{ order: { xs: 1, lg: 2 } }}>
            <Box
              sx={{
                maxWidth: 460,
                mx: { xs: "auto", lg: "auto" },
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
                  Welcome back
                </Typography>
                <Typography sx={{ mt: 0.75, color: "text.secondary", fontSize: 13.5 }}>
                  Enter your details to open your dashboard.
                </Typography>
              </Box>

              <Stack
                component="form"
                onSubmit={handleSubmit(submitHandler)}
                spacing={2.5}
                noValidate
              >
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
                  placeholder="••••••••"
                  variant="outlined"
                  required
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register("password", { required: "Password is required" })}
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

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label={
                      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                        Remember me
                      </Typography>
                    }
                    sx={{ ml: -0.5 }}
                  />
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    underline="hover"
                    sx={{ fontSize: 12.5, fontWeight: 600, color: "text.primary" }}
                  >
                    Forgot password?
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  endIcon={isLoading ? null : <FiArrowRight size={17} />}
                  sx={{ minHeight: 46, mt: 0.5 }}
                >
                  {isLoading ? (
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <CircularProgress size={16} sx={{ color: "inherit" }} />
                      <span>Authenticating…</span>
                    </Stack>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center" }}>
                New to FinTrack?{" "}
                <Link
                  component={RouterLink}
                  to="/signup"
                  underline="hover"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
