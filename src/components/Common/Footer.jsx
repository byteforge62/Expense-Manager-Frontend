import React from "react";
import { m } from "framer-motion";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";

// ================ Icons ================
import {
  FiTwitter,
  FiGithub,
  FiLinkedin,
  FiArrowUpRight,
} from "react-icons/fi";

// --- STATIC DATA EXTRACTED TO MODULE SCOPE ---
const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
    { label: "FAQ", href: "#faq" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Security", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "System Status", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const SOCIAL_LINKS = [
  { icon: <FiTwitter />, href: "#", label: "Twitter" },
  { icon: <FiGithub />, href: "#", label: "GitHub" },
  { icon: <FiLinkedin />, href: "#", label: "LinkedIn" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        mt: 10,
        pt: 10,
        pb: 5,
        borderTop: 1,
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* ── BACKGROUND VISUAL GLOWS ── */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 300,
          bgcolor: "rgba(6, 182, 212, 0.05)",
          filter: "blur(120px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10 }}>
        <Grid container spacing={{ xs: 6, lg: 4 }} sx={{ mb: 8 }}>
          {/* ── BRAND SECTION ── */}
          <Grid
            size={{ xs: 12, md: 6, lg: 4 }}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  height: 40,
                  width: 40,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #06b6d4, #2563eb)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(6, 182, 212, 0.2)",
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  sx={{ width: 20, height: 20, color: "common.white" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 9v1M5.05 5.05A9 9 0 1118.95 18.95"
                  />
                </Box>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(to right, #22d3ee, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                FinTrack
              </Typography>
            </Stack>

            <Typography
              variant="body1"
              sx={{ color: "text.secondary", maxWidth: 320, lineHeight: 1.6 }}
            >
              The high-performance dashboard for engineers of their own
              finances. Track, analyze, and optimize your wealth with technical
              precision.
            </Typography>

            {/* Social Icons Stack */}
            <Stack direction="row" spacing={2}>
              {SOCIAL_LINKS.map((social) => (
                <IconButton
                  key={`social-${social.label.toLowerCase()}`}
                  component={m.a}
                  href={social.href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  aria-label={social.label}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: 1,
                    borderColor: "divider",
                    color: "text.secondary",
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "cyan.main",
                      borderColor: "rgba(6, 182, 212, 0.5)",
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* ── LINK COLUMNS ── */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <Grid
              size={{ xs: 12, sm: 4, lg: 2.6 }}
              key={`footer-cat-${category}`}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "text.primary",
                }}
              >
                {category}
              </Typography>
              <Box
                component="ul"
                sx={{
                  p: 0,
                  m: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {links.map((link) => (
                  <Box
                    component="li"
                    key={`footer-link-${category}-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link
                      href={link.href}
                      underline="none"
                      sx={{
                        color: "text.secondary",
                        transition: "color 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        fontSize: "14px",
                        "&:hover": { color: "cyan.main" },
                        "&:hover .arrow-icon": {
                          opacity: 1,
                          transform: "translate(0, 0)",
                        },
                      }}
                    >
                      {link.label}
                      <Box
                        className="arrow-icon"
                        sx={{
                          display: "inline-flex",
                          opacity: 0,
                          transform: "translate(-4px, 4px)",
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <FiArrowUpRight size={14} />
                      </Box>
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ── BOTTOM CORNER STRIP BAR ── */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={3}
          sx={{ pt: 4, borderTop: 1, borderColor: "divider" }}
        >
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", color: "text.disabled" }}
          >
            &copy; {currentYear} FinTrack Labs Inc. All rights reserved.
          </Typography>

          {/* Status Runtime Diagnostics Metrics Indicators */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={4}
            sx={{
              fontFamily: "monospace",
              color: "text.disabled",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "12px",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "emerald.main",
                  animation: "pulse 2s infinite",
                }}
              />
              <Typography variant="caption" sx={{ fontFamily: "inherit" }}>
                All Systems Operational
              </Typography>
            </Stack>
            <Box component="span" sx={{ display: { xs: "none", sm: "block" } }}>
              v2.4.0-stable
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
