import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowRight, FiPlay, FiCheck, FiChevronRight } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

/**
 * --- PUBLIC HERO ---
 * A split statement on a lavender field: proof and promise on the left,
 * a product stage on the right. The phone is an illustrative composite;
 * the floating card is live UI so the numbers stay legible.
 */

const PEOPLE = [
  { position: "0% 0%" },
  { position: "100% 0%" },
  { position: "0% 100%" },
  { position: "100% 100%" },
];

const AvatarStack = () => (
  <Stack direction="row" spacing={-1.1} aria-label="FinTrack members">
    {PEOPLE.map((person, index) => (
      <Box
        key={index}
        aria-hidden="true"
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "2px solid var(--pub-hero-ring)",
          backgroundImage: "url(/images/ratings-people.jpg)",
          backgroundSize: "200% 200%",
          backgroundPosition: person.position,
          flexShrink: 0,
        }}
      />
    ))}
  </Stack>
);

const Stars = () => (
  <Stack direction="row" spacing={0.15} aria-label="Rated 4.9 out of 5">
    {[0, 1, 2, 3, 4].map((star) => (
      <Box
        key={star}
        component="span"
        sx={{ color: "#f59e0b", display: "flex", fontSize: 13 }}
      >
        <FaStar size={13} />
      </Box>
    ))}
  </Stack>
);

export const Hero = () => (
  <Box
    component="section"
    sx={{
      bgcolor: "var(--pub-bg)",
      px: "var(--pub-gutter)",
      pt: { xs: 2.5, md: 3.5 },
      pb: { xs: 3, md: 4 },
    }}
  >
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        maxWidth: "var(--pub-max)",
        mx: "auto",
        borderRadius: { xs: "22px", md: "30px" },
        px: { xs: "22px", sm: "44px", md: "64px" },
        pt: { xs: 4.5, sm: 5, md: 6 },
        pb: { xs: 4, sm: 4.5, md: 5 },
        background: "var(--pub-hero-field)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.14fr 0.86fr" },
          alignItems: "center",
          columnGap: { lg: 4 },
          rowGap: { xs: 5, lg: 2 },
        }}
      >
        {/* ── Statement ── */}
        <Box sx={{ maxWidth: 640 }}>
          <Stack
            direction="row"
            spacing={0.9}
            alignItems="center"
            sx={{
              display: "inline-flex",
              pl: 0.55,
              pr: 1.5,
              py: 0.5,
              borderRadius: 999,
              background: "var(--pub-hero-chip)",
              border: "1px solid var(--pub-hero-chip-border)",
              color: "var(--pub-hero-chip-fg)",
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              <FiCheck size={11} strokeWidth={3} />
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.005em" }}>
              Faster Global Payments
            </Typography>
          </Stack>

          <Typography
            component="h1"
            sx={{
              mt: 2.6,
              fontFamily: "var(--font-display)",
              fontSize: { xs: "2.35rem", sm: "3.05rem", md: "3.45rem", lg: "3.65rem" },
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.05em",
              color: "var(--pub-hero-title)",
            }}
          >
            Your money, your goals, our technology to empower success
          </Typography>

          <Typography
            sx={{
              mt: 2.4,
              maxWidth: "46ch",
              fontSize: { xs: "0.98rem", md: "1.05rem" },
              lineHeight: 1.7,
              color: "var(--pub-hero-muted)",
            }}
          >
            Manage your finances easily with tools to track spending, set goals,
            and grow your wealth confidently.
          </Typography>

          <Stack
            direction="row"
            spacing={1.6}
            alignItems="center"
            sx={{ mt: 3, flexWrap: "wrap", rowGap: 1.25 }}
          >
            <AvatarStack />
            <Box>
              <Stars />
              <Typography sx={{ mt: 0.45, fontSize: 12.5, color: "var(--pub-hero-muted)" }}>
                <Box component="span" sx={{ fontWeight: 700, color: "var(--pub-hero-title)" }}>
                  4.9 · 1.2k Ratings
                </Box>{" "}
                <Box
                  component="a"
                  href="#questions"
                  sx={{ color: "var(--pub-hero-muted)", textDecoration: "underline", textUnderlineOffset: "2px" }}
                >
                  400+ Reviews
                </Box>
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 3.5 }}>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              size="large"
              endIcon={<FiChevronRight size={17} />}
              sx={{
                bgcolor: "#6366f1",
                minHeight: 50,
                px: 3,
                fontSize: "0.95rem",
                boxShadow: "0 12px 24px -14px rgba(79,70,229,0.9)",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              Get Started for Free
            </Button>
            <Button
              component="a"
              href="#how"
              variant="outlined"
              size="large"
              endIcon={
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "1px solid #cbd5e1",
                    display: "grid",
                    placeItems: "center",
                    ml: 0.25,
                  }}
                >
                  <FiPlay size={9} style={{ marginLeft: 1 }} />
                </Box>
              }
              sx={{
                minHeight: 50,
                px: 2.75,
                fontSize: "0.95rem",
                bgcolor: "#ffffff",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px -2px rgba(15,23,42,0.12)",
                "&:hover": { bgcolor: "#ffffff", borderColor: "#c7d2fe" },
              }}
            >
              Watch a Demo
            </Button>
          </Stack>
        </Box>

        {/* ── Product stage ── */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: { xs: 430, lg: 500 },
            mx: "auto",
            justifySelf: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              height: { xs: 390, sm: 455, md: 500 },
              borderRadius: "26px",
              border: "1px solid rgba(255,255,255,0.55)",
              boxShadow: "0 40px 70px -38px rgba(30,27,75,0.55)",
              bgcolor: "#b3a4ec",
            }}
          >
            <Box
              component="img"
              src="/images/hero-phone.jpg"
              alt="The FinTrack mobile dashboard, showing an account balance, quick actions and a transaction list"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "50% 68%",
                display: "block",
              }}
            />

            {/* Legible summary layered over the composite */}
            <Box
              sx={{
                position: "absolute",
                left: { xs: 14, sm: 20 },
                bottom: { xs: 14, sm: 20 },
                width: { xs: 196, sm: 224 },
                bgcolor: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 18px 34px -18px rgba(15,23,42,0.45)",
                p: { xs: 1.5, sm: 1.75 },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: "#64748b" }}>
                  This month
                </Typography>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.15,
                    borderRadius: 999,
                    bgcolor: "#ecfdf5",
                    color: "#059669",
                  }}
                >
                  <Typography sx={{ fontSize: 9.5, fontWeight: 700 }}>+12.4%</Typography>
                </Box>
              </Stack>
              <Typography
                sx={{
                  mt: 0.6,
                  fontFamily: "var(--font-display)",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  letterSpacing: "-0.035em",
                  color: "#0f172a",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.1,
                }}
              >
                ₹26,550 left
              </Typography>
              <Box
                aria-hidden="true"
                sx={{ mt: 1.1, height: 5, borderRadius: 999, bgcolor: "#f1f5f9", overflow: "hidden" }}
              >
                <Box sx={{ width: "66%", height: "100%", borderRadius: "inherit", bgcolor: "#6366f1" }} />
              </Box>
              <Typography sx={{ mt: 0.8, fontSize: 9.5, color: "#94a3b8" }}>
                of ₹48,000 planned
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              mt: 1.25,
              textAlign: "right",
              fontSize: 10.5,
              color: "var(--pub-hero-muted)",
              opacity: 0.8,
            }}
          >
            Illustrative dashboard
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);
