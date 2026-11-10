import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const toneByStatus = {
  triggered: { color: "#f43f5e", background: "rgba(244,63,94,0.1)" },
  high: { color: "#f43f5e", background: "rgba(244,63,94,0.1)" },
  critical: { color: "#f43f5e", background: "rgba(244,63,94,0.1)" },
  medium: { color: "#f59e0b", background: "rgba(245,158,11,0.1)" },
  warning: { color: "#f59e0b", background: "rgba(245,158,11,0.1)" },
  clear: { color: "#10b981", background: "rgba(16,185,129,0.1)" },
  low: { color: "#10b981", background: "rgba(16,185,129,0.1)" },
  "not-evaluated": { color: "#64748b", background: "rgba(148,163,184,0.12)" },
};

export function IconContainer({ icon: Icon, size = 38, children }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        borderRadius: 3,
        bgcolor: "rgba(139,92,246,0.12)",
        color: "#8b5cf6",
        border: "1px solid rgba(139,92,246,0.18)",
      }}
    >
      {Icon ? <Icon size={Math.round(size * 0.47)} aria-hidden="true" /> : children}
    </Avatar>
  );
}

export function MetricCard({ icon: Icon, label, value, tone = "rgba(139,92,246,0.05)" }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        minWidth: 0,
        borderRadius: 3,
        border: "1px solid rgba(148,163,184,0.2)",
        bgcolor: tone,
      }}
    >
      <IconContainer icon={Icon} size={34} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", overflowWrap: "anywhere" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export function SectionHeader({ icon: Icon, title, eyebrow, action }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
        <IconContainer icon={Icon} />
        <Box minWidth={0}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {eyebrow}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}

export function StatusBadge({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  const tone = toneByStatus[normalized] || toneByStatus["not-evaluated"];
  return (
    <Chip
      label={normalized.replace(/-/g, " ")}
      size="small"
      sx={{ bgcolor: tone.background, color: tone.color, fontWeight: 800, borderRadius: 2 }}
    />
  );
}

export function ConfidenceIndicator({ level }) {
  const tones = {
    high: { color: "#10b981", background: "rgba(16,185,129,0.1)" },
    medium: { color: "#f59e0b", background: "rgba(245,158,11,0.1)" },
    low: { color: "#f43f5e", background: "rgba(244,63,94,0.1)" },
  };
  const confidence = String(level || "").toLowerCase();
  const tone = tones[confidence] || toneByStatus["not-evaluated"];
  return (
    <Chip
      label={confidence || "not evaluated"}
      size="small"
      sx={{ bgcolor: tone.background, color: tone.color, fontWeight: 800, borderRadius: 2 }}
    />
  );
}

export function ChartContainer({ icon, title, eyebrow, children, height = 280, description }) {
  return (
    <Card sx={{ borderRadius: 5, border: "1px solid rgba(148,163,184,0.2)", height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <SectionHeader icon={icon} title={title} eyebrow={eyebrow} />
        <Box role="group" aria-roledescription="chart" aria-label={description || title} sx={{ height, minWidth: 0 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}

export function InsightCard({ children, tone = "neutral" }) {
  const tones = {
    neutral: { background: "rgba(148,163,184,0.03)", border: "rgba(148,163,184,0.16)" },
    lavender: { background: "rgba(139,92,246,0.04)", border: "rgba(139,92,246,0.18)" },
    warning: { background: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)" },
    success: { background: "rgba(16,185,129,0.05)", border: "rgba(16,185,129,0.18)" },
  };
  const selectedTone = tones[tone] || tones.neutral;
  return (
    <Box sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: selectedTone.border, bgcolor: selectedTone.background }}>
      {children}
    </Box>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <InsightCard tone="success">
      <Stack direction="row" spacing={1.2} alignItems="center">
        {Icon && <IconContainer icon={Icon} size={32} />}
        <Box>
          {title && <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{title}</Typography>}
          <Typography variant="body2" color="text.secondary">{children}</Typography>
        </Box>
      </Stack>
    </InsightCard>
  );
}

export function ErrorState({ title, message, actionLabel, onAction, refreshing = false }) {
  return (
    <Card role="alert" sx={{ borderRadius: 5, p: 3, border: "1px solid rgba(244,63,94,0.2)", bgcolor: "rgba(244,63,94,0.04)" }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{message}</Typography>
      {onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          disabled={refreshing}
          sx={{ mt: 2, borderRadius: 3, fontWeight: 700 }}
        >
          {refreshing ? "Retrying…" : actionLabel}
        </Button>
      )}
    </Card>
  );
}
