import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axiosInstance from "../../Utils/axiosInstance";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchIncomes,
  fetchRecurring,
  selectAllIncomes,
  selectAllRecurring,
  selectAverageIncome,
  selectIncomeStats,
  selectIncomeStatus,
  selectIncomeTips,
  selectMonthlyIncomeExpense,
  selectMonthlyIncomeTrend,
} from "../../../store/slices/incomeSlice";
import {
  fetchExpenses,
  selectExpensesStatus,
} from "../../../store/slices/expensesSlice";
import { AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiList,
  FiAlignLeft,
  FiRepeat,
} from "react-icons/fi";
import { Shimmer } from "./income/incomeUi";
import IncomeHeader from "./income/IncomeHeader";
import SummaryTab from "./income/SummaryTab";
import AnalyticsTab from "./income/AnalyticsTab";
import RecordsTab from "./income/RecordsTab";
import RecurringTab from "./income/RecurringTab";
import AddIncomeDialog from "./income/AddIncomeDialog";

/**
 * --- INCOME CENTER ---
 * Central hub for tracking incoming liquidity, analyzing revenue trends,
 * and managing automated recurring payments.
 */

// --- MAIN COMPONENT ---
export const UserIncome = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?._id);

  const incomes = useAppSelector(selectAllIncomes);
  const recurringPayments = useAppSelector(selectAllRecurring);

  // Every figure below is computed once in the store and memoized.
  const stats = useAppSelector(selectIncomeStats);
  const tips = useAppSelector(selectIncomeTips);
  const monthlyIncomeExpense = useAppSelector(selectMonthlyIncomeExpense);
  const monthlyIncomeTrend = useAppSelector(selectMonthlyIncomeTrend);
  const avgIncome = useAppSelector(selectAverageIncome);

  const incomeLoading = useAppSelector(selectIncomeStatus) === "loading";
  const expensesLoading = useAppSelector(selectExpensesStatus) === "loading";
  const loading = incomeLoading || expensesLoading;

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("summary");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();


  // Dashboard quick action: /private/income?action=add opens the dialog.
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") !== "add") return;

    setIsModalOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("action");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const [recurringForm, setRecurringForm] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    startDate: "",
    category: "",
  });
  const [recurringLoading, setRecurringLoading] = useState(false);

  // --- ACTIONS & HANDLERS ---

  // Handle addition of a new income stream
  const onSubmitIncome = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post("/income", {
        amount: Number(data.amount),
        source: data.source,
        date: data.date || undefined,
      });
      if (res.status === 201) {
        setIsModalOpen(false);
        reset();
        dispatch(fetchIncomes(userId));
      }
    } catch (error) {
      console.error("Failed to record income:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an income record from history
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/income/${id}`);
      dispatch(fetchIncomes(userId));
    } catch (error) {
      console.error("Failed to remove record:", error);
    }
  };

  const handleRecurringChange = (e) =>
    setRecurringForm({ ...recurringForm, [e.target.name]: e.target.value });

  // Provision a new automated recurring payment
  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    try {
      setRecurringLoading(true);
      await axiosInstance.post("/recurring", {
        title: recurringForm.name,
        amount: Number(recurringForm.amount),
        category: recurringForm.category,
        type: "INCOME",
        frequency: recurringForm.frequency.toLowerCase(),
        nextDate: recurringForm.startDate,
      });
      setRecurringForm({
        name: "",
        amount: "",
        frequency: "monthly",
        startDate: "",
        category: "",
      });
      dispatch(fetchRecurring(userId));
    } catch (error) {
      console.error("Automation setup failed:", error);
    } finally {
      setRecurringLoading(false);
    }
  };

  // Deactivate a recurring wealth stream
  const handleRecurringDelete = async (id) => {
    try {
      await axiosInstance.delete(`/recurring/${id}`);
      dispatch(fetchRecurring(userId));
    } catch (error) {
      console.error("Deactivation failed:", error);
    }
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchIncomes(userId));
    // Expenses are shared state, owned by the expenses slice.
    dispatch(fetchExpenses({ userId }));
    dispatch(fetchRecurring(userId));
  }, [dispatch, userId]);

  const tabs = [
    { id: "summary", label: "Summary", icon: <FiAlignLeft size={14} /> },
    { id: "analytics", label: "Analytics", icon: <FiBarChart2 size={14} /> },
    { id: "records", label: "Records", icon: <FiList size={14} /> },
    { id: "recurring", label: "Recurring", icon: <FiRepeat size={14} /> },
  ];

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* ── HEADER ── */}
      <IncomeHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        onAdd={() => setIsModalOpen(true)}
      />

      {/* ── LOADING ── */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Shimmer key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Shimmer className="h-64 rounded-2xl" />
        </div>
      )}

      {/* ── TAB CONTENT ── */}
      {!loading && (
        <AnimatePresence mode="wait">
          {activeTab === "summary" && (
            <SummaryTab key="summary" stats={stats} tips={tips} />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab
              key="analytics"
              monthlyIncomeExpense={monthlyIncomeExpense}
              monthlyIncomeTrend={monthlyIncomeTrend}
              avgIncome={avgIncome}
            />
          )}

          {activeTab === "records" && (
            <RecordsTab
              key="records"
              incomes={incomes}
              onDelete={handleDelete}
              onAdd={() => setIsModalOpen(true)}
            />
          )}

          {activeTab === "recurring" && (
            <RecurringTab
              key="recurring"
              form={recurringForm}
              onChange={handleRecurringChange}
              onSubmit={handleRecurringSubmit}
              isLoading={recurringLoading}
              payments={recurringPayments}
              onDelete={handleRecurringDelete}
            />
          )}
        </AnimatePresence>
      )}

      {/* ── ADD INCOME MODAL ── */}
      <AddIncomeDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        register={register}
        errors={errors}
        onSubmit={handleSubmit(onSubmitIncome)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
