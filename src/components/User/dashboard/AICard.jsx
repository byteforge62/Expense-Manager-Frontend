import { memo } from "react";
import ReactMarkdown from "react-markdown";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FiRefreshCw } from "react-icons/fi";

/* ── Shared AI panel shell and plain-text analysis result ── */

const AICard = memo(
  ({ title, icon, iconColor, children, isLoading, onRefresh }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 1.6,
          py: 1.1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1.1} alignItems="center">
          <Box sx={{ color: iconColor || "primary.main", display: "flex" }}>
            {icon}
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "0.88rem",
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
        </Stack>

        {onRefresh && (
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label={`Refresh ${title}`}
            sx={{
              color: "text.secondary",
              width: 30,
              height: 30,
              "&:hover": { color: "primary.main", bgcolor: "action.hover" },
            }}
          >
            <FiRefreshCw
              className={isLoading ? "animate-spin" : ""}
              size={13}
            />
          </IconButton>
        )}
      </Stack>

      <Box
        sx={{
          p: 1.2,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
    </Card>
  ),
);
AICard.displayName = "AICard";

/* ─── Analysis result: a reading block, not a nested card ─── */
const AIResult = ({ content }) => (
  <Box
    sx={{
      color: "text.secondary",
      fontSize: "0.78rem",
      lineHeight: 1.6,
      "& p": { mt: 0 },
      "& p + p": { mt: 1 },
      "& strong": { color: "text.primary", fontWeight: 600 },
      "& ul, & ol": { pl: 2.25, my: 0.75 },
      "& li": { mb: 0.35 },
      "& h1, & h2, & h3": {
        fontFamily: "var(--font-display)",
        fontSize: "0.88rem",
        fontWeight: 700,
        color: "text.primary",
        mt: 1,
        mb: 0.5,
      },
    }}
  >
    <ReactMarkdown>{content}</ReactMarkdown>
  </Box>
);

export { AICard, AIResult };
