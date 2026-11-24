import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FiPlus, FiZap } from "react-icons/fi";
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
 * --- WELCOME NOTICE ---
 * The small greeting a new account sees on its first dashboard visit.
 *
 * It only appears once the expense read has finished and come back empty, so a
 * returning user never sees it. It offers the two useful next steps: add a real
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
    <Alert
      severity="info"
      onClose={() => setDismissed(true)}
      sx={{
        alignItems: "flex-start",
        borderRadius: "12px",
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        "& .MuiAlert-message": { width: "100%" },
      }}
    >
      <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
        Welcome to FinTrack, {firstName}
      </AlertTitle>

      <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: "text.secondary" }}>
        You have not added an expense yet. Add your first one to see your budget,
        insights and forecast come alive — or load a ready-made demo ledger and
        look around first.
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mt: 1.75 }}
      >
        <Box>
          <Button
            component={RouterLink}
            to="/private/expenses?action=add"
            size="small"
            variant="contained"
            startIcon={<FiPlus size={15} />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Add your first expense
          </Button>
        </Box>

        <Box>
          <Button
            type="button"
            size="small"
            variant="outlined"
            onClick={handleSeed}
            disabled={seeding}
            startIcon={
              seeding ? (
                <CircularProgress size={14} sx={{ color: "inherit" }} />
              ) : (
                <FiZap size={15} />
              )
            }
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {seeding ? "Preparing demo…" : "Explore with demo data"}
          </Button>
        </Box>
      </Stack>
    </Alert>
  );
};

export default WelcomeNotice;
