import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  createExpense,
  fetchExpenses,
  fetchRecentExpenses,
  removeExpense,
  selectAllExpenses,
  selectAverageExpense,
  selectCategoryBreakdown,
  selectMonthlyTrend,
  selectRecentExpenses,
  selectThisMonthTotal,
  selectTopCategory,
  selectExpenseTotal,
} from "../../../store/slices/expensesSlice";
import {
  fetchCategories,
  selectAllCategories,
} from "../../../store/slices/categorySlice";

import ExpenseHeader from "./expense/ExpenseHeader";
import ExpenseStatCards from "./expense/ExpenseStatCards";
import RecentExpensesPanel from "./expense/RecentExpensesPanel";
import { MonthlyTrendCard, CategoryMixCard } from "./expense/ExpenseAnalyticsTab";
import ExpenseRecordsTab from "./expense/ExpenseRecordsTab";
import AddExpenseDialog from "./expense/AddExpenseDialog";

/**
 * --- EXPENSE CENTER ---
 * One screen: the spend statement, the trend, the category mix, recent
 * activity and the filterable ledger all render together. There is no tab
 * switching and no duplicated summary — the ledger is the only full list.
 *
 * State split (important for render cost):
 * - Redux owns the ledger, the recent list, status flags and every derived
 *   figure. Those selectors are memoized, so unrelated updates do not
 *   recompute totals or charts.
 * - Local state owns only what this screen cares about: the dialog, the submit
 *   lock and the filter inputs.
 */

const EMPTY_FILTERS = {
  startDate: "",
  endDate: "",
  categoryID: "",
  minAmount: "",
  maxAmount: "",
  datePreset: "all",
};

// --- MAIN COMPONENT ---
export const UserExpenses = () => {
  const dispatch = useAppDispatch();

  // One primitive each: this component no longer re-renders when unrelated
  // fields of the auth/category slices change.
  const userId = useAppSelector((state) => state.auth.user?._id);
  const categories = useAppSelector(selectAllCategories);

  const expenses = useAppSelector(selectAllExpenses);
  const recentExpenses = useAppSelector(selectRecentExpenses);

  const totalExpenses = useAppSelector(selectExpenseTotal);
  const thisMonthTotal = useAppSelector(selectThisMonthTotal);
  const avgExpense = useAppSelector(selectAverageExpense);
  const topCategory = useAppSelector(selectTopCategory);
  const chartData = useAppSelector(selectMonthlyTrend);
  const categoryBreakdown = useAppSelector(selectCategoryBreakdown);

  // --- UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Dashboard quick action: /private/expenses?action=add opens the dialog.
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") !== "add") return;

    setIsModalOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("action");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // --- ACTIONS & HANDLERS ---

  // Handle dynamic filtering for the expense ledger
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    let newFilters = { ...filters, [name]: value };

    if (name === "datePreset") {
      const now = new Date();
      let start = "";
      let end = "";

      if (value === "thisMonth") {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];
      } else if (value === "last3Months") {
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          .toISOString()
          .split("T")[0];
        end = now.toISOString().split("T")[0];
      }

      newFilters = { ...newFilters, startDate: start, endDate: end };
    }

    setFilters(newFilters);
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  // Handle new expense submission
  const SubmitHandler = async (data) => {
    try {
      setIsSubmitting(true);
      await dispatch(
        createExpense({
          categoryID: data.categoryID,
          amount: Number(data.amount),
          date: data.date,
          description: data.description,
        }),
      ).unwrap();
      reset({ userID: userId });
      setIsModalOpen(false);
      // Server truth wins: the ledger refetch populates category names.
      dispatch(fetchRecentExpenses(userId));
      dispatch(fetchExpenses({ userId, filters, force: true }));
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove an expense record from the history
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense permanently?")) return;
    try {
      await dispatch(removeExpense(id)).unwrap();
      dispatch(fetchExpenses({ userId, filters, force: true }));
      dispatch(fetchRecentExpenses(userId));
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  // --- LIFECYCLE ---
  // Reference data loads once per user; it does not depend on the filters.
  useEffect(() => {
    if (!userId) return;
    setValue("userID", userId);
    dispatch(fetchCategories());
    dispatch(fetchRecentExpenses(userId));
  }, [dispatch, userId, setValue]);

  // Only the ledger read follows the filter inputs.
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchExpenses({ userId, filters }));
  }, [dispatch, userId, filters]);

  return (
    <div className="space-y-2.5 text-[var(--text-primary)]">
      <ExpenseHeader onAdd={() => setIsModalOpen(true)} />

      <ExpenseStatCards
        totalExpenses={totalExpenses}
        thisMonthTotal={thisMonthTotal}
        avgExpense={avgExpense}
        topCategory={topCategory}
      />

      <div className="grid items-start gap-2.5 xl:grid-cols-12">
        {/* ── Trend and ledger ── */}
        <div className="min-w-0 space-y-2.5 xl:col-span-7">
          <MonthlyTrendCard chartData={chartData} />

          <ExpenseRecordsTab
            filters={filters}
            categories={categories}
            expenses={expenses}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onAdd={() => setIsModalOpen(true)}
            onDelete={deleteExpense}
          />
        </div>

        {/* ── Category mix and recent activity ── */}
        <div className="min-w-0 space-y-2.5 xl:col-span-5">
          <CategoryMixCard categoryBreakdown={categoryBreakdown} />

          <RecentExpensesPanel
            recentExpenses={recentExpenses}
            onAdd={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      <AddExpenseDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        register={register}
        errors={errors}
        onSubmit={handleSubmit(SubmitHandler)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UserExpenses;
