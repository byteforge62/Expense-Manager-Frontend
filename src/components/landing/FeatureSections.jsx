import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FiCheck, FiArrowUpRight, FiClock, FiFileText } from "react-icons/fi";

/**
 * --- PRODUCT STORY ---
 * Four chapters, each with its own composition: an annotated ledger, a
 * lavender planning band with the visual on the left, an analytical
 * forecast, and a wide closing note about reports and recurring activity.
 */

const CATEGORIES = [
  { name: "Housing", amount: "₹18,000", pct: 84, tone: "var(--pub-accent)" },
  { name: "Groceries", amount: "₹6,480", pct: 46, tone: "var(--pub-accent)" },
  { name: "Transport", amount: "₹2,250", pct: 26, tone: "var(--pub-negative)" },
  { name: "Utilities", amount: "₹1,940", pct: 20, tone: "var(--pub-accent)" },
];

const BUDGETS = [
  { name: "Groceries", spent: "₹8,800", limit: "₹12,000", pct: 73, note: "₹3,200 left", over: false },
  { name: "Transport", spent: "₹3,150", limit: "₹2,000", pct: 100, note: "₹1,150 over", over: true },
  { name: "Eating out", spent: "₹2,400", limit: "₹6,000", pct: 40, note: "₹3,600 left", over: false },
];

const Eyebrow = ({ children }) => (
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
      border: "1px solid color-mix(in srgb, var(--pub-accent) 14%, transparent)",
    }}
  >
    {children}
  </Typography>
);

const SectionHeading = ({ children }) => (
  <Typography
    component="h2"
    sx={{
      mt: 2.5,
      fontFamily: "var(--font-display)",
      fontSize: { xs: "1.8rem", md: "2.35rem" },
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: "-0.04em",
      textWrap: "balance",
      maxWidth: 440,
    }}
  >
    {children}
  </Typography>
);

const Body = ({ children }) => (
  <Typography
    sx={{
      mt: 2,
      maxWidth: 430,
      fontSize: 14.5,
      lineHeight: 1.72,
      color: "var(--pub-muted)",
    }}
  >
    {children}
  </Typography>
);

const CheckLine = ({ children }) => (
  <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ py: 0.9 }}>
    <Box
      sx={{
        width: 18,
        height: 18,
        mt: "1px",
        borderRadius: "50%",
        bgcolor: "var(--pub-lavender)",
        color: "var(--pub-accent)",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <FiCheck size={11} />
    </Box>
    <Typography sx={{ fontSize: 13, lineHeight: 1.55, color: "var(--pub-muted)" }}>
      {children}
    </Typography>
  </Stack>
);

/* ── 1. Expense tracking ── */
const ExpenseChapter = () => (
  <Box
    component="section"
    id="product"
    sx={{ bgcolor: "var(--pub-surface)", px: "var(--pub-gutter)", py: { xs: 7, md: 10 } }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "0.94fr 1.06fr" },
        columnGap: { lg: 8 },
        rowGap: 5,
        alignItems: "center",
      }}
    >
      <Box>
        <Eyebrow>Expense tracking</Eyebrow>
        <SectionHeading>Every expense, sorted before the month closes.</SectionHeading>
        <Body>
          Record what you spend against a category, a date and an amount. The
          same entries feed the records table, the breakdown and the totals at
          the top of the page.
        </Body>
        <Box sx={{ mt: 2.5 }}>
          <CheckLine>Categories you define and manage yourself</CheckLine>
          <CheckLine>Filter records by category, date and amount</CheckLine>
          <CheckLine>Delete an entry only after confirming it</CheckLine>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: "var(--pub-bg)",
          border: "1px solid var(--pub-hair)",
          borderRadius: "16px",
          p: { xs: 2.5, sm: 3.25 },
          boxShadow: "var(--shadow-panel)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.02rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Spending by category
          </Typography>
          <Typography sx={{ fontSize: 11, color: "var(--pub-quiet)" }}>June</Typography>
        </Stack>

        <Stack spacing={2.1} sx={{ mt: 2.5 }}>
          {CATEGORIES.map((category) => (
            <Box key={category.name}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.85 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                  {category.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--pub-muted)",
                  }}
                >
                  {category.amount}
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 6,
                  borderRadius: 99,
                  bgcolor: "var(--pub-lavender)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${category.pct}%`,
                    height: "100%",
                    borderRadius: "inherit",
                    bgcolor: category.tone,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: "1px solid var(--pub-hair)",
            color: "var(--pub-quiet)",
          }}
        >
          <FiClock size={13} />
          <Typography sx={{ fontSize: 11 }}>
            Illustrative monthly breakdown
          </Typography>
        </Stack>
      </Box>
    </Box>
  </Box>
);

/* ── 2. Budgets, on the lavender band ── */
const BudgetChapter = () => (
  <Box
    sx={{
      bgcolor: "var(--pub-lavender-soft)",
      borderTop: "1px solid var(--pub-hair)",
      borderBottom: "1px solid var(--pub-hair)",
      px: "var(--pub-gutter)",
      py: { xs: 7, md: 10 },
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.04fr 0.96fr" },
        columnGap: { lg: 8 },
        rowGap: 5,
        alignItems: "center",
      }}
    >
      <Box sx={{ order: { xs: 2, lg: 1 } }}>
        <Stack spacing={1.75}>
          {BUDGETS.map((budget) => (
            <Box
              key={budget.name}
              sx={{
                bgcolor: "var(--pub-surface)",
                border: "1px solid var(--pub-hair)",
                borderRadius: "16px",
                p: 2.25,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {budget.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: budget.over ? "var(--pub-negative)" : "var(--pub-positive)",
                  }}
                >
                  {budget.note}
                </Typography>
              </Stack>
              <Box
                sx={{
                  mt: 1.5,
                  height: 7,
                  borderRadius: 99,
                  bgcolor: "var(--pub-lavender)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${budget.pct}%`,
                    height: "100%",
                    borderRadius: "inherit",
                    bgcolor: budget.over ? "var(--pub-negative)" : "var(--pub-accent)",
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 11.5, color: "var(--pub-quiet)" }}>
                  {budget.spent} spent
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: "var(--pub-quiet)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  of {budget.limit}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Typography sx={{ mt: 1.5, fontSize: 10.5, color: "var(--pub-quiet)" }}>
          Illustrative budgets
        </Typography>
      </Box>

      <Box sx={{ order: { xs: 1, lg: 2 } }}>
        <Eyebrow>Budgets</Eyebrow>
        <SectionHeading>Know what is left, not just what you spent.</SectionHeading>
        <Body>
          Set a monthly limit for each category. FinTrack compares recorded
          spending against the limit and states the remainder, or the amount
          you have gone over, on the same row.
        </Body>
        <Box sx={{ mt: 2.5 }}>
          <CheckLine>Monthly limits per category</CheckLine>
          <CheckLine>Progress and over-budget states, stated in rupees</CheckLine>
          <CheckLine>Planning view for the month ahead</CheckLine>
        </Box>
      </Box>
    </Box>
  </Box>
);

/* ── 3. Forecast ── */
const ForecastChapter = () => (
  <Box
    component="section"
    id="forecast"
    sx={{ bgcolor: "var(--pub-surface)", px: "var(--pub-gutter)", py: { xs: 7, md: 10 } }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "0.94fr 1.06fr" },
        columnGap: { lg: 8 },
        rowGap: 5,
        alignItems: "center",
      }}
    >
      <Box>
        <Eyebrow>Forecasting &amp; intelligence</Eyebrow>
        <SectionHeading>Projection from the record, not a hunch.</SectionHeading>
        <Body>
          The forecast extends your recorded activity and the bills you have
          already scheduled across the rest of the month. Recorded and
          projected values are drawn differently, so you can see where the
          evidence stops.
        </Body>
        <Box sx={{ mt: 2.5 }}>
          <CheckLine>Builds on your transactions and scheduled bills</CheckLine>
          <CheckLine>Actual and projected values kept distinct</CheckLine>
          <CheckLine>Analysis saved to your insights history</CheckLine>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: "var(--pub-bg)",
          border: "1px solid var(--pub-hair)",
          borderRadius: "16px",
          p: { xs: 2.25, sm: 3 },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.02rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Balance, 30 days
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "var(--pub-quiet)", mt: 0.25 }}>
              Recorded to 18 June, projected after
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            {[
              { label: "Recorded", color: "var(--pub-accent)", dashed: false },
              { label: "Projected", color: "var(--pub-quiet)", dashed: true },
            ].map((legend) => (
              <Stack key={legend.label} direction="row" spacing={0.6} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 0,
                    borderTop: "2px solid",
                    borderTopColor: legend.color,
                    borderTopStyle: legend.dashed ? "dashed" : "solid",
                  }}
                />
                <Typography sx={{ fontSize: 10.5, color: "var(--pub-quiet)" }}>
                  {legend.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Box
          component="svg"
          viewBox="0 0 400 150"
          preserveAspectRatio="none"
          role="img"
          aria-label="Illustrative balance line: recorded movement to mid-month, projected to month end"
          sx={{ display: "block", width: "100%", height: { xs: 160, sm: 190 }, mt: 2 }}
        >
          <defs>
            <linearGradient id="forecast-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[30, 70, 110].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke="var(--pub-hair)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d="M0 112 L48 104 L96 108 L144 84 L192 90 L240 66 L240 150 L0 150 Z"
            fill="url(#forecast-fill)"
          />
          <path
            d="M0 112 L48 104 L96 108 L144 84 L192 90 L240 66"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M240 66 L288 58 L336 44 L400 30"
            fill="none"
            stroke="#8a8a99"
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="240" cy="66" r="4" fill="#6366f1" />
        </Box>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: 0.5, color: "var(--pub-quiet)" }}
        >
          {["1 Jun", "18 Jun", "30 Jun"].map((label) => (
            <Typography key={label} sx={{ fontSize: 10.5 }}>
              {label}
            </Typography>
          ))}
        </Stack>
        <Typography sx={{ mt: 1.25, fontSize: 10.5, color: "var(--pub-quiet)" }}>
          Illustrative series
        </Typography>
      </Box>
    </Box>
  </Box>
);

/* ── 4. Reports, recurring activity, buying decisions ── */
const REPORT_LINES = [
  { icon: <FiFileText size={16} />, label: "Financial report", detail: "Downloaded as a PDF, generated when you ask for it." },
  { icon: <FiClock size={16} />, label: "Recurring activity", detail: "Frequency, next occurrence and amount on one line." },
  { icon: <FiArrowUpRight size={16} />, label: "Purchase intelligence", detail: "Compare planned purchases against what the month allows." },
];

const RecordsChapter = () => (
  <Box
    sx={{
      bgcolor: "var(--pub-bg)",
      borderTop: "1px solid var(--pub-hair)",
      px: "var(--pub-gutter)",
      py: { xs: 7, md: 9 },
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "0.8fr 1.2fr" },
        columnGap: { lg: 8 },
        rowGap: 4,
      }}
    >
      <Box>
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.7rem", md: "2.05rem" },
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
          }}
        >
          The month also leaves a record.
        </Typography>
        <Typography
          sx={{ mt: 1.75, fontSize: 14, lineHeight: 1.7, color: "var(--pub-muted)", maxWidth: 340 }}
        >
          Reports, scheduled activity and purchase decisions sit alongside the
          ledger, so the same figures answer every question.
        </Typography>
      </Box>

      <Box>
        {REPORT_LINES.map((line) => (
          <Stack
            key={line.label}
            direction="row"
            spacing={2}
            sx={{
              py: 2.25,
              borderTop: "1px solid var(--pub-hair)",
              "&:last-of-type": { borderBottom: "1px solid var(--pub-hair)" },
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "11px",
                bgcolor: "var(--pub-surface)",
                border: "1px solid var(--pub-hair)",
                color: "var(--pub-accent)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {line.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{line.label}</Typography>
              <Typography sx={{ mt: 0.4, fontSize: 12.5, lineHeight: 1.6, color: "var(--pub-muted)" }}>
                {line.detail}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>
    </Box>
  </Box>
);

export const FeatureSections = () => (
  <Box component="div" id="features">
    <ExpenseChapter />
    <BudgetChapter />
    <ForecastChapter />
    <RecordsChapter />
  </Box>
);
