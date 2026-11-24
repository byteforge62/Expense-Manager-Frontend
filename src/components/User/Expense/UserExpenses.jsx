import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { FiList, FiBarChart2, FiAlignLeft } from "react-icons/fi";

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
import ExpenseAnalyticsTab from "./expense/ExpenseAnalyticsTab";
import ExpenseRecordsTab from "./expense/ExpenseRecordsTab";
import AddExpenseDialog from "./expense/AddExpenseDialog";

/**
 * --- EXPENSE CENTER ---
 * The primary dashboard for tracking outgoing capital and analyzing spending habits.
 * Features: Recent Activity, Deep Analytics, and a Filterable Ledger.
 *
 * State split (important for render cost):
 * - Redux owns the ledger, the recent list, status flags and every derived
 *   figure. Those selectors are memoized, so unrelated updates do not
 *   recompute totals or charts.
 * - Local state owns everything only this screen cares about: the active tab,
 *   the dialog, the submit lock and the filter inputs. None of that belongs in
 *   a global store.
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
  const [activeTab, setActiveTab] = useState("overview");
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

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiAlignLeft size={14} /> },
    { id: "analytics", label: "Analytics", icon: <FiBarChart2 size={14} /> },
    { id: "records", label: "Records", icon: <FiList size={14} /> },
  ];

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      <ExpenseHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        onAdd={() => setIsModalOpen(true)}
      >
        <ExpenseStatCards
          totalExpenses={totalExpenses}
          thisMonthTotal={thisMonthTotal}
          avgExpense={avgExpense}
          topCategory={topCategory}
        />
      </ExpenseHeader>

      {/* ── TAB PANELS ── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <RecentExpensesPanel
            key="overview"
            recentExpenses={recentExpenses}
            onAdd={() => setIsModalOpen(true)}
          />
        )}

        {activeTab === "analytics" && (
          <ExpenseAnalyticsTab
            key="analytics"
            chartData={chartData}
            categoryBreakdown={categoryBreakdown}
          />
        )}

        {activeTab === "records" && (
          <ExpenseRecordsTab
            key="records"
            filters={filters}
            categories={categories}
            expenses={expenses}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onAdd={() => setIsModalOpen(true)}
            onDelete={deleteExpense}
          />
        )}
      </AnimatePresence>

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
