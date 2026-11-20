import { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { FiMenu, FiX, FiMoon, FiSun, FiArrowRight } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import fintrackMark from "../../assets/brand/fintrack-mark.svg";

const links = [
  { label: "How it works", id: "how" },
  { label: "Features", id: "features" },
  { label: "Forecasting", id: "forecast" },
  { label: "FAQ", id: "questions" },
];

/**
 * --- PUBLIC NAVIGATION ---
 * A single clean bar on the page canvas. It gains a hairline and a
 * translucent surface once the page moves, and opens a light mobile sheet
 * below `md`.
 */
export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const goTo = (event, id) => {
    event.preventDefault();
    setOpen(false);
    if (!onHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          zIndex: (t) => t.zIndex.appBar,
          color: "var(--pub-fg)",
          bgcolor: scrolled
            ? "color-mix(in srgb, var(--pub-bg) 88%, transparent)"
            : "var(--pub-bg)",
          backdropFilter: scrolled ? "saturate(140%) blur(14px)" : "none",
          backgroundImage: "none",
          borderBottom: "1px solid",
          borderColor: scrolled ? "var(--pub-hair)" : "transparent",
          transition: "background-color 200ms ease, border-color 200ms ease",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: "64px !important", md: "74px !important" },
            maxWidth: "var(--pub-max)",
            width: "100%",
            mx: "auto",
            px: "var(--pub-gutter) !important",
            gap: { xs: 1.5, md: 4 },
          }}
        >
          <Stack
            component={RouterLink}
            to="/"
            direction="row"
            spacing={1.1}
            alignItems="center"
            sx={{ textDecoration: "none", color: "inherit", flexShrink: 0 }}
          >
            <Box component="img" src={fintrackMark} alt="" sx={{ width: 28, height: 28, display: "block" }} />
            <Typography
              component="span"
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.35rem",
                fontWeight: 600,
                letterSpacing: "-0.045em",
                lineHeight: 1,
              }}
            >
              FinTrack
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ display: { xs: "none", md: "flex" }, ml: 1 }}
          >
            {links.map((link) => (
              <Box
                key={link.id}
                component="a"
                href={`#${link.id}`}
                onClick={(event) => goTo(event, link.id)}
                sx={{
                  px: 1.5,
                  py: 0.85,
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--pub-muted)",
                  textDecoration: "none",
                  "&:hover": { color: "var(--pub-accent)", bgcolor: "var(--pub-lavender-soft)" },
                }}
              >
                {link.label}
              </Box>
            ))}
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ ml: "auto", display: { xs: "none", md: "flex" } }}
          >
            <IconButton
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              sx={{
                width: 36,
                height: 36,
                color: "var(--pub-muted)",
                border: "1px solid var(--pub-hair)",
                bgcolor: "var(--pub-surface)",
                "&:hover": { color: "var(--pub-accent)" },
              }}
            >
              {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
            </IconButton>
            <Button
              component={RouterLink}
              to="/login"
              sx={{
                px: 2,
                minHeight: 38,
                color: "var(--pub-fg)",
                fontWeight: 600,
                fontSize: 13,
                "&:hover": { bgcolor: "var(--pub-lavender-soft)" },
              }}
            >
              Sign in
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              endIcon={<FiArrowRight size={15} />}
              sx={{ px: 2.25, minHeight: 40, fontSize: 13 }}
            >
              Get started
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ ml: "auto", display: { xs: "flex", md: "none" } }}
          >
            <IconButton
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              sx={{ width: 36, height: 36, color: "var(--pub-muted)" }}
            >
              {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
            </IconButton>
            <IconButton
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              sx={{ width: 38, height: 38, color: "var(--pub-fg)" }}
            >
              {open ? <FiX size={20} /> : <FiMenu size={20} />}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            sx={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: (t) => t.zIndex.appBar - 1,
              bgcolor: "var(--pub-bg)",
              borderTop: "1px solid var(--pub-hair)",
              display: { md: "none" },
              px: "var(--pub-gutter)",
              pt: 2,
              pb: 4,
              overflowY: "auto",
            }}
          >
            <Stack>
              {links.map((link) => (
                <Box
                  key={link.id}
                  component="a"
                  href={`#${link.id}`}
                  onClick={(event) => goTo(event, link.id)}
                  sx={{
                    py: 2.1,
                    borderBottom: "1px solid var(--pub-hair)",
                    textDecoration: "none",
                    color: "var(--pub-fg)",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>

            <Stack spacing={1.25} sx={{ mt: 4 }}>
              <Button
                component={RouterLink}
                to="/signup"
                size="large"
                fullWidth
                variant="contained"
                endIcon={<FiArrowRight size={16} />}
              >
                Get started free
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                size="large"
                fullWidth
                variant="outlined"
                sx={{ borderColor: "var(--pub-hair)" }}
              >
                Sign in
              </Button>
              <Typography sx={{ pt: 1, fontSize: 11.5, color: "var(--pub-quiet)", textAlign: "center" }}>
                Free to use · Reports download as PDF
              </Typography>
            </Stack>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};
