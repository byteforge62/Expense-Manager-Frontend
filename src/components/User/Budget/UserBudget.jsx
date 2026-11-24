import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  createBudget,
  fetchBudgetPlan,
  fetchBudgets,
  removeBudget,
  selectAllBudgets,
  selectBudgetPlan,
  selectBudgetSummary,
  selectBudgetTotals,
} from "../../../store/slices/budgetSlice";
import {
  fetchCategories,
  selectAllCategories,
} from "../../../store/slices/categorySlice";
import { fetchExpenses } from "../../../store/slices/expensesSlice";
import { FiGrid, FiPieChart, FiCpu, FiSettings } from "react-icons/fi";

import { Shimmer } from "./budget/budgetUi";
import BudgetHeader from "./budget/BudgetHeader";
import BudgetStatCards from "./budget/BudgetStatCards";
import OverviewTab from "./budget/OverviewTab";
import AnalyticsTab from "./budget/AnalyticsTab";
import AIPlannerTab from "./budget/AIPlannerTab";
import ManageTab from "./budget/ManageTab";
import AddBudgetDialog from "./budget/AddBudgetDialog";
import ConfirmDeleteDialog from "./budget/ConfirmDeleteDialog";

/**
 * --- BUDGET CENTER ---
 * The central command for financial planning and allocation.
 * Features: Overview, AI-driven Planning, Analytics, and Budget Management.
 */

// --- MAIN COMPONENT ---
export const UserBudget = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?._id ?? null);
  const budgets = useAppSelector(selectAllBudgets);
  const summary = useAppSelector(selectBudgetSummary);
  const totals = useAppSelector(selectBudgetTotals);
  const categories = useAppSelector(selectAllCategories);
  const budgetPlan = useAppSelector(selectBudgetPlan);

  // Dashboard quick action: /private/budget?action=add opens the dialog.
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") !== "add") return;

    setIsModalOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("action");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newBudget, setNewBudget] = useState({
    categoryID: "",
    amount: "",
    description: "",
  });

  // --- ACTIONS & HANDLERS ---

  // Generate an AI-optimized budget plan based on historical data
  const handleGeneratePlan = async () => {
    try {
      setLoadingPlan(true);
      await dispatch(fetchBudgetPlan(userId));
    } finally {
      setLoadingPlan(false);
    }
  };

  // Persist a new budget limit to the database
  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!userId) return;
    try {
      setIsSubmitting(true);
      await dispatch(
        createBudget({
          categoryID: newBudget.categoryID,
          amount: Number(newBudget.amount),
          description: newBudget.description,
        }),
      ).unwrap();
      setIsModalOpen(false);
      setNewBudget({ categoryID: "", amount: "", description: "" });
      // Refetch so the new row carries its populated category.
      dispatch(fetchBudgets(userId));
    } catch (error) {
      console.error("Add budget error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove a budget limit from the registry
  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;
    try {
      setIsDeleting(true);
      await dispatch(removeBudget(selectedBudget._id)).unwrap();
      setConfirmDeleteOpen(false);
      setSelectedBudget(null);
      dispatch(fetchBudgets(userId));
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- LIFECYCLE ---
  // Budgets and expenses are separate reads with one owner each; the summary
  // is derived from both, so neither page stores its own copy of expenses.
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchCategories());
    dispatch(fetchBudgets(userId));
    dispatch(fetchExpenses({ userId }));
  }, [dispatch, userId]);

  // --- ANALYTICS DERIVATION ---
  // One memoized pass in the store; nothing is recomputed per render.
  const totalAllocated = totals.allocated;
  const totalSpent = totals.spent;
  const totalRemaining = totals.remaining;
  const overBudgetCount = totals.overBudgetCount;

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiGrid size={14} /> },
    { id: "analytics", label: "Analytics", icon: <FiPieChart size={14} /> },
    { id: "ai planner", label: "AI Planner", icon: <FiCpu size={14} /> },
    { id: "manage", label: "Manage", icon: <FiSettings size={14} /> },
  ];

  const handleRequestDelete = (budget) => {
    setSelectedBudget(budget);
    setConfirmDeleteOpen(true);
  };

  const handleChangeBudgetField = (field, value) =>
    setNewBudget({ ...newBudget, [field]: value });

  // --- INITIAL LOADING STATE ---
  if (!userId) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Shimmer className="h-8 w-48" />
          <Shimmer className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      <BudgetHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        onAdd={() => setIsModalOpen(true)}
      >
        <BudgetStatCards
          totalAllocated={totalAllocated}
          totalSpent={totalSpent}
          totalRemaining={totalRemaining}
          overBudgetCount={overBudgetCount}
        />
      </BudgetHeader>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <OverviewTab
            key="overview"
            summary={summary}
            onAdd={() => setIsModalOpen(true)}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab key="analytics" summary={summary} />
        )}

        {activeTab === "ai planner" && (
          <AIPlannerTab
            key="ai planner"
            plan={budgetPlan}
            loading={loadingPlan}
            onGenerate={handleGeneratePlan}
          />
        )}

        {activeTab === "manage" && (
          <ManageTab
            key="manage"
            budgets={budgets}
            onRequestDelete={handleRequestDelete}
            onAdd={() => setIsModalOpen(true)}
          />
        )}
      </AnimatePresence>

      <AddBudgetDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        form={newBudget}
        onChange={handleChangeBudgetField}
        onSubmit={handleAddBudget}
        isSubmitting={isSubmitting}
      />

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        budget={selectedBudget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteBudget}
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setSelectedBudget(null);
        }}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
};
