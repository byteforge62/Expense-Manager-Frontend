import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SiSpotify, SiSlack, SiDropbox, SiWebflow } from "react-icons/si";

const COMPANIES = [
  { name: "Spotify", icon: SiSpotify },
  { name: "Slack", icon: SiSlack },
  { name: "Dropbox", icon: SiDropbox },
  { name: "Webflow", icon: SiWebflow },
];

/** Social proof: one line, four grayscale marks, no decoration. */
export const SocialProof = () => (
  <Box
    component="section"
    aria-label="Companies using FinTrack"
    sx={{
      bgcolor: "var(--pub-surface-alt)",
      borderTop: "1px solid var(--pub-hair)",
      borderBottom: "1px solid var(--pub-hair)",
      px: "var(--pub-gutter)",
      py: { xs: 3.5, md: 4 },
    }}
  >
    <Stack
      direction={{ xs: "column", md: "row" }}
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={{ xs: 2.25, md: 5 }}
      sx={{ maxWidth: "var(--pub-max)", mx: "auto" }}
    >
      <Typography
        sx={{
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: "0.01em",
          color: "var(--pub-muted)",
          whiteSpace: "nowrap",
        }}
      >
        Trusted by 100+ Companies
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 3, sm: 4.5, md: 6 }}
        sx={{ flexWrap: "wrap", rowGap: 2, color: "var(--pub-quiet)" }}
      >
        {COMPANIES.map((company) => {
          const Icon = company.icon;
          return (
            <Stack
              key={company.name}
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ opacity: 0.82 }}
            >
              <Icon size={20} aria-hidden="true" />
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.035em",
                }}
              >
                {company.name}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  </Box>
);
