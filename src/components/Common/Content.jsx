import Box from "@mui/material/Box";

import { Hero } from "../landing/Hero";
import { CapabilityStrip } from "../landing/CapabilityStrip";
import { HowItWorks } from "../landing/HowItWorks";
import { FeatureSections } from "../landing/FeatureSections";
import { Notes } from "../landing/Notes";
import { Start } from "../landing/Start";
import { Footer } from "./Footer";

/**
 * --- PUBLIC HOME ---
 * Statement, proof, method, chapters, questions, door. Each section owns
 * its own composition so the page never settles into a stack of cards.
 */
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
