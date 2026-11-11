import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../Utils/axiosInstance";
import billCalendar from "../../assets/illustrations/bill-calendar.svg";

const errorText = (error) =>
  error.response?.data?.message || error.message || "The request could not be completed.";

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime())
    ? date.toLocaleDateString()
    : "date unavailable";
};

export const Bills = () => {
  const [bills, setBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ name: "", amount: "", dueDate: "" });
  const [expenseIds, setExpenseIds] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const sortedBills = [...bills].sort((a, b) => {
    const aDate = new Date(a.dueDate).getTime();
    const bDate = new Date(b.dueDate).getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aOverdue = a.status !== "paid" && Number.isFinite(aDate) && aDate < today.getTime();
    const bOverdue = b.status !== "paid" && Number.isFinite(bDate) && bDate < today.getTime();
    return Number(bOverdue) - Number(aOverdue) || aDate - bDate;
  });
  const overdueCount = bills.filter((bill) => {
    const due = bill.dueDate ? new Date(bill.dueDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bill.status !== "paid" && due && Number.isFinite(due.getTime()) && due < today;
  }).length;
  const openCount = bills.filter((bill) => bill.status !== "paid").length;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [billResponse, expenseResponse] = await Promise.all([
        axiosInstance.get("/bills/me"),
        axiosInstance.get("/expenses/me"),
      ]);
      setBills(Array.isArray(billResponse.data.data) ? billResponse.data.data : []);
      setExpenses(Array.isArray(expenseResponse.data.data) ? expenseResponse.data.data : []);
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addBill = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await axiosInstance.post("/bill", {
        name: form.name,
        amount: Number(form.amount),
        dueDate: form.dueDate,
      });
      setForm({ name: "", amount: "", dueDate: "" });
      await load();
    } catch (requestError) {
      setError(errorText(requestError));
    }
  };

  const settleBill = async (bill) => {
    const expenseId = expenseIds[bill._id];
    if (!expenseId) {
      setError("Choose the expense record that represents payment before settling this bill.");
      return;
    }
    setError("");
    try {
      await axiosInstance.patch(`/bill/${bill._id}/settle`, { expenseId });
      await load();
    } catch (requestError) {
      setError(errorText(requestError));
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Delete this bill? This cannot be undone.")) return;
    setError("");
    try {
      await axiosInstance.delete(`/bill/${id}`);
      setBills((current) => current.filter((bill) => bill._id !== id));
    } catch (requestError) {
      setError(errorText(requestError));
    }
  };

  return (
    <section className="space-y-7 text-[var(--text-primary)]">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-electric)]">Planning / Payments</p>
          <h1 className="mt-2 text-2xl font-bold">Bills & payments</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Keep due dates visible and link paid bills to an existing expense.</p>
        </div>
        <div className="flex gap-5 text-sm">
          <div><p className="text-xs text-[var(--text-muted)]">Open</p><p className="mt-1 font-semibold tabular-nums">{openCount}</p></div>
          <div><p className="text-xs text-[var(--text-muted)]">Overdue</p><p className={`mt-1 font-semibold tabular-nums ${overdueCount > 0 ? "text-rose-600" : "text-[var(--text-primary)]"}`}>{overdueCount}</p></div>
        </div>
      </header>
      {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-600">{error}</p>}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="order-2 xl:order-1">
          <div className="mb-2 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="font-semibold">Due-date timeline</h2>
            <span className="text-xs text-[var(--text-muted)]">{bills.length} tracked</span>
          </div>
          {loading ? <p role="status" className="py-8 text-sm text-[var(--text-muted)]">Loading bills…</p> : bills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
              <img src={billCalendar} alt="" aria-hidden="true" className="mx-auto mb-4 h-24 w-28" />
              <p className="font-semibold">No bills tracked yet</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Add a bill to keep its due date visible.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedBills.map((bill) => {
                const due = bill.dueDate ? new Date(bill.dueDate) : null;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const overdue = bill.status !== "paid" && due && Number.isFinite(due.getTime()) && due < today;
                const paid = bill.status === "paid";
                return (
                  <article key={bill._id} className={`flex flex-col gap-3 border-b py-4 pl-4 sm:flex-row sm:items-center sm:justify-between ${overdue ? "border-l-2 border-l-rose-500" : paid ? "border-l-2 border-l-emerald-500" : "border-l-2 border-l-[var(--accent-electric)]"}`}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{bill.name}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${overdue ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : paid ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-[var(--accent-electric-soft)] text-[var(--accent-electric)]"}`}>
                          {overdue ? "Overdue" : bill.status || "pending"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-muted)]"><span className="font-semibold tabular-nums text-[var(--text-primary)]">{bill.amount}</span> · Due {formatDate(bill.dueDate)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {bill.status !== "paid" && (
                        <>
                          <label className="sr-only" htmlFor={`expense-${bill._id}`}>Expense record for {bill.name}</label>
                          <select id={`expense-${bill._id}`} value={expenseIds[bill._id] || ""} onChange={(event) => setExpenseIds((current) => ({ ...current, [bill._id]: event.target.value }))} className="max-w-56 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2 py-2 text-sm">
                            <option value="">Select an existing expense</option>
                            {expenses.map((expense) => <option key={expense._id} value={expense._id}>{expense.description || "Expense"} · {expense.amount}</option>)}
                          </select>
                          <button onClick={() => settleBill(bill)} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700">Link payment</button>
                        </>
                      )}
                      <button aria-label={`Delete ${bill.name}`} onClick={() => deleteBill(bill._id)} className="rounded-lg p-2 text-rose-500"><FiTrash2 /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        <aside className="order-1 h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-5 xl:order-2">
          <h2 className="mb-4 font-semibold">Add a bill</h2>
          <form onSubmit={addBill} className="grid gap-4">
            <label className="space-y-1 text-sm">Bill name<input required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
            <label className="space-y-1 text-sm">Amount<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
            <label className="space-y-1 text-sm">Due date<input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
            <button className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#3985ff] px-4 py-2.5 font-semibold text-[#101a2b]"><FiPlus />Add bill</button>
          </form>
          <p className="mt-4 border-t border-[var(--border)] pt-4 text-xs leading-relaxed text-[var(--text-muted)]">
            Settling a bill links it to an existing expense; it doesn’t create a new expense.
          </p>
        </aside>
      </div>
    </section>
  );
};

export default Bills;
