import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FiEdit3, FiTarget, FiTrendingUp, FiArrowRight } from "react-icons/fi";

const STEPS = [
  {
    icon: <FiEdit3 size={20} />,
    title: "Add your transactions",
    text: "Record income and expenses by category, amount and date.",
  },
  {
    icon: <FiTarget size={20} />,
    title: "Set your goals",
    text: "Create monthly budgets and track every bill due.",
  },
  {
    icon: <FiTrendingUp size={20} />,
    title: "Track your progress",
    text: "See the month to date, what remains, and what is forecast.",
  },
];

/** Three steps, laid out as a progression rather than three equal cards. */
export const HowItWorks = () => (
  <Box
    component="section"
    id="how"
    sx={{
      bgcolor: "var(--pub-bg)",
      px: "var(--pub-gutter)",
      py: { xs: 7, md: 10 },
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "0.82fr 1.18fr" },
        columnGap: { lg: 7 },
        rowGap: { xs: 5, lg: 0 },
        alignItems: "start",
      }}
    >
      <Box>
        <Typography
          sx={{
            display: "inline-block",
            px: 1.5,
            py: 0.55,
            borderRadius: 999,
            bgcolor: "var(--pub-lavender)",
            color: "var(--pub-accent-deep)",
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          How FinTrack works
        </Typography>
        <Typography
          component="h2"
          sx={{
            mt: 2.5,
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.95rem", md: "2.5rem" },
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: "-0.04em",
            maxWidth: 380,
          }}
        >
          Manage your money in three steps
        </Typography>
        <Typography
          sx={{
            mt: 2,
            maxWidth: 360,
            fontSize: 14.5,
            lineHeight: 1.7,
            color: "var(--pub-muted)",
          }}
        >
          From recording to planning, FinTrack keeps the same set of figures
          underneath every screen.
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          columnGap: { sm: 3 },
          rowGap: { xs: 4, sm: 0 },
          pt: { sm: 1 },
        }}
      >
        {/* connector */}
        <Box
          aria-hidden="true"
          sx={{
            display: { xs: "none", sm: "block" },
            position: "absolute",
            top: 18,
            left: "16%",
            right: "16%",
            height: "1px",
            background:
              "linear-gradient(to right, transparent, var(--pub-hair) 12%, var(--pub-hair) 88%, transparent)",
          }}
        />

        {STEPS.map((step, index) => (
          <Box key={step.title} sx={{ position: "relative", textAlign: "center", px: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                mx: "auto",
                borderRadius: "50%",
                bgcolor: index === 0 ? "var(--pub-accent)" : "var(--pub-surface)",
                color: index === 0 ? "#ffffff" : "var(--pub-accent)",
                border: "1px solid",
                borderColor: index === 0 ? "transparent" : "var(--pub-hair)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontSize: 13,
                fontWeight: 700,
                position: "relative",
                zIndex: 1,
                boxShadow: index === 0 ? "0 10px 22px -12px rgba(103,53,200,0.7)" : "none",
              }}
            >
              {index + 1}
            </Box>

            <Box
              sx={{
                mt: 2.5,
                width: 44,
                height: 44,
                mx: "auto",
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                bgcolor: "var(--pub-lavender-soft)",
                color: "var(--pub-accent)",
                border: "1px solid color-mix(in srgb, var(--pub-accent) 12%, transparent)",
              }}
            >
              {step.icon}
            </Box>

            <Typography
              sx={{
                mt: 1.75,
                fontFamily: "var(--font-display)",
                fontSize: "0.98rem",
                fontWeight: 600,
                letterSpacing: "-0.015em",
              }}
            >
              {step.title}
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                mx: "auto",
                maxWidth: 216,
                fontSize: 12.5,
                lineHeight: 1.65,
                color: "var(--pub-muted)",
              }}
            >
              {step.text}
            </Typography>

            {index < STEPS.length - 1 && (
              <Box
                aria-hidden="true"
                sx={{
                  display: { xs: "none", sm: "block" },
                  position: "absolute",
                  top: 12,
                  right: -16,
                  color: "color-mix(in srgb, var(--pub-accent) 45%, transparent)",
                }}
              >
                <FiArrowRight size={14} />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);
