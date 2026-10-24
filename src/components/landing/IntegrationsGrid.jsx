import React from "react";
import { LazyMotion, m } from "framer-motion";
import { domAnimation } from "framer-motion";
import {
  FiFileText,
  FiDatabase,
  FiShield,
  FiBarChart2,
  FiCloud,
  FiGrid,
  FiLayers,
  FiLock,
} from "react-icons/fi";

// ================ Material UI Components ================
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";

const integrations = [
  { name: "CSV Export", icon: <FiFileText size={18} /> },
  { name: "Excel", icon: <FiGrid size={18} /> },
  { name: "API Access", icon: <FiDatabase size={18} /> },
  { name: "Reports", icon: <FiBarChart2 size={18} /> },
  { name: "Cloud Sync", icon: <FiCloud size={18} /> },
  { name: "Data Backup", icon: <FiLayers size={18} /> },
  { name: "Secure Storage", icon: <FiShield size={18} /> },
  { name: "Encryption", icon: <FiLock size={18} /> },
];

export const IntegrationsGrid = () => {
  return (
    <LazyMotion features={domAnimation}>
      <Container component="section" sx={{ py: 10 }}>
      {/* Header */}
      <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: "bold",
            color: "cyan.main",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Integrations
        </Typography>

        <Typography variant="h4" component="h2" sx={{ fontWeight: "bold" }}>
          Works with your workflow
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ maxW: 500 }}>
          Export data, generate reports, and keep everything secure with built-in integrations.
        </Typography>
      </Stack>

      {/* Grid */}
      <Grid container spacing={3}>
        {integrations.map((item, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`${item.name}-${i}`}>
            <Card
              component={m.div}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 4,
                boxShadow: 1,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  sx={{
                    bgcolor: "action.hover",
                    color: "cyan.main",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    width: 44,
                    height: 44,
                  }}
                >
                  {item.icon}
                </Avatar>

                <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  {item.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Container>
    </LazyMotion>
  );
};
