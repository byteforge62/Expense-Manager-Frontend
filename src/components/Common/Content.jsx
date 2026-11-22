import Box from "@mui/material/Box";

import { Hero } from "../landing/Hero";
import { CapabilityStrip } from "../landing/CapabilityStrip";
import { HowItWorks } from "../landing/HowItWorks";
import { FeatureSections } from "../landing/FeatureSections";
import { Notes } from "../landing/Notes";
import { Start } from "../landing/Start";
import { Footer } from "./Footer";

export const Content = () => (
  <Box
    sx={{
      bgcolor: "var(--pub-bg)",
      color: "var(--pub-fg)",
      minHeight: "100vh",
      width: "100%",
      overflowX: "clip",
    }}
  >
    <Hero />
    <CapabilityStrip />
    <HowItWorks />
    <FeatureSections />
    <Notes />
    <Start />
    <Footer />
  </Box>
);
