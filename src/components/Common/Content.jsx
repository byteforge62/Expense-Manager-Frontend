
import Box from "@mui/material/Box";

import { Hero } from "../landing/Hero";
import { SocialProof } from "../landing/SocialProof";
import { CapabilityStrip } from "../landing/CapabilityStrip";
import { HowItWorks } from "../landing/HowItWorks";
import { FeatureSections } from "../landing/FeatureSections";
import { Notes } from "../landing/Notes";
import { Start } from "../landing/Start";
import { Footer } from "./Footer";

export const Content = () => (
  <Box
    sx={{
      position: "relative",
      isolation: "isolate",
      bgcolor: "var(--pub-bg)",
      color: "var(--pub-fg)",
      minHeight: "100vh",
      width: "100%",
      overflowX: "clip",

      backgroundImage: `
        radial-gradient(
          ellipse at 8% 4%,
          rgba(99, 102, 241, 0.075) 0%,
          transparent 36%
        ),
        radial-gradient(
          ellipse at 92% 20%,
          rgba(20, 184, 166, 0.055) 0%,
          transparent 32%
        ),
        radial-gradient(
          ellipse at 50% 58%,
          rgba(139, 92, 246, 0.035) 0%,
          transparent 48%
        )
      `,

      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: -1,

        backgroundImage: `
          linear-gradient(
            rgba(99, 102, 241, 0.025) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(99, 102, 241, 0.025) 1px,
            transparent 1px
          )
        `,
        backgroundSize: "72px 72px",

        maskImage:
          "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.5) 45%, transparent 100%)",
      },

      "&::after": {
        content: '""',
        position: "absolute",
        top: "12%",
        right: "-180px",
        width: "460px",
        height: "460px",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: -1,

        background:
          "radial-gradient(circle, rgba(99,102,241,0.045) 0%, rgba(99,102,241,0.015) 40%, transparent 72%)",
        filter: "blur(30px)",
      },

      "& > *": {
        position: "relative",
        zIndex: 1,
      },
    }}
  >
    <Hero />
    <SocialProof />
    <CapabilityStrip />
    <HowItWorks />
    <FeatureSections />
    <Notes />
    <Start />
    <Footer />
  </Box>
);
