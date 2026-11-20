
import { useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  FiBarChart2,
  FiTarget,
  FiZap,
  FiLock,
} from "react-icons/fi";

const ITEMS = [
  {
    icon: <FiBarChart2 size={19} />,
    title: "Track everything",
    text: "Income and expenses in one ledger, by category and by date.",
  },
  {
    icon: <FiTarget size={19} />,
    title: "Set budgets",
    text: "Monthly limits per category, with what is left and what is over.",
  },
  {
    icon: <FiZap size={19} />,
    title: "Get insight",
    text: "Spending patterns, forecasts and recorded analysis, not guesswork.",
  },
  {
    icon: <FiLock size={19} />,
    title: "Your data, your account",
    text: "Records stay scoped to your account behind an authenticated API.",
  },
];

const MotionBox = motion.create(Box);

const CapabilityCard = ({ item }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1.75,
      alignItems: "flex-start",
      width: { xs: 280, sm: 310, md: 320 },
      minWidth: { xs: 280, sm: 310, md: 320 },
      pl: 3,
      borderLeft: "1px solid var(--pub-hair)",
      boxSizing: "border-box",
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "11px",
        bgcolor: "var(--pub-lavender)",
        color: "var(--pub-accent)",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        transition: "transform 250ms ease",
        "&:hover": {
          transform: "scale(1.08)",
        },
      }}
    >
      {item.icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "0.97rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--pub-fg)",
        }}
      >
        {item.title}
      </Typography>

      <Typography
        sx={{
          mt: 0.6,
          fontSize: 12.5,
          lineHeight: 1.65,
          color: "var(--pub-muted)",
          maxWidth: 235,
        }}
      >
        {item.text}
      </Typography>
    </Box>
  </Box>
);

export const CapabilityStrip = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.2,
  });

  const prefersReducedMotion = useReducedMotion();

  const shouldAnimate = isInView && !prefersReducedMotion;

  return (
    <Box
      component="section"
      id="capabilities"
      aria-label="What FinTrack does"
      ref={sectionRef}
      sx={{
        bgcolor: "var(--pub-surface)",
        borderBottom: "1px solid var(--pub-hair)",
        py: { xs: 5, md: 6 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          maxWidth: "var(--pub-max)",
          mx: "auto",
          overflow: "hidden",
          px: "var(--pub-gutter)",
        }}
      >
        <Box
          className="capability-marquee"
          sx={{
            overflow: "hidden",
            "&:hover .capability-track": {
              animationPlayState: "paused",
            },
          }}
        >
          <motion.div
            className="capability-track"
            initial={{ x: "0%" }}
            animate={
              shouldAnimate
                ? { x: ["0%", "-50%"] }
                : { x: "0%" }
            }
            transition={
              shouldAnimate
                ? {
                    x: {
                      duration: 32,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }
                : { duration: 0 }
            }
            style={{
              display: "flex",
              width: "max-content",
              willChange: shouldAnimate ? "transform" : "auto",
            }}
          >
            {/* Original cards */}
            <motion.div
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.35,
                  },
                },
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                paddingRight: 28,
              }}
            >
              {ITEMS.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: 65,
                    },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.65,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    },
                  }}
                  style={{
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <CapabilityCard item={item} />
                </motion.div>
              ))}
            </motion.div>

            {/* Duplicate cards for seamless looping */}
            <Box
              aria-hidden="true"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3.5,
                pr: 3.5,
                flexShrink: 0,
              }}
            >
              {ITEMS.map((item) => (
                <Box
                  key={`duplicate-${item.title}`}
                  sx={{
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <CapabilityCard item={item} />
                </Box>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};
