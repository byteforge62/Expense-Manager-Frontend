import React from "react";
import { LazyMotion, m } from "framer-motion";
import { domAnimation } from "framer-motion";
import {
  FiDollarSign,
  FiUsers,
  FiShield,
  FiZap,
  FiTerminal,
} from "react-icons/fi";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";

const stats = [
  {
    id: "stat_1",
    index: 0,
    icon: <FiDollarSign size={16} />,
    value: "₹2.4M+",
    label: "Flow throughput",
    color: "success.main",
  },
  {
    id: "stat_2",
    index: 1,
    icon: <FiUsers size={16} />,
    value: "10K+",
    label: "Active nodes",
    color: "cyan.main",
  },
  {
    id: "stat_3",
    index: 2,
    icon: <FiShield size={16} />,
    value: "99.99%",
    label: "SLA Uptime",
    color: "primary.main",
  },
  {
    id: "stat_4",
    index: 3,
    icon: <FiZap size={16} />,
    value: "< 50ms",
    label: "Sync latency",
    color: "warning.main",
  },
];

export const StatsRow = () => {
  return (
    <LazyMotion features={domAnimation}>
      <Box component="section" sx={{ py: 6 }}>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.id}>
            <Card
              component={m.div}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: stat.index * 0.1 }}
              sx={{
                position: "relative",
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 4,
                boxShadow: 1,
                overflow: "hidden",
              }}
            >
              {/* Minimal line decoration */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 96,
                  height: 96,
                  background: "linear-gradient(135deg, transparent, rgba(6, 182, 212, 0.05))",
                  transform: "rotate(45deg) translate(48px, -48px)",
                }}
              />

              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    mb: 2,
                    color: stat.color,
                    fontFamily: "monospace",
                    fontSize: 10,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  <FiTerminal size={12} />
                  METRIC_{stat.index + 1}
                </Stack>

                <Stack spacing={0.5}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary" }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {stat.label}
                  </Typography>
                </Stack>

                {/* Micro progress bar */}
                <Box sx={{ mt: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: stat.color,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>
    </LazyMotion>
  );
};
