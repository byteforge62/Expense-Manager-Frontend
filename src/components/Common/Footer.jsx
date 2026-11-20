import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import fintrackMark from "../../assets/brand/fintrack-mark.svg";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Expense tracking", href: "#product" },
      { label: "Forecasting", href: "#forecast" },
      { label: "FAQ", href: "#questions" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Create an account", to: "/signup" },
      { label: "Sign in", to: "/login" },
      { label: "Reset password", to: "/forgot-password" },
    ],
  },
];

const linkSx = {
  display: "block",
  fontSize: 12.5,
  color: "var(--pub-muted)",
  textDecoration: "none",
  py: 0.55,
  "&:hover": { color: "var(--pub-accent)" },
};

/** The colophon: brand, index and the one line that has to be said. */
export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "var(--pub-surface)",
        borderTop: "1px solid var(--pub-hair)",
        px: "var(--pub-gutter)",
        pt: { xs: 5, md: 6 },
        pb: 3.5,
      }}
    >
      <Box sx={{ maxWidth: "var(--pub-max)", mx: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1.4fr 1fr 1fr" },
            columnGap: 5,
            rowGap: 4,
            pb: 4,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.1} alignItems="center">
              <Box component="img" src={fintrackMark} alt="" sx={{ width: 26, height: 26 }} />
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  letterSpacing: "-0.045em",
                }}
              >
                FinTrack
              </Typography>
            </Stack>
            <Typography
              sx={{
                mt: 1.5,
                fontSize: 12.5,
                lineHeight: 1.7,
                color: "var(--pub-muted)",
                maxWidth: 300,
              }}
            >
              A personal ledger for income, spending, budgets and forecasts.
              Kept in rupees, one account to one book.
            </Typography>
          </Box>

          {COLUMNS.map((column) => (
            <Box key={column.heading}>
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "var(--pub-fg)",
                }}
              >
                {column.heading}
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                {column.links.map((link) =>
                  link.to ? (
                    <Box key={link.label} component={RouterLink} to={link.to} sx={linkSx}>
                      {link.label}
                    </Box>
                  ) : (
                    <Box key={link.label} component="a" href={link.href} sx={linkSx}>
                      {link.label}
                    </Box>
                  ),
                )}
              </Box>
            </Box>
          ))}
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ pt: 2.5, borderTop: "1px solid var(--pub-hair)" }}
        >
          <Typography sx={{ fontSize: 11.5, color: "var(--pub-quiet)" }}>
            © {year} FinTrack
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "var(--pub-quiet)" }}>
            Figures on this page are illustrative.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};
