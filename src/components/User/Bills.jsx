import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../Utils/axiosInstance";

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
    setError("");
    try {
      await axiosInstance.delete(`/bill/${id}`);
      setBills((current) => current.filter((bill) => bill._id !== id));
    } catch (requestError) {
      setError(errorText(requestError));
    }
  };

  return (
    <section className="space-y-6 text-[var(--text-primary)]">
      <header><h1 className="text-2xl font-bold">Bills</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Track due dates and link payments to an existing expense record.</p></header>
      {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-600">{error}</p>}
      <form onSubmit={addBill} className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-5 sm:grid-cols-3 sm:items-end">
        <label className="space-y-1 text-sm">Bill name<input required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <label className="space-y-1 text-sm">Amount<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <label className="space-y-1 text-sm">Due date<input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white sm:col-span-3"><FiPlus />Add bill</button>
      </form>
      {loading ? <p role="status">Loading bills…</p> : bills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center"><p className="font-semibold">No bills tracked yet</p><p className="mt-1 text-sm text-[var(--text-muted)]">Add a bill above to keep its due date visible.</p></div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <article key={bill._id} className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-semibold">{bill.name}</h2><p className="text-sm text-[var(--text-muted)]">{bill.amount} · Due {formatDate(bill.dueDate)} · {bill.status || "pending"}</p></div>
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
          ))}
        </div>
      )}
    </section>
  );
};

export default Bills;
