import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../Utils/axiosInstance";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllExpenses,
  fetchRecentExpenses,
  fetchCategories,
} from "../../../redux/slices/expenseSlice";
import { AnimatePresence } from "framer-motion";
import { FiList, FiBarChart2, FiAlignLeft } from "react-icons/fi";

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
 */

// --- MAIN COMPONENT ---
export const UserExpenses = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { categories, recentExpenses, expenses } = useSelector(
    (state) => state.expense,
  );

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categoryID: "",
    minAmount: "",
    maxAmount: "",
    datePreset: "all",
  });

  const userId = useMemo(() => user?._id, [user]);

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

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      categoryID: "",
      minAmount: "",
      maxAmount: "",
      datePreset: "all",
    });
  };

  // Logic for generating chart data from the expense registry
  const { chartData, categoryBreakdown } = useMemo(() => {
    const monthly = Array.from({ length: 12 }, () => 0);
    const categoryMap = {};
    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      if (date.getFullYear() === new Date().getFullYear()) {
        const m = date.getMonth();
        monthly[m] += exp.amount;
      }
      const catName = exp.categoryID?.name || "Other";
      categoryMap[catName] = (categoryMap[catName] || 0) + exp.amount;
    });

    const formattedTrend = monthly.map((amt, idx) => ({
      month: new Date(0, idx).toLocaleString("default", { month: "short" }),
      amount: amt,
    }));

    const formattedBreakdown = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { chartData: formattedTrend, categoryBreakdown: formattedBreakdown };
  }, [expenses]);

  // Handle new expense submission
  const SubmitHandler = async (data) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.post("/expense", {
        categoryID: data.categoryID,
        amount: Number(data.amount),
        date: data.date,
        description: data.description,
      });
      reset({ userID: userId });
      setIsModalOpen(false);
      dispatch(fetchRecentExpenses(userId));
      dispatch(fetchAllExpenses({ userId, filters }));
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
      await axiosInstance.delete(`/expense/${id}`);
      dispatch(fetchAllExpenses({ userId, filters }));
      dispatch(fetchRecentExpenses(userId));
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  // --- ANALYTICS DERIVATION ---
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const topCategory = categoryBreakdown[0]?.name || "—";
  const thisMonthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, e) => s + e.amount, 0);

  // --- LIFECYCLE ---
  useEffect(() => {
    if (userId) {
      setValue("userID", userId);
      dispatch(fetchCategories());
      dispatch(fetchRecentExpenses(userId));
      dispatch(fetchAllExpenses({ userId, filters }));
    }
  }, [dispatch, userId, setValue, filters]);

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
