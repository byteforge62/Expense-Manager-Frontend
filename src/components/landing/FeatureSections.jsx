import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiCheck,
  FiClock,
  FiFileText,
  FiHome,
  FiShoppingCart,
  FiTruck,
  FiTarget,
  FiZap,
  FiTrendingUp,
  FiShoppingBag,
  FiActivity,
  FiArrowDownRight,
} from "react-icons/fi";

const CATEGORIES = [
  { name: "Housing", amount: "₹18,000", pct: 84, icon: FiHome },
  { name: "Groceries", amount: "₹6,480", pct: 46, icon: FiShoppingCart },
  { name: "Transport", amount: "₹2,250", pct: 26, icon: FiTruck },
  { name: "Utilities", amount: "₹1,940", pct: 20, icon: FiZap },
];

const BUDGETS = [
  {
    name: "Groceries",
    spent: "₹8,800",
    limit: "₹12,000",
    pct: 73,
    note: "₹3,200 remaining",
    icon: FiShoppingCart,
    over: false,
  },
  {
    name: "Transport",
    spent: "₹3,150",
    limit: "₹2,000",
    pct: 100,
    note: "₹1,150 over budget",
    icon: FiTruck,
    over: true,
  },
  {
    name: "Eating out",
    spent: "₹2,400",
    limit: "₹6,000",
    pct: 40,
    note: "₹3,600 remaining",
    icon: FiShoppingBag,
    over: false,
  },
];

const Eyebrow = ({ children }) => (
  <Typography
    sx={{
      fontSize: 12.5,
      fontWeight: 600,
      letterSpacing: "0.005em",
      color: "var(--pub-accent)",
    }}
  >
    {children}
  </Typography>
);

const SectionHeading = ({ children }) => (
  <Typography
    component="h2"
    sx={{
      mt: 2,
      fontFamily: "var(--font-display)",
      fontSize: { xs: "1.9rem", sm: "2.4rem", md: "3rem" },
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: "-0.045em",
      textWrap: "balance",
      maxWidth: 490,
      color: "var(--pub-fg)",
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
      lineHeight: 1.8,
      color: "var(--pub-muted)",
    }}
  >
    {children}
  </Typography>
);

const CheckLine = ({ children }) => (
  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ py: 0.85 }}>
    <FiCheck color="var(--pub-accent)" size={14} />
    <Typography
      sx={{ fontSize: 13, lineHeight: 1.6, color: "var(--pub-muted)" }}
    >
      {children}
    </Typography>
  </Stack>
);

const ChapterLayout = ({
  children,
  reverse = false,
  bg = "var(--pub-surface)",
}) => (
  <Box
    component="section"
    sx={{
      bgcolor: bg,
      px: "var(--pub-gutter)",
      py: { xs: 7, md: 11 },
      borderTop: "1px solid var(--pub-hair)",
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: { xs: 5, md: 8, lg: 10 },
        alignItems: "center",
        "& > :first-of-type": {
          order: { xs: 1, lg: reverse ? 2 : 1 },
        },
        "& > :last-of-type": {
          order: { xs: 2, lg: reverse ? 1 : 2 },
        },
      }}
    >
      {children}
    </Box>
  </Box>
);

/* ---------------------------------------------------------
   01 — EXPENSE TRACKING
   Editorial ledger / no individual cards
--------------------------------------------------------- */

const ExpenseVisual = () => (
  <Box sx={{ position: "relative", pl: { xs: 0, sm: 1 } }}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        pb: 2,
        borderBottom: "1px solid var(--pub-hair)",
      }}
    >
      <Eyebrow>Example ledger</Eyebrow>
      <Typography sx={{ fontSize: 11, color: "var(--pub-quiet)" }}>
        June · 2026
      </Typography>
    </Stack>

    <Typography
      sx={{
        mt: 2.5,
        fontFamily: "var(--font-display)",
        fontSize: { xs: "2.7rem", sm: "3.6rem" },
        fontWeight: 700,
        letterSpacing: "-0.06em",
        lineHeight: 1,
        color: "var(--pub-fg)",
      }}
    >
      ₹28,670
    </Typography>

    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mt: 1 }}>
      <FiArrowDownRight color="var(--pub-accent)" size={14} />
      <Typography sx={{ fontSize: 12, color: "var(--pub-muted)" }}>
        Spending recorded this month
      </Typography>
    </Stack>

    <Box sx={{ mt: 3.5 }}>
      {CATEGORIES.map((category, index) => {
        const Icon = category.icon;

        return (
          <Box
            key={category.name}
            sx={{
              display: "grid",
              gridTemplateColumns: "32px 1fr auto",
              alignItems: "center",
              gap: 1.5,
              py: 1.65,
              borderTop: "1px solid var(--pub-hair)",
            }}
          >
            <Box sx={{ color: "var(--pub-accent)", display: "flex" }}>
              <Icon size={17} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: "var(--pub-fg)" }}
              >
                {category.name}
              </Typography>

              <Box
                sx={{
                  mt: 0.8,
                  height: 3,
                  width: "100%",
                  bgcolor: "var(--pub-lavender)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${category.pct}%`,
                    height: "100%",
                    bgcolor:
                      index === 2 ? "var(--pub-negative)" : "var(--pub-accent)",
                    borderRadius: 99,
                  }}
                />
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--pub-fg)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {category.amount}
            </Typography>
          </Box>
        );
      })}
    </Box>

    <Box
      sx={{
        mt: 1,
        pt: 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderTop: "1px solid var(--pub-hair)",
      }}
    >
      <FiActivity size={14} color="var(--pub-accent)" />
      <Typography sx={{ fontSize: 11.5, color: "var(--pub-quiet)" }}>
        Every entry contributes to your financial picture.
      </Typography>
    </Box>
  </Box>
);

const ExpenseChapter = () => (
  <ChapterLayout bg="var(--pub-surface)">
    <Box>
      <Eyebrow>01 / Expense tracking</Eyebrow>

      <SectionHeading>
        Every expense has a place. Nothing gets lost.
      </SectionHeading>

      <Body>
        Record what you spend against a category, date and amount. Your
        transactions become a structured record that feeds your breakdowns,
        totals and financial insights.
      </Body>

      <Box sx={{ mt: 2.5 }}>
        <CheckLine>Categories you define and manage yourself</CheckLine>
        <CheckLine>Filter records by category, date and amount</CheckLine>
        <CheckLine>Entries remain organized in one ledger</CheckLine>
      </Box>
    </Box>

    <ExpenseVisual />
  </ChapterLayout>
);

/* ---------------------------------------------------------
   02 — BUDGETS
   Continuous visual budget scale / no budget cards
--------------------------------------------------------- */

const BudgetVisual = () => (
  <Box sx={{ py: { xs: 1, sm: 2 } }}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 3 }}
    >
      <Eyebrow>Example allocations</Eyebrow>
      <Typography sx={{ fontSize: 11, color: "var(--pub-quiet)" }}>
        June overview
      </Typography>
    </Stack>

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.6,
        mb: 3.5,
      }}
    >
      {BUDGETS.map((budget) => (
        <Box
          key={budget.name}
          sx={{
            height: 9,
            flex: budget.pct,
            borderRadius: 99,
            bgcolor: budget.over ? "var(--pub-negative)" : "var(--pub-accent)",
            opacity: budget.over ? 0.9 : 1,
          }}
        />
      ))}
    </Box>

    {BUDGETS.map((budget) => {
      const Icon = budget.icon;
      const remaining = budget.over ? budget.note : budget.note;

      return (
        <Box
          key={budget.name}
          sx={{
            py: 2.5,
            borderTop: "1px solid var(--pub-hair)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.4}>
            <Icon size={17} color="var(--pub-accent)" />

            <Typography
              sx={{
                flex: 1,
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--pub-fg)",
              }}
            >
              {budget.name}
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color: budget.over ? "var(--pub-negative)" : "var(--pub-muted)",
                fontWeight: 600,
              }}
            >
              {remaining}
            </Typography>
          </Stack>

          <Box sx={{ pl: 3.2, mt: 1.4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{ mb: 0.8 }}
            >
              <Typography sx={{ fontSize: 11.5, color: "var(--pub-muted)" }}>
                {budget.spent} spent
              </Typography>

              <Typography sx={{ fontSize: 11.5, color: "var(--pub-quiet)" }}>
                Limit {budget.limit}
              </Typography>
            </Stack>

            <Box
              sx={{
                height: 5,
                borderRadius: 99,
                bgcolor: "var(--pub-lavender)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${budget.pct}%`,
                  height: "100%",
                  bgcolor: budget.over
                    ? "var(--pub-negative)"
                    : "var(--pub-accent)",
                  borderRadius: 99,
                }}
              />
            </Box>

            <Typography
              sx={{
                mt: 0.7,
                fontSize: 10.5,
                color: budget.over ? "var(--pub-negative)" : "var(--pub-quiet)",
              }}
            >
              {budget.over ? "Limit exceeded" : `${budget.pct}% of budget used`}
            </Typography>
          </Box>
        </Box>
      );
    })}

    <Box
      sx={{
        mt: 1,
        pt: 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderTop: "1px solid var(--pub-hair)",
      }}
    >
      <FiTarget size={14} color="var(--pub-accent)" />
      <Typography sx={{ fontSize: 11.5, color: "var(--pub-quiet)" }}>
        Plan limits before spending gets ahead.
      </Typography>
    </Box>
  </Box>
);

const BudgetChapter = () => (
  <ChapterLayout reverse bg="var(--pub-lavender-soft)">
    <Box>
      <Eyebrow>02 / Budgets</Eyebrow>

      <SectionHeading>Know what is left. Before you spend it.</SectionHeading>

      <Body>
        Set a monthly limit for each category. FinTrack tracks the distance
        between your spending and your plan, making it easier to spot where you
        have room and where you need to slow down.
      </Body>

      <Box sx={{ mt: 2.5 }}>
        <CheckLine>Monthly limits for individual categories</CheckLine>
        <CheckLine>Remaining amounts and overspending at a glance</CheckLine>
        <CheckLine>A clearer picture of where your money is going</CheckLine>
      </Box>
    </Box>

    <BudgetVisual />
  </ChapterLayout>
);

/* ---------------------------------------------------------
   03 — FORECAST
   Large graph / editorial annotations
--------------------------------------------------------- */

const FORECAST_INPUTS = [
  {
    number: 1,
    label: "Recorded entries",
    detail: "The income and expenses you have already logged this month.",
  },
  {
    number: 2,
    label: "Scheduled bills",
    detail: "Recurring amounts still due before the month closes.",
  },
  {
    number: 3,
    label: "Days remaining",
    detail: "Your recorded daily pace, carried to the end of the month.",
  },
];

const ForecastVisual = () => (
  <Box sx={{ width: "100%" }}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="baseline"
      sx={{ pb: 1.5, borderBottom: "1px solid var(--pub-hair)" }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: { xs: "1.1rem", sm: "1.24rem" },
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: "var(--pub-fg)",
        }}
      >
        How the projection is built
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: "var(--pub-quiet)" }}>
        Example
      </Typography>
    </Stack>

    {FORECAST_INPUTS.map((input) => (
      <Box
        key={input.label}
        sx={{
          display: "grid",
          gridTemplateColumns: "24px 1fr",
          columnGap: 2,
          py: 2.25,
          borderBottom: "1px solid var(--pub-hair)",
        }}
      >
        <Typography
          sx={{
            fontSize: 11.5,
            color: "var(--pub-quiet)",
            fontVariantNumeric: "tabular-nums",
            pt: 0.25,
          }}
        >
          {String(input.number).padStart(2, "0")}
        </Typography>

        <Box>
          <Typography
            sx={{ fontSize: 13.5, fontWeight: 600, color: "var(--pub-fg)" }}
          >
            {input.label}
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 12.5,
              lineHeight: 1.65,
              color: "var(--pub-muted)",
            }}
          >
            {input.detail}
          </Typography>
        </Box>
      </Box>
    ))}

    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ pt: 2.5 }}>
      <Box sx={{ color: "var(--pub-accent)", display: "flex", pt: 0.25 }}>
        <FiTrendingUp size={16} />
      </Box>

      <Typography
        sx={{ fontSize: 12, lineHeight: 1.7, color: "var(--pub-muted)" }}
      >
        The projection line starts after your last recorded entry. Actual
        amounts and estimates stay visually distinct, so you can always tell
        which is which.
      </Typography>
    </Stack>
  </Box>
);

const ForecastChapter = () => (
  <ChapterLayout bg="var(--pub-surface)">
    <Box>
      <Eyebrow>03 / Forecasting & intelligence</Eyebrow>

      <SectionHeading>
        A projection built on your record. Not a hunch.
      </SectionHeading>

      <Body>
        Extend your recorded activity and scheduled bills across the remainder
        of the month. See where the current trajectory is heading without
        confusing estimates with actual transactions.
      </Body>

      <Box sx={{ mt: 2.5 }}>
        <CheckLine>Uses recorded transactions and scheduled bills</CheckLine>
        <CheckLine>Actual and projected values stay distinct</CheckLine>
        <CheckLine>Analysis retained in your insights history</CheckLine>
      </Box>
    </Box>

    <ForecastVisual />
  </ChapterLayout>
);

/* ---------------------------------------------------------
   04 — REPORTS
   Editorial index / icons integrated into rows
--------------------------------------------------------- */

const REPORT_LINES = [
  {
    icon: FiFileText,
    number: "01",
    label: "Financial reports",
    detail: "Generate and download a PDF of your financial activity.",
  },
  {
    icon: FiClock,
    number: "02",
    label: "Recurring activity",
    detail: "Keep track of frequency, next occurrence and amount.",
  },
  {
    icon: FiShoppingBag,
    number: "03",
    label: "Purchase intelligence",
    detail: "Evaluate planned purchases against your monthly budget.",
  },
];

const RecordsChapter = () => (
  <Box
    component="section"
    sx={{
      bgcolor: "var(--pub-bg)",
      px: "var(--pub-gutter)",
      py: { xs: 7, md: 10 },
      borderTop: "1px solid var(--pub-hair)",
      borderBottom: "1px solid var(--pub-hair)",
    }}
  >
    <Box
      sx={{
        maxWidth: "var(--pub-max)",
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "0.85fr 1.15fr" },
        gap: { xs: 4, md: 8, lg: 10 },
        alignItems: "start",
      }}
    >
      <Box>
        <Eyebrow>04 / Beyond the ledger</Eyebrow>

        <Typography
          component="h2"
          sx={{
            mt: 2,
            fontFamily: "var(--font-display)",
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3.1rem" },
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.045em",
            color: "var(--pub-fg)",
            maxWidth: 430,
          }}
        >
          Your financial activity leaves a useful record.
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontSize: 14,
            lineHeight: 1.8,
            color: "var(--pub-muted)",
            maxWidth: 380,
          }}
        >
          Reports, scheduled activity and purchase decisions sit alongside the
          ledger. One record, more ways to understand it.
        </Typography>
      </Box>

      <Box>
        {REPORT_LINES.map((line, index) => {
          const Icon = line.icon;

          return (
            <Box
              key={line.label}
              sx={{
                py: { xs: 2.25, sm: 3 },
                borderTop: "1px solid var(--pub-hair)",
                ...(index === REPORT_LINES.length - 1
                  ? { borderBottom: "1px solid var(--pub-hair)" }
                  : {}),
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: 11,
                    color: "var(--pub-quiet)",
                    minWidth: 22,
                  }}
                >
                  {line.number}
                </Typography>

                <Icon size={18} color="var(--pub-accent)" />

                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: "var(--font-display)",
                    fontSize: { xs: 15, sm: 17 },
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: "var(--pub-fg)",
                  }}
                >
                  {line.label}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  pl: { xs: 4.5, sm: 5 },
                  mt: 1,
                  fontSize: 12.5,
                  lineHeight: 1.7,
                  color: "var(--pub-muted)",
                }}
              >
                {line.detail}
              </Typography>
            </Box>
          );
        })}
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
