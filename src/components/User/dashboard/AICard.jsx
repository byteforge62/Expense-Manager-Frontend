import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { FiRefreshCw, FiZap } from "react-icons/fi";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
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
    iconBg,
    children,
    isLoading,
    onRefresh,
  }) => (
    <Card
      sx={{
        borderRadius: 4,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        boxShadow: "0 8px 26px rgba(26, 39, 57, 0.045)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 34px rgba(26, 39, 57, 0.085)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 3,
          py: 2.25,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "transparent",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: iconBg || "action.hover",
              color: iconColor || "primary.main",
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {title}
            </Typography>
          </Box>
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
      borderRadius: 2.5,
      fontWeight: 700,
      textTransform: "none",
      boxShadow: "none",
      backgroundColor:
        color === "bg-rose-500 text-white hover:bg-rose-600"
          ? "#f07870"
          : color === "bg-violet-500 text-white hover:bg-violet-600"
            ? "#3985ff"
            : color === "bg-cyan-500 text-white hover:bg-cyan-600"
              ? "#3985ff"
              : color === "bg-blue-500 text-white hover:bg-blue-600"
                ? "#3985ff"
                : "#45b889",
      color: "#fff",
      "&:hover": { filter: "brightness(1.08)", boxShadow: "none" },
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
      borderRadius: 4,
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
        lineHeight: 1.6,
        "& strong": { color: "cyan.main", fontWeight: "bold" },
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  </Box>
);

export { AICard, AIButton, AIResult };
