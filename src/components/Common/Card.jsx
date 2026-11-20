import React from "react";
import { motion } from "framer-motion";

// ================ Material UI Components ================
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

/**
 * --- GENERIC DATA CARD ---
 * A simple, visually appealing card used to display key metrics (e.g., Total Balance).
 */
const DataCard = ({ title, value }) => {
  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.05 }} // Subtle zoom on hover for a premium feel
      sx={{
        width: 208, // Equivalent to w-52 (52 * 4px = 208px)
        p: 3, // Equivalent to p-6 (6 * 4px = 24px padding)
        textAlign: "center",
        cursor: "pointer",
        borderRadius: 2, // Equivalent to rounded-2xl
        border: 1,
        borderColor: "divider", // Hooks into your theme's default border system
        backdropFilter: "blur(24px)", // Equivalent to backdrop-blur-xl
        bgcolor: "rgba(255, 255, 255, 0.1)", // Equivalent to bg-white/10
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // Equivalent to shadow-lg
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Equivalent to transition duration-300
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "grey.300", // Equivalent to text-gray-300
          mb: 1, // Equivalent to mb-2 (2 * 4px = 8px margin)
          fontSize: "0.875rem", // Equivalent to text-sm
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold", // Equivalent to font-bold
          color: "success.main", // Clean MUI standard hook for functional green typography
          fontSize: "1.5rem", // Equivalent to text-2xl
        }}
      >
        {value}
      </Typography>
    </Card>
  );
};

export default DataCard;