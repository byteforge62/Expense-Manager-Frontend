import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import {
  FiCheck,
  FiLock,
  FiMoon,
  FiSun,
  FiUploadCloud,
  FiUser,
} from "react-icons/fi";

import axiosInstance from "../Utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { updateUser as updateAuthUser } from "../../redux/slices/authSlice";

/**
 * Settings — the single place where account, appearance, notification and
 * security preferences are changed.
 *
 * Every control on this page maps to a real endpoint or a real persisted
 * client preference. Nothing here is a decorative toggle: currency is not
 * offered because the ledger is INR-only, and the only appearance preference
 * is the theme the application already applies everywhere.
 */

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
];

const NOTIFICATION_FIELDS = [
  { key: "inApp", label: "In-app notifications", hint: "Show notifications inside FinTrack." },
  { key: "budgetAlerts", label: "Budget alerts", hint: "Warn when a category nears its budget." },
  { key: "billReminders", label: "Bill reminders", hint: "Remind you before a bill is due." },
  { key: "recurringActivity", label: "Recurring activity", hint: "Report scheduled income and expenses." },
  { key: "anomalies", label: "Unusual spending", hint: "Flag spending that differs from your norm." },
  { key: "recommendations", label: "Recommendations", hint: "Suggest ways to improve your finances." },
];

const errorText = (error) =>
  error.response?.data?.errors?.[0]?.message ||
  error.response?.data?.message ||
  error.message ||
  "The request could not be completed.";

const Section = ({ title, description, children }) => (
  <Box
    sx={{
      border: 1,
      borderColor: "divider",
      borderRadius: "12px",
      bgcolor: "background.paper",
      p: { xs: 2.5, sm: 3 },
    }}
  >
    <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{title}</Typography>
    {description && (
      <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", maxWidth: 620 }}>
        {description}
      </Typography>
    )}
    <Box sx={{ mt: 2.5 }}>{children}</Box>
  </Box>
);

export const UserSettings = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { user: authUser, updateUser: updateContextUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const accountId = userId || authUser?._id;
  const [tab, setTab] = useState("profile");

  const [profile, setProfile] = useState({ name: "", email: "", bio: "", profilePic: "" });
  const [loadingProfile, setLoadingProfile] = useState(Boolean(accountId));
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [avatarError, setAvatarError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [preferences, setPreferences] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState({ type: "", text: "" });

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const isOwnAccount = useMemo(
    () => String(accountId) === String(authUser?._id),
    [accountId, authUser?._id],
  );

  useEffect(() => {
    if (!accountId) return;
    let active = true;

    setLoadingProfile(true);
    axiosInstance
      .get(`/user/${accountId}`)
      .then((response) => {
        if (!active) return;
        const data = response.data.data || {};
        setProfile({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          profilePic: data.profilePic || "",
        });
      })
      .catch((error) => {
        if (active) setProfileMessage({ type: "error", text: errorText(error) });
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [accountId]);

  useEffect(() => {
    if (!isOwnAccount) {
      setLoadingPreferences(false);
      return;
    }

    let active = true;
    axiosInstance
      .get("/notifications/preferences")
      .then((response) => {
        if (active) setPreferences(response.data.data);
      })
      .catch((error) => {
        if (active) setPreferencesMessage({ type: "error", text: errorText(error) });
      })
      .finally(() => {
        if (active) setLoadingPreferences(false);
      });

    return () => {
      active = false;
    };
  }, [isOwnAccount]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const response = await axiosInstance.put(`/user/${accountId}`, {
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
      });

      const updated = response.data.data;
      setProfile((current) => ({ ...current, ...updated }));

      if (isOwnAccount) {
        updateContextUser(updated);
        dispatch(updateAuthUser(updated));
      }

      setProfileMessage({ type: "success", text: "Profile saved." });
    } catch (error) {
      setProfileMessage({ type: "error", text: errorText(error) });
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Choose a JPEG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("The image must be 5 MB or smaller.");
      return;
    }

    setAvatarError("");
    setUploadingAvatar(true);

    try {
      const body = new FormData();
      body.append("profilePic", file);
      const response = await axiosInstance.post(`/user/upload-profile/${accountId}`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = response.data.data;
      setProfile((current) => ({ ...current, profilePic: updated.profilePic }));

      if (isOwnAccount) {
        updateContextUser(updated);
        dispatch(updateAuthUser(updated));
      }

      setProfileMessage({ type: "success", text: "Profile photo updated." });
    } catch (error) {
      setAvatarError(errorText(error));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setSavingPreferences(true);
    setPreferencesMessage({ type: "", text: "" });

    try {
      const response = await axiosInstance.put("/notifications/preferences", {
        inApp: preferences.inApp,
        budgetAlerts: preferences.budgetAlerts,
        billReminders: preferences.billReminders,
        recurringActivity: preferences.recurringActivity,
        anomalies: preferences.anomalies,
        recommendations: preferences.recommendations,
        minimumPriority: preferences.minimumPriority,
      });

      setPreferences(response.data.data);
      setPreferencesMessage({ type: "success", text: "Notification preferences saved." });
    } catch (error) {
      setPreferencesMessage({ type: "error", text: errorText(error) });
    } finally {
      setSavingPreferences(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirm) {
      setPasswordMessage({ type: "error", text: "The new passwords do not match." });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(passwords.newPassword)) {
      setPasswordMessage({
        type: "error",
        text: "Use at least 8 characters with uppercase, lowercase and a number.",
      });
      return;
    }

    setChangingPassword(true);

    try {
      const response = await axiosInstance.put(`/user/${accountId}/password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      const revoked = response.data.data?.otherSessionsRevoked || 0;
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      setPasswordMessage({
        type: "success",
        text:
          revoked > 0
            ? `Password changed. ${revoked} other session${revoked === 1 ? "" : "s"} signed out.`
            : "Password changed.",
      });
    } catch (error) {
      setPasswordMessage({ type: "error", text: errorText(error) });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 8 }}>
      <Box>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
            fontWeight: 600,
            letterSpacing: "-0.03em",
          }}
        >
          Settings
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: 13.5, color: "text.secondary", maxWidth: 640 }}>
          Manage your account details, appearance, alerts and password. Changes are
          saved to your account, not just this browser.
        </Typography>
      </Box>

      <Box
        role="tablist"
        aria-label="Settings sections"
        sx={{ display: "flex", gap: 0.5, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((item) => (
          <Box
            key={item.id}
            component="button"
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            sx={{
              border: 0,
              background: "none",
              cursor: "pointer",
              px: 1.5,
              py: 1.25,
              mb: "-1px",
              fontSize: 13.5,
              fontWeight: 600,
              color: tab === item.id ? "text.primary" : "text.secondary",
              borderBottom: 2,
              borderColor: tab === item.id ? "primary.main" : "transparent",
              "&:hover": { color: "text.primary" },
            }}
          >
            {item.label}
          </Box>
        ))}
      </Box>

      {tab === "profile" && (
        <Box component="form" onSubmit={saveProfile} noValidate sx={{ display: "grid", gap: 2.5 }}>
          <Section
            title="Profile"
            description="Your name and email are used across the workspace and on reports."
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ sm: "center" }}>
              <Avatar
                src={profile.profilePic || undefined}
                alt={profile.name || "Profile photo"}
                sx={{ width: 76, height: 76, borderRadius: "12px", fontSize: 28 }}
              >
                {profile.name?.charAt(0)?.toUpperCase() || <FiUser />}
              </Avatar>

              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<FiUploadCloud size={15} />}
                  disabled={uploadingAvatar}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {uploadingAvatar ? "Uploading…" : "Change photo"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={uploadAvatar}
                  />
                </Button>
                <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary" }}>
                  JPEG, PNG or WebP up to 5 MB. Requires image storage on the server.
                </Typography>
                {avatarError && (
                  <Alert severity="warning" sx={{ mt: 1.5, py: 0.25 }}>
                    {avatarError}
                  </Alert>
                )}
              </Box>
            </Stack>

            <Box
              sx={{
                mt: 3,
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <TextField
                label="Full name"
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                disabled={loadingProfile}
                required
                size="small"
                inputProps={{ minLength: 2, maxLength: 50 }}
              />
              <TextField
                label="Email"
                type="email"
                value={profile.email}
                onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                disabled={loadingProfile}
                required
                size="small"
              />
              <TextField
                label="Bio"
                value={profile.bio}
                onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
                disabled={loadingProfile}
                multiline
                minRows={3}
                size="small"
                inputProps={{ maxLength: 500 }}
                helperText={`${profile.bio?.length || 0}/500 characters`}
                sx={{ gridColumn: { sm: "1 / -1" } }}
              />
            </Box>

            {profileMessage.text && (
              <Alert severity={profileMessage.type} sx={{ mt: 2 }}>
                {profileMessage.text}
              </Alert>
            )}

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={savingProfile || loadingProfile}
                startIcon={<FiCheck size={15} />}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {savingProfile ? "Saving…" : "Save profile"}
              </Button>
            </Stack>
          </Section>

          <Section title="Account" description="Details managed by the system.">
            <Stack spacing={1.25} divider={<Divider flexItem />}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Role</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {isOwnAccount ? authUser?.role || "User" : "User"}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Currency</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>INR (₹)</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Member since</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {authUser?.createdAt
                    ? new Date(authUser.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </Typography>
              </Stack>
            </Stack>
          </Section>
        </Box>
      )}

      {tab === "appearance" && (
        <Section
          title="Theme"
          description="Applies to the whole workspace and is remembered on this device."
        >
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            {[
              { id: "light", label: "Light", icon: <FiSun size={16} /> },
              { id: "dark", label: "Dark", icon: <FiMoon size={16} /> },
            ].map((option) => {
              const selected = theme === option.id;
              return (
                <Box
                  key={option.id}
                  component="button"
                  type="button"
                  onClick={() => setTheme(option.id)}
                  aria-pressed={selected}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 2,
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: "10px",
                    border: 1,
                    borderColor: selected ? "primary.main" : "divider",
                    bgcolor: selected ? "action.selected" : "transparent",
                    color: "text.primary",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    {option.icon}
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{option.label}</Typography>
                  </Stack>
                  {selected && <FiCheck size={16} />}
                </Box>
              );
            })}
          </Box>

          <Typography sx={{ mt: 2, fontSize: 12.5, color: "text.secondary" }}>
            Animations are reduced automatically when your operating system asks for reduced
            motion. There is no separate switch because the application follows that setting.
          </Typography>
        </Section>
      )}

      {tab === "notifications" && (
        <Section
          title="Notification preferences"
          description="Choose which alerts FinTrack generates for your account."
        >
          {!isOwnAccount ? (
            <Alert severity="info">Notification preferences belong to the account owner.</Alert>
          ) : loadingPreferences ? (
            <Typography role="status" sx={{ fontSize: 13, color: "text.secondary" }}>
              Loading preferences…
            </Typography>
          ) : !preferences ? (
            <Alert severity="error">
              {preferencesMessage.text || "Notification preferences could not be loaded."}
            </Alert>
          ) : (
            <>
              <Stack divider={<Divider flexItem />} spacing={0}>
                {NOTIFICATION_FIELDS.map((field) => (
                  <Stack
                    key={field.key}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2}
                    sx={{ py: 1.25 }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{field.label}</Typography>
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        {field.hint}
                      </Typography>
                    </Box>
                    <Switch
                      checked={Boolean(preferences[field.key])}
                      onChange={(event) =>
                        setPreferences({ ...preferences, [field.key]: event.target.checked })
                      }
                      inputProps={{ "aria-label": field.label }}
                    />
                  </Stack>
                ))}
              </Stack>

              <TextField
                select
                size="small"
                label="Only notify me from"
                value={preferences.minimumPriority || "low"}
                onChange={(event) =>
                  setPreferences({ ...preferences, minimumPriority: event.target.value })
                }
                sx={{ mt: 2, minWidth: 220 }}
              >
                {[
                  { value: "low", label: "Low priority and above" },
                  { value: "medium", label: "Medium priority and above" },
                  { value: "high", label: "High priority and above" },
                  { value: "critical", label: "Critical only" },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              {preferencesMessage.text && (
                <Alert severity={preferencesMessage.type} sx={{ mt: 2 }}>
                  {preferencesMessage.text}
                </Alert>
              )}

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
                <Button
                  variant="contained"
                  onClick={savePreferences}
                  disabled={savingPreferences}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {savingPreferences ? "Saving…" : "Save preferences"}
                </Button>
              </Stack>
            </>
          )}
        </Section>
      )}

      {tab === "security" && (
        <Box component="form" onSubmit={changePassword} noValidate sx={{ display: "grid", gap: 2.5 }}>
          <Section
            title="Change password"
            description="Confirm your current password, then choose a new one. Other devices are signed out when you change it."
          >
            <Box
              sx={{
                display: "grid",
                gap: 2,
                maxWidth: 420,
                gridTemplateColumns: "1fr",
              }}
            >
              <TextField
                label="Current password"
                type="password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords({ ...passwords, currentPassword: event.target.value })
                }
                required
                size="small"
                autoComplete="current-password"
              />
              <TextField
                label="New password"
                type="password"
                value={passwords.newPassword}
                onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                required
                size="small"
                autoComplete="new-password"
                helperText="At least 8 characters with uppercase, lowercase and a number."
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={passwords.confirm}
                onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                required
                size="small"
                autoComplete="new-password"
              />
            </Box>

            {passwordMessage.text && (
              <Alert severity={passwordMessage.type} sx={{ mt: 2 }}>
                {passwordMessage.text}
              </Alert>
            )}

            <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2.5 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  changingPassword ||
                  !passwords.currentPassword ||
                  !passwords.newPassword ||
                  !passwords.confirm
                }
                startIcon={<FiLock size={15} />}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {changingPassword ? "Updating…" : "Update password"}
              </Button>
            </Stack>
          </Section>

          <Section title="Session" description="Signing out ends this browser session.">
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Access tokens expire after one hour and are renewed from an HTTP-only refresh
              cookie. Password changes revoke refresh tokens on every other device.
            </Typography>
          </Section>
        </Box>
      )}
    </Box>
  );
};

export default UserSettings;
