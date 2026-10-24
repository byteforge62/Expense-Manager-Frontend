import { useState, useEffect,useRef } from "react";
import axiosInstance from "../Utils/axiosInstance";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser as updateAuthUser } from "../../redux/auth/authSlice";
import { useAuth } from "../../context/AuthContext";
import { LazyMotion, m, AnimatePresence } from "framer-motion";
import { domAnimation } from "framer-motion";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import InputAdornment from "@mui/material/InputAdornment";

// ================ Icons ================
import {
  FiCamera,
  FiUser,
  FiMail,
  FiEdit2,
  FiCheck,
  FiX,
  FiShield,
  FiInfo,
  FiSave,
  FiRefreshCw,
  FiSettings,
  FiMapPin,
} from "react-icons/fi";

export const Account = () => {
  const { userId } = useParams();
  const [user, setUser] = useState({
    name: "",
    email: "",
    bio: "",
    profilePic: "",
    role: "User",
  });

  const [isEditing, setIsEditing] = useState(false);
  const selectedFileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const dispatch = useDispatch();
  const { updateUser: updateContextUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/user/${userId}`);
        setUser(res.data.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedFileRef.current = file;
      setPreview(URL.createObjectURL(file));
    }
  };

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let currentProfilePic = user.profilePic;

      if (selectedFileRef.current) {
        const formData = new FormData();
        formData.append("profilePic", selectedFileRef.current);

        const uploadRes = await axiosInstance.post(
          `/user/upload-profile/${userId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        currentProfilePic = uploadRes.data.data.profilePic;
      }

      const res = await axiosInstance.put(`/user/${userId}`, {
        name: user.name,
        email: user.email,
        bio: user.bio,
        profilePic: currentProfilePic,
      });

      const updatedUser = res.data.data;
      setUser(updatedUser);

      updateContextUser(updatedUser);
      dispatch(updateAuthUser(updatedUser));

      setPreview(null);
      selectedFileRef.current = null;
      setIsEditing(false);
      showMsg("Protocol update successful");
    } catch (err) {
      console.error("Error saving profile:", err);
      showMsg("Vector update failure", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <Box
        component={m.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 5, pb: 10 }}
      >
      {/* ══ IDENTITY HEADER ══ */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="between"
        alignItems={{ xs: "flex-start", md: "flex-end" }}
        spacing={3}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.05em",
              background: "linear-gradient(to right, var(--text-primary), var(--text-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            System Identity
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: "text.secondary",
              display: "block",
              mt: 0.5,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            Credential Management & Sector Configuration
          </Typography>
        </Box>
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 4,
              bgcolor: "cyan.main",
              opacity: 0.1,
              border: 1,
              borderColor: "cyan.main",
            }}
          >
            <Box
              component="span"
              className="animate-pulse"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "cyan.main",
                boxShadow: "0 0 8px var(--mui-palette-cyan-main)",
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: "0.15em", color: "cyan.main" }}>
              OPERATIONAL SESSION
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Grid container spacing={4} alignItems="start">
        {/* ── VECTOR CARD ── */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Box
              component={m.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              sx={{
                p: 5,
                borderRadius: 8,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                boxShadow: 3,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Stack alignItems="center" textAlign="center" spacing={3}>
                {/* Profile Visual Wrapper */}
                <Box sx={{ position: "relative", mb: 1 }}>
                  <Avatar
                    src={preview || user.profilePic || undefined}
                    sx={{
                      width: 160,
                      height: 160,
                      borderRadius: 6,
                      border: 4,
                      borderColor: "background.paper",
                      boxShadow: "0 0 20px rgba(0,0,0,0.15)",
                      background: "linear-gradient(to top right, var(--mui-palette-cyan-main), var(--mui-palette-primary-main))",
                    }}
                  >
                    {!preview && !user.profilePic && <FiUser size={56} />}
                  </Avatar>

                  <AnimatePresence>
                    {isEditing && (
                      <IconButton
                        component={m.label}
                        aria-label="Upload profile image"
                        initial={{ scale: 0.95, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.95, opacity: 0, rotate: 45 }}
                        sx={{
                          position: "absolute",
                          bottom: -12,
                          right: -12,
                          bgcolor: "background.paper",
                          border: 1,
                          borderColor: "divider",
                          color: "cyan.main",
                          boxShadow: 4,
                          borderRadius: 3,
                          "&:hover": { bgcolor: "cyan.main", color: "common.white" },
                        }}
                      >
                        <FiCamera size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </IconButton>
                    )}
                  </AnimatePresence>
                </Box>

                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                    {user.name || "UNIDENTIFIED"}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
                    <FiMail size={12} style={{ color: "var(--mui-palette-cyan-main)" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                      {user.email}
                    </Typography>
                  </Stack>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ px: 2, py: 0.5, borderRadius: 3, bgcolor: "action.selected", border: 1, borderColor: "divider" }}
                >
                  <FiShield size={12} style={{ color: "var(--mui-palette-cyan-main)" }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: "0.2em", color: "text.secondary" }}>
                    {user.role || "User"} NODE
                  </Typography>
                </Stack>

                {!isEditing ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => setIsEditing(true)}
                    startIcon={<FiEdit2 />}
                    sx={{ py: 1.5, borderRadius: 4, fontWeight: "bold", letterSpacing: "0.1em" }}
                  >
                    Modify Credentials
                  </Button>
                ) : (
                  <Grid container spacing={2} sx={{ width: "100%" }}>
                    <Grid size={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={loading}
                        startIcon={loading ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                        sx={{ py: 1.5, borderRadius: 4, fontWeight: "bold" }}
                      >
                        DEPLOY
                      </Button>
                    </Grid>
                    <Grid size={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        onClick={() => {
                          setIsEditing(false);
                          setPreview(null);
                        }}
                        startIcon={<FiX />}
                        sx={{ py: 1.5, borderRadius: 4, fontWeight: "bold" }}
                      >
                        ABORT
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Stack>
            </Box>

            {/* Tech Specs Info Callout */}
            <Box
              sx={{
                p: 3,
                borderRadius: 8,
                background: "linear-gradient(to bottom right, rgba(6, 182, 212, 0.08), transparent)",
                border: 1,
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="start">
                <Avatar sx={{ bgcolor: "action.selected", border: 1, borderColor: "divider", color: "cyan.main", borderRadius: 3 }}>
                  <FiInfo size={20} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, display: "block", tracking: "0.1em", mb: 0.5 }}>
                    Encryption Protocol
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.6 }}>
                    Credential matrix is secured via AES-256 protocols. Rotate access markers every 90 cycles for maximum system integrity.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* ── ATTRIBUTE FORMS ── */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box
            component={m.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            sx={{ p: { xs: 4, sm: 5 }, borderRadius: 8, bgcolor: "background.paper", border: 1, borderColor: "divider", boxShadow: 3 }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 5 }}>
              <Avatar sx={{ bgcolor: "action.selected", border: 1, borderColor: "divider", color: "cyan.main", borderRadius: 4 }}>
                <FiSettings size={20} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: "0.1em" }}>
                  Global Configurations
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", tracking: "0.1em" }}>
                  Core Data Matrix
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={4}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Legal Designation"
                    name="name"
                    value={user.name}
                    disabled={!isEditing}
                    onChange={handleChange}
                    placeholder="Enter name..."
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FiUser />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Primary Comm Link"
                    type="email"
                    name="email"
                    value={user.email}
                    disabled={!isEditing}
                    onChange={handleChange}
                    placeholder="link@system.tech"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FiMail />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={5}
                label="Personal Narrative Matrix"
                name="bio"
                value={user.bio}
                disabled={!isEditing}
                onChange={handleChange}
                placeholder="Define your operational objectives and system role..."
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end" sx={{ alignSelf: "flex-end", mb: 1, opacity: 0.3 }}>
                        <FiMapPin size={20} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {isEditing && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="between"
                  alignItems="center"
                  spacing={2}
                  sx={{ p: 3, borderRadius: 5, bgcolor: "action.hover", border: 1, borderColor: "divider" }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FiRefreshCw className="animate-spin" style={{ color: "var(--mui-palette-cyan-main)" }} />
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "cyan.main", fontStyle: "italic" }}>
                      Pending sync sequence detected
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                    startIcon={<FiSave />}
                    sx={{ width: { xs: "100%", sm: "auto" }, px: 4 }}
                  >
                    COMMIT CHANGES
                  </Button>
                </Stack>
              )}

              {/* ALERT SYSTEM */}
              <AnimatePresence>
                {message.text && (
                  <Box component={m.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Alert severity={message.type === "error" ? "error" : "success"} variant="outlined" sx={{ borderRadius: 5 }}>
                      <AlertTitle sx={{ fontWeight: "bold", fontSize: "11px", letterSpacing: "0.1em" }}>
                        {message.type === "error" ? "VECTOR UPDATE FAILURE" : "PROTOCOL COMPLETED"}
                      </AlertTitle>
                      {message.text}
                    </Alert>
                  </Box>
                )}
              </AnimatePresence>
            </Stack>
          </Box>
        </Grid>
        </Grid>
      </Box>
    </LazyMotion>
  );
};