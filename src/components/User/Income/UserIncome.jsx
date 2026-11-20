import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../Utils/axiosInstance";
import {
  fetchIncomeData,
  fetchRecurring,
} from "../../../redux/slices/incomeSlice";
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
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { incomes, expenses, recurringPayments, loading } = useSelector(
    (state) => state.income,
  );

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("summary");
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
  });
  const [tips, setTips] = useState([]);
  const [monthlyIncomeExpense, setMonthlyIncomeExpense] = useState([]);
  const [monthlyIncomeTrend, setMonthlyIncomeTrend] = useState([]);
  const [avgIncome, setAvgIncome] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const userId = useMemo(() => user?._id, [user]);

  const [recurringForm, setRecurringForm] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    startDate: "",
    category: "",
  });
  const [recurringLoading, setRecurringLoading] = useState(false);

  // --- ANALYTICS DERIVATION ---

  // Processes raw transaction data into human-readable analytics and chart data
  const computeAnalytics = (incomesData, expensesData) => {
    const totalIncome = incomesData.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expensesData.reduce((sum, e) => sum + e.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(2) : 0;

    setStats({ totalIncome, totalExpense, netSavings, savingsRate });

    const months = Array.from({ length: 12 }, () => ({
      income: 0,
      expense: 0,
    }));
    incomesData.forEach((inc) => {
      const date = new Date(inc.date);
      if (!isNaN(date)) {
        const m = date.getMonth();
        months[m].income += inc.amount;
      }
    });
    expensesData.forEach((exp) => {
      const date = new Date(exp.date);
      if (!isNaN(date)) {
        const m = date.getMonth();
        months[m].expense += exp.amount;
      }
    });

    const monthly = months.map((m, idx) => ({
      month: new Date(0, idx).toLocaleString("default", { month: "short" }),
      income: m.income,
      expense: m.expense,
    }));

    setMonthlyIncomeExpense(monthly);
    setMonthlyIncomeTrend(
      monthly.map((m) => ({ month: m.month, amount: m.income })),
    );
    setAvgIncome(months.reduce((a, b) => a + b.income, 0) / 12);

    // Generate AI-driven financial coaching tips based on savings rate
    let suggestedTips = [];
    if (savingsRate < 20) {
      suggestedTips = [
        "Your savings rate is below 20%. Consider auditing small recurring expenses.",
        "The 50/30/20 rule suggests 20% for savings. You're almost there!",
        "Try a 'no-spend' weekend once a month to boost your net savings.",
      ];
    } else if (savingsRate < 40) {
      suggestedTips = [
        "Excellent! Your savings rate is healthy. Consider an emergency fund.",
        "Automate your savings to move money before you have a chance to spend it.",
        "Review your investments; you have enough surplus to start compounding.",
      ];
    } else {
      suggestedTips = [
        "Super saver! You are building wealth rapidly. Keep it up!",
        "Look for tax-advantaged investment vehicles for your high surplus.",
        "Consider diversifying into low-risk assets to protect your gains.",
      ];
    }
    setTips(suggestedTips);
  };

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
        dispatch(fetchIncomeData(userId));
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
      dispatch(fetchIncomeData(userId));
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
    dispatch(fetchIncomeData(userId));
    dispatch(fetchRecurring(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (!incomes.length && !expenses.length) return;
    computeAnalytics(incomes, expenses);
  }, [incomes, expenses]);

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
