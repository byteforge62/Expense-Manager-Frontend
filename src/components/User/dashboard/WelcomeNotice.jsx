import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FiPlus, FiX, FiZap } from "react-icons/fi";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { selectCurrentUser, selectUserId } from "../../../store/slices/authSlice";
import {
  fetchExpenses,
  selectAllExpenses,
  selectExpensesStatus,
} from "../../../store/slices/expensesSlice";
import { fetchIncomes } from "../../../store/slices/incomeSlice";
import { fetchBudgets } from "../../../store/slices/budgetSlice";
import { seedDemoData } from "../../../store/slices/demoSlice";

/**
 * --- WELCOME NOTE ---
 * A first-visit note set into the page's left margin, not a dashboard card.
 * It only appears after the expense read has succeeded and come back empty, so
 * a returning account never sees it. Two useful next steps: add a real
 * expense, or fill the account with demo data and look around first.
 */
export const WelcomeNotice = ({ onSeeded }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const userId = useAppSelector(selectUserId);
  const expenses = useAppSelector(selectAllExpenses);
  const expensesStatus = useAppSelector(selectExpensesStatus);

  const [dismissed, setDismissed] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Wait for the real read before claiming the ledger is empty.
  if (dismissed || expensesStatus !== "succeeded" || expenses.length > 0) {
    return null;
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const result = await dispatch(seedDemoData()).unwrap();

      if (!result?.seeded) {
        toast.info(
          "This account already has records, so demo data was not added.",
        );
        return;
      }

      await Promise.all([
        dispatch(fetchExpenses({ userId, force: true })),
        dispatch(fetchIncomes(userId)),
        dispatch(fetchBudgets(userId)),
      ]);

      onSeeded?.();
      toast.success("Demo data added. Explore your expenses, budgets and insights.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Demo data could not be added.",
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        position: "relative",
        border: 1,
        borderColor: "divider",
        borderLeft: "3px solid",
        borderLeftColor: "primary.main",
        borderRadius: "10px",
        bgcolor: "background.paper",
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2, sm: 2.25 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
        gap: 2,
        alignItems: { md: "center" },
      }}
    >
      <Box sx={{ minWidth: 0, pr: { md: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "0.98rem",
              fontWeight: 700,
              letterSpacing: "-0.015em",
            }}
          >
            Welcome to FinTrack, {firstName}
          </Typography>
          <IconButton
            size="small"
            aria-label="Dismiss welcome note"
            onClick={() => setDismissed(true)}
            sx={{ mt: -0.5, mr: -0.75, display: { md: "none" } }}
          >
            <FiX size={15} />
          </IconButton>
        </Stack>

        <Typography
          sx={{ mt: 0.4, fontSize: 12.5, lineHeight: 1.65, color: "text.secondary" }}
        >
          You have not added an expense yet. Add your first one to see your
          budget, insights and forecast come alive, or load a ready-made demo
          ledger and look around first.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row", md: "column", lg: "row" }}
        spacing={1}
        sx={{ alignItems: { sm: "center", md: "stretch", lg: "center" } }}
      >
        <Button
          component={RouterLink}
          to="/private/expenses?action=add"
          size="small"
          variant="contained"
          startIcon={<FiPlus size={14} />}
          sx={{ textTransform: "none", fontWeight: 600, minHeight: 34 }}
        >
          Add your first expense
        </Button>

        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={handleSeed}
          disabled={seeding}
          startIcon={
            seeding ? (
              <CircularProgress size={13} sx={{ color: "inherit" }} />
            ) : (
              <FiZap size={14} />
            )
          }
          sx={{
            textTransform: "none",
            fontWeight: 600,
            minHeight: 34,
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          {seeding ? "Preparing demo…" : "Explore with demo data"}
        </Button>

        <IconButton
          size="small"
          aria-label="Dismiss welcome note"
          onClick={() => setDismissed(true)}
          sx={{ display: { xs: "none", md: "inline-flex" }, alignSelf: "center" }}
        >
          <FiX size={15} />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export default WelcomeNotice;
