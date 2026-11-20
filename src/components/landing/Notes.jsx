import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const QUESTIONS = [
  {
    q: "What does FinTrack cost?",
    a: "Nothing. There is one plan and no billing pages, because there is no payment flow in the product.",
  },
  {
    q: "What can I keep in it?",
    a: "Income, expenses, monthly budgets, bills, recurring transactions, categories and reports — all in rupees.",
  },
  {
    q: "Does it connect to my bank?",
    a: "No. Entries are recorded by you, which is why every figure on this page is labelled as illustrative.",
  },
  {
    q: "How is the forecast produced?",
    a: "It projects your recorded activity and the bills you have scheduled across the remaining days of the month. It is not a bank feed.",
  },
  {
    q: "Can I get my records out?",
    a: "Yes. The reports screen generates a PDF from your account data when you request it.",
  },
  {
    q: "Who can see my records?",
    a: "Your data is served over an authenticated API and scoped to your account. Administrators can access account records for support and moderation.",
  },
];

/** Questions, answered plainly — a list, not an accordion. */
export const Notes = () => (
  <Box
    component="section"
    id="questions"
    sx={{ bgcolor: "var(--pub-surface)", px: "var(--pub-gutter)", py: { xs: 7, md: 10 } }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "0.66fr 1.34fr" },
        columnGap: { lg: 8 },
        rowGap: 4,
        alignItems: "start",
      }}
    >
      <Box sx={{ position: { lg: "sticky" }, top: { lg: 110 } }}>
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.85rem", md: "2.3rem" },
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.04em",
          }}
        >
          Questions,
          <br />
          answered plainly.
        </Typography>
        <Typography sx={{ mt: 2, fontSize: 13.5, lineHeight: 1.7, color: "var(--pub-muted)", maxWidth: 300 }}>
          No invented certifications, no imaginary integrations. If the product
          does it, it is here; if it does not, it is not.
        </Typography>
      </Box>

      <Box component="dl" sx={{ m: 0 }}>
        {QUESTIONS.map((item) => (
          <Box
            key={item.q}
            sx={{
              py: 2.4,
              borderTop: "1px solid var(--pub-hair)",
              "&:last-of-type": { borderBottom: "1px solid var(--pub-hair)" },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "0.72fr 1.28fr" },
              columnGap: 4,
              rowGap: 0.75,
            }}
          >
            <Typography
              component="dt"
              sx={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em" }}
            >
              {item.q}
            </Typography>
            <Typography
              component="dd"
              sx={{ m: 0, fontSize: 13, lineHeight: 1.68, color: "var(--pub-muted)", maxWidth: "48ch" }}
            >
              {item.a}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);
