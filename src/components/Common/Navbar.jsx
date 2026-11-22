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

import { FiMenu, FiX, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import fintrackMark from "../../assets/brand/fintrack-mark.svg";

const links = [
  { label: "How it works", id: "how" },
  { label: "Features", id: "features" },
  { label: "Questions", id: "questions" },
];

/**
 * --- PUBLIC NAVIGATION ---
 * White bar, brand left, product links centred, a borderless log in and a
 * dark pill next to it. On mobile the same links open as a full sheet.
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

  const linkSx = {
    px: 1.35,
    py: 0.9,
    fontSize: 13.5,
    fontWeight: 500,
    color: "var(--pub-muted)",
    textDecoration: "none",
    borderRadius: 6,
    "&:hover": { color: "var(--pub-fg)", bgcolor: "var(--pub-surface-alt)" },
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
            ? "color-mix(in srgb, var(--pub-surface) 90%, transparent)"
            : "var(--pub-surface)",
          backdropFilter: scrolled ? "saturate(150%) blur(14px)" : "none",
          backgroundImage: "none",
          borderBottom: "1px solid",
          borderColor: scrolled ? "var(--pub-hair)" : "transparent",
          transition: "background-color 200ms ease, border-color 200ms ease",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: "66px !important", md: "78px !important" },
            maxWidth: "var(--pub-max)",
            width: "100%",
            mx: "auto",
            px: "var(--pub-gutter) !important",
            gap: { xs: 1.5, md: 3 },
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
            <Box
              component="img"
              src={fintrackMark}
              alt=""
              sx={{ width: 30, height: 30, display: "block" }}
            />
            <Typography
              component="span"
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.32rem",
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                color: "var(--pub-fg)",
              }}
            >
              FinTrack
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.25}
            sx={{ display: { xs: "none", md: "flex" }, ml: { md: 3, lg: 5 } }}
          >
            {links.map((link) =>
              link.href ? (
                <Box
                  key={link.label}
                  component={RouterLink}
                  to={link.href}
                  sx={linkSx}
                >
                  {link.label}
                </Box>
              ) : (
                <Box
                  key={link.label}
                  component="a"
                  href={`#${link.id}`}
                  onClick={(event) => goTo(event, link.id)}
                  sx={linkSx}
                >
                  {link.label}
                </Box>
              ),
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ ml: "auto", display: { xs: "none", md: "flex" } }}
          >
            <IconButton
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              sx={{
                width: 38,
                height: 38,
                color: "var(--pub-muted)",
                border: "1px solid transparent",
                "&:hover": { bgcolor: "var(--pub-surface-alt)", color: "var(--pub-fg)" },
              }}
            >
              {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
            </IconButton>
            <Button
              component={RouterLink}
              to="/login"
              sx={{
                px: 2,
                minHeight: 40,
                color: "var(--pub-fg)",
                fontWeight: 600,
                fontSize: 13.5,
                border: "1px solid transparent",
                bgcolor: "transparent",
                "&:hover": { bgcolor: "var(--pub-surface-alt)" },
              }}
            >
              Log in
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              sx={{
                px: 2.5,
                minHeight: 42,
                bgcolor: "var(--pub-action)",
                color: "var(--pub-action-fg)",
                fontSize: 13.5,
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "color-mix(in srgb, var(--pub-action) 86%, var(--pub-action-fg))",
                },
              }}
            >
              Sign up
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ ml: "auto", display: { xs: "flex", md: "none" } }}
          >
            <IconButton
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              sx={{ width: 38, height: 38, color: "var(--pub-muted)" }}
            >
              {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
            </IconButton>
            <IconButton
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              sx={{
                width: 40,
                height: 40,
                color: "var(--pub-fg)",
                border: "1px solid var(--pub-hair)",
                bgcolor: "var(--pub-surface)",
              }}
            >
              {open ? <FiX size={19} /> : <FiMenu size={19} />}
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
              top: 66,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: (t) => t.zIndex.appBar - 1,
              bgcolor: "var(--pub-surface)",
              borderTop: "1px solid var(--pub-hair)",
              display: { md: "none" },
              px: "var(--pub-gutter)",
              pt: 1.5,
              pb: 4,
              overflowY: "auto",
            }}
          >
            <Stack>
              {links.map((link) => (
                <Box
                  key={link.label}
                  component={link.href ? RouterLink : "a"}
                  {...(link.href
                    ? { to: link.href }
                    : { href: `#${link.id}`, onClick: (event) => goTo(event, link.id) })}
                  sx={{
                    py: 2,
                    borderBottom: "1px solid var(--pub-hair)",
                    textDecoration: "none",
                    color: "var(--pub-fg)",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.24rem",
                    fontWeight: 700,
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
                sx={{
                  bgcolor: "var(--pub-action)",
                  color: "var(--pub-action-fg)",
                  "&:hover": {
                    bgcolor: "color-mix(in srgb, var(--pub-action) 86%, var(--pub-action-fg))",
                  },
                }}
              >
                Sign up free
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                size="large"
                fullWidth
                variant="outlined"
                sx={{ borderColor: "var(--pub-hair)", color: "var(--pub-fg)" }}
              >
                Log in
              </Button>
              <Typography sx={{ pt: 1, fontSize: 11.5, color: "var(--pub-quiet)", textAlign: "center" }}>
                Free to use · No card details
              </Typography>
            </Stack>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};
