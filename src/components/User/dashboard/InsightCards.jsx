import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";

import { LoadingSpinner } from "../../Common/Loaders";
import { AIResult } from "./AICard";

/**
 * --- INSIGHT DESK ---
 *
 * The four text insights and the spending-risk note are set as entries in a
 * ruled list, not as identical cards. Each entry keeps one action, shows its
 * result as an indented reading block, and never competes with the statement
 * for visual weight.
 */

const riskTone = {
  High: { color: "error.main", soft: "rgba(239,68,68,0.08)" },
  Medium: { color: "warning.main", soft: "rgba(245,158,11,0.09)" },
  Low: { color: "success.main", soft: "rgba(16,185,129,0.08)" },
};

const RowAction = ({ onClick, label, icon = <FiZap size={13} /> }) => (
  <Button
    type="button"
    size="small"
    variant="outlined"
    onClick={onClick}
    startIcon={icon}
    sx={{
      px: 1.1,
      py: 0.35,
      minHeight: 26,
      fontSize: 10.8,
      fontWeight: 600,
      textTransform: "none",
      whiteSpace: "nowrap",
      borderColor: "divider",
      color: "text.primary",
      "&:hover": {
        borderColor: "primary.main",
        bgcolor: "action.hover",
      },
    }}
  >
    {label}
  </Button>
);

const InsightHeader = ({ icon, iconColor, title, action }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    spacing={1.25}
  >
    <Stack direction="row" spacing={0.85} alignItems="center" sx={{ minWidth: 0 }}>
      <Box sx={{ color: iconColor || "primary.main", display: "flex", flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{title}</Typography>
    </Stack>
    {action}
  </Stack>
);

export const AITextInsightCard = ({
  title,
  icon,
  iconColor,
  isLoading,
  value,
  onRefresh,
  loadingLabel,
  buttonLabel,
}) => (
  <Box
    component="li"
    sx={{
      py: 0.65,
      borderTop: 1,
      borderColor: "divider",
    }}
  >
    <InsightHeader
      title={title}
      icon={icon}
      iconColor={iconColor}
      action={
        isLoading ? null : value ? (
          <Button
            type="button"
            size="small"
            onClick={onRefresh}
            startIcon={<FiRefreshCw size={11} />}
            sx={{
              minHeight: 22,
              px: 0.6,
              fontSize: 10,
              fontWeight: 600,
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Refresh
          </Button>
        ) : (
          <RowAction onClick={onRefresh} label={buttonLabel} />
        )
      }
    />

    {isLoading ? (
      <Box sx={{ display: "flex", justifyContent: "flex-start", py: 1.25 }}>
        <LoadingSpinner color={iconColor === "secondary.main" ? "secondary" : "primary"} label={loadingLabel} />
      </Box>
    ) : value ? (
      <Box
        sx={{
          mt: 0.65,
          pl: 1.5,
          borderLeft: "2px solid",
          borderColor: "divider",
          "& p": { my: 0.6 },
        }}
      >
        <AIResult content={value} />
      </Box>
    ) : null}
  </Box>
);

export const SpendingRiskCard = ({ riskData, isLoading, onRefresh }) => {
  const tone = riskData ? riskTone[riskData.riskLevel] : null;

  return (
    <Box
      component="li"
      sx={{
        py: 0.65,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <InsightHeader
        title="Spending risk"
        icon={<FiAlertTriangle size={15} />}
        iconColor="error.main"
        action={
          riskData ? (
            <Chip
              label={`Risk: ${riskData.riskLevel}`}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 600,
                bgcolor: tone?.soft,
                color: tone?.color,
              }}
            />
          ) : (
            <RowAction onClick={onRefresh} label="Review spending" />
          )
        }
      />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "flex-start", py: 1.25 }}>
          <LoadingSpinner color="error" label="Reviewing transactions..." />
        </Box>
      ) : riskData ? (
        <Box
          sx={{
            mt: 0.75,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            columnGap: 2,
            rowGap: 1,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 10, fontWeight: 600, color: "text.secondary" }}
            >
              Observation category
            </Typography>
            <Typography sx={{ mt: 0.15, fontSize: 12, fontWeight: 600 }}>
              {riskData.category}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: 10, fontWeight: 600, color: "text.secondary" }}
            >
              Detective logic
            </Typography>
            <Typography
              sx={{ mt: 0.15, fontSize: 11.5, color: "text.secondary", lineHeight: 1.5 }}
            >
              {riskData.reason}
            </Typography>
          </Box>
          <Box
            sx={{
              gridColumn: "1 / -1",
              pt: 0.75,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: tone?.color }}>
              {riskData.suggestion}
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};
