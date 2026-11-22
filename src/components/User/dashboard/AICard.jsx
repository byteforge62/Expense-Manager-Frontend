import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { FiRefreshCw, FiZap } from "react-icons/fi";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/* ── Shared AI card shell, action button and markdown result ── */

const AICard = memo(
  ({
    title,
    icon,
    iconColor,
    children,
    isLoading,
    onRefresh,
  }) => (
    <Card
      sx={{
        borderRadius: "12px",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 2.75,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "transparent",
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ color: iconColor || "primary.main", display: "flex" }}>
            {icon}
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "0.97rem",
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
              border: 1,
              borderColor: "divider",
              width: 34,
              height: 34,
              "&:hover": {
                color: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <FiRefreshCw
              className={isLoading ? "animate-spin" : ""}
              size={14}
            />
          </IconButton>
        )}
      </Stack>
      <CardContent sx={{ p: 3, minHeight: 132, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {children}
      </CardContent>
    </Card>
  ),
);
AICard.displayName = "AICard";

/* ─── AI Button ─── */
const AIButton = ({ onClick, label, color, icon = <FiZap size={14} /> }) => (
  <Button
    onClick={onClick}
    variant="contained"
    startIcon={icon}
    sx={{
      py: 1,
      px: 2.25,
      borderRadius: "8px",
      fontWeight: 600,
      textTransform: "none",
      boxShadow: "none",
      backgroundColor:
        color === "bg-rose-500 text-white hover:bg-rose-600"
          ? "error.main"
          : "primary.main",
      color: "#fff",
      "&:hover": { filter: "brightness(0.94)", boxShadow: "none" },
    }}
  >
    {label}
  </Button>
);

/* ─── AI Result ─── */
const AIResult = ({ content }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    sx={{
      p: 2.5,
      borderRadius: "12px",
      bgcolor: "action.hover",
      border: 1,
      borderColor: "divider",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        color: "text.secondary",
        fontSize: "0.85rem",
        lineHeight: 1.65,
        "& strong": { color: "primary.main", fontWeight: 600 },
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  </Box>
);

export { AICard, AIButton, AIResult };
