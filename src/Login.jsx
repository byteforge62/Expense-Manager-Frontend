import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "./redux/auth/authSlice";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "./components/Utils/axiosInstance";
import { motion } from "framer-motion";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
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
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";

// ================ Icons ================
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiTrendingUp,
  FiPieChart,
  FiShield,
  FiCheckCircle,
  FiBarChart2,
} from "react-icons/fi";

/**
 * --- LOGIN COMPONENT ---
 * This handles authenticating users and redirecting them to the correct dashboard.
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

  // --- FORM SUBMISSION LOGIC ---
  const submitHandler = async (data) => {
    let wakingUpToast = null;

    // If the backend (e.g. Render/Railway) is sleeping, let the user know 
    // so they don't think the app is broken.
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
      // Send credentials to the server
      const res = await axiosInstance.post("/user/login", data);
      // Cleanup the "waking up" notice if it triggered
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

        // Do not mark the session authenticated without the account and token.
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

        // Store the user info in our global Redux state
        dispatch(loginSuccess(loginData));

        // Send Admins and Users to their respective homes
        if (role === "Admin") {
          navigate("/admin/admindashboard");
        } else {
          navigate("/private/userdashboard");
        }
      }
    } catch (error) {
      clearTimeout(wakingUpTimer);
      if (wakingUpToast) toast.dismiss(wakingUpToast);

      // Handle common errors like wrong password or server timeout
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
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        bgcolor: "background.default",
        color: "text.primary",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ToastContainer transition={Bounce} theme="dark" />

      {/* Dynamic ambient lights */}
      <Box
        sx={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 500,
          height: 500,
          borderRadius: "50%",
          bgcolor: "cyan.main",
          opacity: 0.05,
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
          opacity: 0.05,
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      <Paper
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 1000,
          borderRadius: 8,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Grid container>
          {/* ══ LEFT PANEL ══ */}
          <Grid
            size={{ xs: 0, lg: 6 }}
            sx={{
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              justifyContent: "space-between",
              bgcolor: "action.hover",
              borderRight: 1,
              borderColor: "divider",
              p: 6,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Ambient light overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Brand */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ zIndex: 1 }}>
              <Avatar
                sx={{
                  bgcolor: "cyan.main",
                  width: 40,
                  height: 40,
                  borderRadius: 3,
                  boxShadow: "0 8px 16px 0 rgba(6, 182, 212, 0.2)",
                }}
              >
                <FiTrendingUp style={{ color: "white" }} />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(to right, #06b6d4, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                FinTrack
              </Typography>
            </Stack>

            {/* Content */}
            <Stack spacing={4} sx={{ zIndex: 1, my: 4 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
                  Master Your <br />
                  <Box component="span" sx={{ color: "cyan.main" }}>
                    Financial Future.
                  </Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxW: 360, lineHeight: 1.6 }}>
                  Join thousands of users tracking their wealth with precision and style.
                </Typography>
              </Box>

              <Stack spacing={2.5}>
                {[
                  {
                    icon: <FiBarChart2 size={16} />,
                    text: "Real-time spending analytics",
                    color: "cyan.main",
                    bg: "rgba(6, 182, 212, 0.1)",
                    border: "rgba(6, 182, 212, 0.2)",
                  },
                  {
                    icon: <FiPieChart size={16} />,
                    text: "Smart budget management",
                    color: "success.main",
                    bg: "rgba(16, 185, 129, 0.1)",
                    border: "rgba(16, 185, 129, 0.2)",
                  },
                  {
                    icon: <FiShield size={16} />,
                    text: "Bank-grade security standards",
                    color: "primary.main",
                    bg: "rgba(59, 130, 246, 0.1)",
                    border: "rgba(59, 130, 246, 0.2)",
                  },
                ].map((item, i) => (
                  <Stack key={i} direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 3,
                        bgcolor: item.bg,
                        color: item.color,
                        border: 1,
                        borderColor: item.border,
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "text.secondary" }}>
                      {item.text}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Grid container spacing={2}>
                {[
                  { value: "₹2.5L+", label: "Avg. Savings" },
                  { value: "99.9%", label: "Accuracy" },
                  { value: "Secure", label: "Encryption" },
                ].map((s, i) => (
                  <Grid size={4} key={i}>
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 4,
                        p: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {s.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", fontSize: "9px", fontWeight: "bold", mt: 0.5 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ zIndex: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <FiCheckCircle style={{ color: "var(--mui-palette-success-main)" }} /> © 2025 FinTrack. Trusted globally.
            </Typography>
          </Grid>

          {/* ══ RIGHT: Form ══ */}
          <Grid size={{ xs: 12, lg: 6 }} sx={{ p: { xs: 4, sm: 6 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* Mobile brand */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: { xs: "flex", lg: "none" }, mb: 4 }}
            >
              <Avatar
                sx={{
                  bgcolor: "cyan.main",
                  width: 40,
                  height: 40,
                  borderRadius: 3,
                }}
              >
                <FiTrendingUp style={{ color: "white" }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                FinTrack
              </Typography>
            </Stack>

            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", letterSpacing: "-0.02em" }}>
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter your details to access your dashboard.
              </Typography>
            </Box>

            <Stack component="form" onSubmit={handleSubmit(submitHandler)} spacing={3} noValidate>
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
                        <FiMail />
                      </InputAdornment>
                    ),
                  }
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
                        <FiLock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label={
                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                      Remember me
                    </Typography>
                  }
                />
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="caption"
                  color="primary"
                  sx={{ fontWeight: "bold", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  Forgot password?
                </Link>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.75,
                  borderRadius: 3,
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  background: "linear-gradient(to right, var(--mui-palette-cyan-main, #00acc1), var(--mui-palette-primary-main, #1976d2))",
                  color: "white",
                  display: "flex",
                  gap: 1.5,
                  boxShadow: "0 8px 24px rgba(6, 182, 212, 0.2)",
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "white" }} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <FiArrowRight size={18} />
                  </>
                )}
              </Button>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 4 }}>
              <Box sx={{ flex: 1, h: "1px", bgcolor: "divider" }} />
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "9px", fontWeight: "bold", letterSpacing: "0.15em" }}>
                Secure Access
              </Typography>
              <Box sx={{ flex: 1, h: "1px", bgcolor: "divider" }} />
            </Stack>

            <Typography variant="body2" color="text.secondary" align="center">
              New to FinTrack?{" "}
              <Link
                component={RouterLink}
                to="/signup"
                color="primary"
                sx={{ fontWeight: "bold", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                Create your free account
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
