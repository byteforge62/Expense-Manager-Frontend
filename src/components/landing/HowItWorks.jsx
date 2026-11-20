
// HowItWorks.jsx

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  FiEdit3,
  FiTarget,
  FiTrendingUp,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";

const MotionBox = motion.create(Box);

const STEPS = [
  {
    icon: <FiEdit3 size={20} />,
    title: "Add your transactions",
    text: "Record income and expenses by category, amount and date.",
    notificationTitle: "Transaction recorded",
    notificationText:
      "Your income and expenses are now organized in one place.",
    notificationValue: "Ledger updated",
  },
  {
    icon: <FiTarget size={20} />,
    title: "Set your goals",
    text: "Create monthly budgets and track every bill due.",
    notificationTitle: "Budget configured",
    notificationText:
      "Your monthly spending limits are ready to track.",
    notificationValue: "Budget active",
  },
  {
    icon: <FiTrendingUp size={20} />,
    title: "Track your progress",
    text: "See the month to date, what remains, and what is forecast.",
    notificationTitle: "Financial overview ready",
    notificationText:
      "Your spending progress and financial insights are available.",
    notificationValue: "Progress tracked",
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WorkflowStep = ({
  step,
  index,
  activeStep,
  completedSteps,
  showNotification,
  reducedMotion,
}) => {
  const isActive = activeStep === index;
  const isCompleted = completedSteps.includes(index);

  return (
    <Box
      sx={{
        minWidth: 0,
        position: "relative",
        textAlign: "center",
      }}
    >
      {/* Progress node */}
      <MotionBox
        animate={{
          scale: isActive ? 1.12 : 1,
          backgroundColor:
            isActive || isCompleted
              ? "var(--pub-accent)"
              : "var(--pub-surface)",
          borderColor:
            isActive || isCompleted
              ? "var(--pub-accent)"
              : "var(--pub-hair)",
          color:
            isActive || isCompleted
              ? "#ffffff"
              : "var(--pub-muted)",
        }}
        transition={{ duration: 0.4 }}
        sx={{
          position: "relative",
          zIndex: 2,
          width: 38,
          height: 38,
          mx: "auto",
          mt: 0,
          borderRadius: "50%",
          border: "1px solid",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {isCompleted ? <FiCheck size={17} /> : index + 1}

        {isActive && !isCompleted && !reducedMotion ? (
          <MotionBox
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: -5,
              border: "1px solid var(--pub-accent)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
            animate={{
              opacity: [0.6, 0],
              scale: [1, 1.4],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ) : null}
      </MotionBox>

      {/* Step icon */}
      <MotionBox
        animate={{
          backgroundColor:
            isActive || isCompleted
              ? "var(--pub-lavender)"
              : "var(--pub-surface)",
          y: isActive ? -3 : 0,
        }}
        transition={{ duration: 0.35 }}
        sx={{
          width: 46,
          height: 46,
          mx: "auto",
          mt: 2.5,
          borderRadius: "13px",
          border: "1px solid var(--pub-hair)",
          display: "grid",
          placeItems: "center",
          color: "var(--pub-accent)",
        }}
      >
        {step.icon}
      </MotionBox>

      {/* Step title */}
      <Typography
        sx={{
          mt: 1.75,
          fontFamily: "var(--font-display)",
          fontSize: { xs: 12, sm: 13.5 },
          fontWeight: 700,
          lineHeight: 1.4,
          color:
            isActive || isCompleted
              ? "var(--pub-fg)"
              : "var(--pub-muted)",
          transition: "color 300ms ease",
        }}
      >
        {step.title}
      </Typography>

      {/* Step description */}
      <Typography
        sx={{
          mt: 0.75,
          fontSize: { xs: 11, sm: 12 },
          lineHeight: 1.6,
          color: "var(--pub-muted)",
          display: { xs: "none", sm: "block" },
        }}
      >
        {step.text}
      </Typography>

      {/* Notification */}
      <Box
        sx={{
          mt: 2,
          minHeight: { xs: 110, sm: 115 },
        }}
      >
        <AnimatePresence>
          {isActive && showNotification ? (
            <MotionBox
              key={`notification-${index}`}
              initial={{
                opacity: 0,
                y: 12,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.96,
              }}
              transition={{ duration: 0.4 }}
              sx={{
                p: { xs: 1, sm: 1.5 },
                borderRadius: "12px",
                bgcolor: "var(--pub-surface)",
                border: "1px solid var(--pub-hair)",
                boxShadow: "0 8px 24px -14px rgba(0,0,0,0.18)",
                textAlign: "left",
              }}
            >
              {/* Notification heading */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.65,
                }}
              >
                <FiCheckCircle
                  size={13}
                  color="var(--pub-accent)"
                />

                <Typography
                  sx={{
                    fontSize: { xs: 9.5, sm: 10.5 },
                    fontWeight: 700,
                    color: "var(--pub-fg)",
                    lineHeight: 1.3,
                  }}
                >
                  {step.notificationTitle}
                </Typography>
              </Box>

              {/* Notification description */}
              <Typography
                sx={{
                  mt: 0.9,
                  fontSize: { xs: 9, sm: 10.5 },
                  lineHeight: 1.5,
                  color: "var(--pub-muted)",
                }}
              >
                {step.notificationText}
              </Typography>

              {/* Notification status */}
              <Box
                sx={{
                  mt: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 0.8,
                  py: 0.4,
                  borderRadius: "6px",
                  bgcolor: "var(--pub-lavender)",
                }}
              >
                <FiCheck
                  size={10}
                  color="var(--pub-accent)"
                />

                <Typography
                  sx={{
                    fontSize: { xs: 8, sm: 9 },
                    fontWeight: 700,
                    color: "var(--pub-accent-deep)",
                  }}
                >
                  {step.notificationValue}
                </Typography>
              </Box>
            </MotionBox>
          ) : null}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

/* ---------------------------------------------
   Main How It Works section
--------------------------------------------- */

export const HowItWorks = () => {
  const sectionRef = useRef(null);
  const completedRef = useRef(false);

  const isInView = useInView(sectionRef, {
    amount: 0.3,
    once: false,
  });

  const prefersReducedMotion = useReducedMotion();

  const [stage, setStage] = useState("intro");
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!isInView || completedRef.current) return;

    let cancelled = false;

    const runAnimation = async () => {
      await wait(prefersReducedMotion ? 0 : 1800);

      if (cancelled) return;

      setStage("workflow");

      if (prefersReducedMotion) {
        setActiveStep(2);
        setCompletedSteps([0, 1, 2]);
        completedRef.current = true;
        return;
      }

      for (let index = 0; index < STEPS.length; index++) {
        if (cancelled) return;

        setActiveStep(index);
        setShowNotification(true);

        await wait(2000);

        if (cancelled) return;

        setCompletedSteps((previous) => [...previous, index]);
        setShowNotification(false);

        await wait(450);
      }

      if (!cancelled) {
        setActiveStep(2);
        completedRef.current = true;
      }
    };

    runAnimation();

    return () => {
      cancelled = true;

      if (!completedRef.current) {
        setStage("intro");
        setActiveStep(-1);
        setCompletedSteps([]);
        setShowNotification(false);
      }
    };
  }, [isInView, prefersReducedMotion]);

  const progress = completedSteps.length / STEPS.length;

  return (
    <Box
      component="section"
      id="how"
      ref={sectionRef}
      sx={{
        bgcolor: "var(--pub-bg)",
        px: "var(--pub-gutter)",
        py: { xs: 7, md: 10 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          maxWidth: "var(--pub-max)",
          mx: "auto",
        }}
      >
        {/* Animation stage */}
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: 370, sm: 340, md: 310 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait">
            {/* Intro header */}
            {stage === "intro" ? (
              <MotionBox
                key="intro"
                initial={{ opacity: 0, y: 55 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -65 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.85,
                  ease: [0.22, 1, 0.36, 1],
                }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <Box sx={{ maxWidth: 540, mx: "auto" }}>
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "var(--pub-accent)",
                    }}
                  >
                    HOW IT WORKS
                  </Typography>

                  <Typography
                    component="h2"
                    sx={{
                      mt: 2.5,
                      fontFamily: "var(--font-display)",
                      fontSize: {
                        xs: "2rem",
                        sm: "2.5rem",
                        md: "3rem",
                      },
                      fontWeight: 700,
                      lineHeight: 1.1,
                      letterSpacing: "-0.045em",
                      color: "var(--pub-fg)",
                    }}
                  >
                    Manage your money
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        color: "var(--pub-accent)",
                      }}
                    >
                      in three simple steps.
                    </Box>
                  </Typography>

                  <Typography
                    sx={{
                      mt: 2,
                      maxWidth: 420,
                      mx: "auto",
                      fontSize: 14,
                      lineHeight: 1.8,
                      color: "var(--pub-muted)",
                    }}
                  >
                    From recording transactions to reaching financial goals,
                    see how FinTrack brings everything together.
                  </Typography>
                </Box>
              </MotionBox>
            ) : null}

            {/* Workflow */}
            {stage === "workflow" ? (
              <MotionBox
                key="workflow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 900,
                    mx: "auto",
                    position: "relative",
                  }}
                >
                  {/* Progress line aligned with node centers */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 19,
                      left: "16.6667%",
                      width: "66.6666%",
                      height: 2,
                      bgcolor: "var(--pub-hair)",
                      zIndex: 0,
                      overflow: "hidden",
                    }}
                  >
                    <MotionBox
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: "var(--pub-accent)",
                        transformOrigin: "left center",
                      }}
                      animate={{ scaleX: progress }}
                      transition={{
                        duration: 0.7,
                        ease: "easeInOut",
                      }}
                    />
                  </Box>

                  {/* Three equally aligned columns */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      columnGap: { xs: 1.5, sm: 3, md: 5 },
                      position: "relative",
                      zIndex: 1,
                      alignItems: "start",
                    }}
                  >
                    {STEPS.map((step, index) => (
                      <WorkflowStep
                        key={step.title}
                        step={step}
                        index={index}
                        activeStep={activeStep}
                        completedSteps={completedSteps}
                        showNotification={showNotification}
                        reducedMotion={prefersReducedMotion}
                      />
                    ))}
                  </Box>
                </Box>
              </MotionBox>
            ) : null}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};
