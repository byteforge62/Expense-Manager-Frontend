import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { FiAlertTriangle } from "react-icons/fi";

import { LoadingSpinner } from "../../Common/Loaders";
import { AICard, AIButton, AIResult } from "./AICard";

/**
 * --- AI INSIGHT CARDS ---
 * One generic card covers the four text-only insights (health, patterns,
 * forecast, savings); the spending-risk card keeps its own body.
 */

  const riskColors = {
    High: {
      border: "rgba(169, 75, 63, 0.3)",
      bg: "rgba(169, 75, 63, 0.05)",
      text: "error.main",
      badge: "rgba(169, 75, 63, 0.1)",
    },
    Medium: {
      border: "rgba(245, 158, 11, 0.3)",
      bg: "rgba(245, 158, 11, 0.05)",
      text: "warning.main",
      badge: "rgba(245, 158, 11, 0.1)",
    },
    Low: {
      border: "rgba(46, 122, 89, 0.3)",
      bg: "rgba(46, 122, 89, 0.05)",
      text: "success.main",
      badge: "rgba(46, 122, 89, 0.1)",
    },
  };

export const AITextInsightCard = ({
  title,
  icon,
  iconColor,
  iconBg,
  borderColor,
  isLoading,
  value,
  onRefresh,
  prompt,
  loadingLabel,
  loadingColor,
  buttonLabel,
  buttonColor,
}) => (
  <Grid size={{ xs: 12, md: 6 }}>
    <AICard
      title={title}
      icon={icon}
      iconColor={iconColor}
      iconBg={iconBg}
      borderColor={borderColor}
      isLoading={isLoading}
      onRefresh={onRefresh}
    >
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <LoadingSpinner color={loadingColor} label={loadingLabel} />
        </Box>
      ) : value ? (
        <AIResult content={value} />
      ) : (
        <Stack
          alignItems="center"
          textAlign="center"
          spacing={2}
          sx={{ py: 2 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxW: "80%" }}
          >
            {prompt}
          </Typography>
          <AIButton
            onClick={onRefresh}
            label={buttonLabel}
            color={buttonColor}
          />
        </Stack>
      )}
    </AICard>
  </Grid>
);

export const SpendingRiskCard = ({ riskData, isLoading, onRefresh }) => (
        <Grid size={{ xs: 12, md: 6 }}>
          <AICard
            title="Spending risk"
            icon={<FiAlertTriangle size={15} />}
            iconColor="error.main"
            iconBg="rgba(169, 75, 63, 0.1)"
            borderColor="rgba(169, 75, 63, 0.15)"
            isLoading={isLoading}
            onRefresh={onRefresh}
          >
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <LoadingSpinner
                  color="error"
                  label="Reviewing transactions..."
                />
              </Box>
            ) : riskData ? (
              <Box
                sx={{
                  borderRadius: 2,
                  p: 3,
                  border: 1,
                  borderColor: riskColors[riskData.riskLevel]?.border,
                  bgcolor: riskColors[riskData.riskLevel]?.bg,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: "text.primary",
                    }}
                  >
                    Behavior Assessment
                  </Typography>
                  <Chip
                    label={`Risk: ${riskData.riskLevel}`}
                    size="small"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "10px",
                      bgcolor: riskColors[riskData.riskLevel]?.badge,
                      color: riskColors[riskData.riskLevel]?.text,
                    }}
                  />
                </Stack>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontWeight: "bold",
                      }}
                    >
                      Observation Category
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {riskData.category}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        fontWeight: "bold",
                      }}
                    >
                      Detective Logic
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", lineHeight: 1.5 }}
                    >
                      {riskData.reason}
                    </Typography>
                  </Box>
                  <Box sx={{ pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: riskColors[riskData.riskLevel]?.text,
                      }}
                    >
                      ✨ {riskData.suggestion}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Stack
                alignItems="center"
                textAlign="center"
                spacing={2}
                sx={{ py: 2 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxW: "80%" }}
                >
                  Review recent activity for unusual spending patterns.
                </Typography>
                <AIButton
                  onClick={onRefresh}
                  label="Review spending"
                  color="bg-rose-500 text-white hover:bg-rose-600"
                />
              </Stack>
            )}
          </AICard>
        </Grid>
);
