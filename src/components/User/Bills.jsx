
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiFileText,
  FiX,
} from "react-icons/fi";
import axiosInstance from "../Utils/axiosInstance";

const styles = `
.bills-page{--bill-accent:#06b6d4;--bill-border:var(--border,rgba(148,163,184,.18));--bill-muted:var(--text-muted,#94a3b8);--bill-primary:var(--text-primary,#e2e8f0);--bill-surface:var(--surface-primary,rgba(15,23,42,.72));color:var(--bill-primary);display:flex;flex-direction:column;gap:24px;min-width:0}
.bills-header{display:flex;justify-content:space-between;align-items:flex-end;gap:18px}
.bills-eyebrow{display:flex;align-items:center;gap:8px;color:var(--bill-accent);font-size:10px;font-weight:800;letter-spacing:.16em}
.bills-header h1{margin:8px 0 4px;font-size:clamp(26px,4vw,36px);font-weight:800;letter-spacing:-.045em}
.bills-header p,.bills-list-heading p{margin:0;color:var(--bill-muted);font-size:13px}
.bills-header-actions{display:flex;gap:10px;flex-wrap:wrap}
.bills-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:11px;padding:11px 15px;font-size:12px;font-weight:750;cursor:pointer;transition:transform .18s ease}
.bills-button:hover:not(:disabled){transform:translateY(-1px)}
.bills-button:disabled{opacity:.55;cursor:not-allowed}
.bills-button-primary{background:linear-gradient(120deg,#0891b2,#06b6d4);color:#fff;box-shadow:0 8px 22px rgba(6,182,212,.16)}
.bills-button-ghost{background:var(--bill-surface);border-color:var(--bill-border);color:var(--bill-primary)}
.bills-alert{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid;border-radius:12px;font-size:12px}
.bills-alert span{flex:1}
.bills-alert button{display:grid;place-items:center;border:0;background:transparent;color:inherit;cursor:pointer}
.bills-alert-error{color:#fb7185;background:rgba(244,63,94,.08);border-color:rgba(244,63,94,.24)}
.bills-alert-success{color:#34d399;background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.22)}
.bills-stats-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.bills-stat-card{position:relative;overflow:hidden;padding:19px;border:1px solid var(--bill-border);border-radius:16px;background:var(--bill-surface);display:flex;flex-direction:column;gap:8px}
.bills-stat-card:after{content:"";position:absolute;width:110px;height:110px;border-radius:50%;right:-45px;top:-55px;background:currentColor;opacity:.045}
.bills-stat-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:currentColor;font-size:16px}
.bills-stat-icon svg{filter:brightness(1.8)}
.bills-stat-card>span{font-size:11px;color:var(--bill-muted);font-weight:650}
.bills-stat-card strong{font-size:clamp(19px,2.4vw,25px);letter-spacing:-.04em;color:var(--bill-primary)}
.bills-stat-card small{font-size:11px;color:var(--bill-muted)}
.bills-stat-pending{color:#0ea5e9}
.bills-stat-overdue{color:#f43f5e}
.bills-stat-paid{color:#10b981}
.bills-list-panel{border:1px solid var(--bill-border);border-radius:17px;background:var(--bill-surface);overflow:hidden}
.bills-list-heading{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:19px 20px;border-bottom:1px solid var(--bill-border)}
.bills-list-heading h2{margin:0 0 4px;font-size:16px;font-weight:800}
.bills-filters{display:flex;gap:4px;padding:4px;border:1px solid var(--bill-border);border-radius:10px;background:rgba(148,163,184,.055)}
.bills-filters button{border:0;background:transparent;color:var(--bill-muted);padding:7px 11px;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer}
.bills-filters button.active{background:rgba(6,182,212,.15);color:var(--bill-accent)}
.bills-table-wrap{overflow-x:auto}
.bills-table{width:100%;border-collapse:collapse;min-width:590px}
.bills-table th{padding:12px 20px;text-align:left;color:var(--bill-muted);font-size:9px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;background:rgba(148,163,184,.035)}
.bills-table td{padding:14px 20px;border-top:1px solid var(--bill-border);font-size:12px}
.bills-name-cell{display:flex;align-items:center;gap:11px}
.bills-row-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:rgba(6,182,212,.1);color:var(--bill-accent)}
.bills-name-cell strong{display:block;font-size:12px;font-weight:750}
.bills-name-cell small{display:block;margin-top:4px;color:var(--bill-muted);font-size:10px}
.bills-amount-cell{font-weight:800;font-variant-numeric:tabular-nums}
.bills-status{display:inline-flex;padding:5px 9px;border-radius:20px;font-size:10px;font-weight:800;text-transform:capitalize}
.bills-status.pending{color:#38bdf8;background:rgba(14,165,233,.11)}
.bills-status.overdue{color:#fb7185;background:rgba(244,63,94,.12)}
.bills-status.paid{color:#34d399;background:rgba(16,185,129,.12)}
.bills-due-overdue{color:#fb7185;font-weight:750}
.bills-delete-button{width:30px;height:30px;display:grid;place-items:center;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--bill-muted);cursor:pointer}
.bills-delete-button:hover:not(:disabled){color:#fb7185;background:rgba(244,63,94,.1);border-color:rgba(244,63,94,.18)}
.bills-delete-button:disabled{opacity:.5;cursor:wait}
.bills-empty-state{min-height:220px;padding:35px 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:9px;color:var(--bill-muted);font-size:12px}
.bills-empty-state strong{color:var(--bill-primary);font-size:14px}
.bills-empty-state p{margin:0 0 8px}
.bills-empty-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:rgba(6,182,212,.1);color:var(--bill-accent);font-size:20px}
.bills-loader,.bills-mini-loader{width:18px;height:18px;border:2px solid rgba(148,163,184,.25);border-top-color:var(--bill-accent);border-radius:50%;animation:bills-rotate .7s linear infinite}
.bills-mini-loader{width:13px;height:13px}
.bills-spin{animation:bills-rotate .8s linear infinite}
@keyframes bills-rotate{to{transform:rotate(360deg)}}
.bills-modal-backdrop{position:fixed;inset:0;z-index:1400;display:grid;place-items:center;padding:18px;background:rgba(2,6,23,.72);backdrop-filter:blur(7px)}
.bills-modal{width:min(100%,490px);padding:23px;border:1px solid var(--bill-border);border-radius:18px;background:var(--surface-primary,#0f172a);box-shadow:0 24px 80px rgba(0,0,0,.35)}
.bills-modal-heading{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}
.bills-modal-heading span{color:var(--bill-accent);font-size:9px;font-weight:850;letter-spacing:.16em}
.bills-modal-heading h2{margin:5px 0 0;font-size:21px;font-weight:850}
.bills-modal-heading>button{width:32px;height:32px;display:grid;place-items:center;border:1px solid var(--bill-border);border-radius:9px;background:transparent;color:var(--bill-muted);cursor:pointer}
.bills-form{display:flex;flex-direction:column;gap:15px}
.bills-form label{display:flex;flex-direction:column;gap:7px;color:var(--bill-muted);font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.bills-form input,.bills-form select{width:100%;min-width:0;padding:12px 13px;border:1px solid var(--bill-border);border-radius:10px;outline:none;background:var(--surface-secondary,rgba(148,163,184,.08));color:var(--bill-primary);font:500 13px inherit;letter-spacing:normal;text-transform:none}
.bills-form input:focus,.bills-form select:focus{border-color:rgba(6,182,212,.7);box-shadow:0 0 0 3px rgba(6,182,212,.1)}
.bills-form input::placeholder{color:var(--bill-muted);opacity:.7}
.bills-form select option{background:#0f172a;color:#e2e8f0}
.bills-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.bills-form-note{margin:0;padding:10px 12px;border-radius:9px;background:rgba(6,182,212,.07);color:var(--bill-muted);font-size:10px;line-height:1.5}
.bills-form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:5px}
@media(max-width:720px){
 .bills-header{align-items:flex-start;flex-direction:column}
 .bills-header-actions{width:100%}
 .bills-header-actions .bills-button{flex:1}
 .bills-stats-grid{grid-template-columns:1fr}
 .bills-stat-card{padding:15px}
 .bills-list-heading{align-items:flex-start;flex-direction:column}
 .bills-filters{width:100%;overflow-x:auto}
 .bills-filters button{flex:1;white-space:nowrap}
 .bills-form-row{grid-template-columns:1fr}
 .bills-modal{padding:18px}
}
`;

const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const initialForm = {
  name: "",
  amount: "",
  dueDate: todayInputValue(),
  status: "pending",
};

export const Bills = () => {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBills = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get("/bills/me");
      const payload = unwrap(response);
      setBills(Array.isArray(payload) ? payload : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, [bills]);

  const normalizedBills = useMemo(
    () =>
      bills.map((bill) => {
        const due = new Date(bill.dueDate);
        due.setHours(0, 0, 0, 0);
        const status = String(bill.status || "pending").toLowerCase();

        return {
          ...bill,
          normalizedStatus: status,
          isOverdue:
            status === "pending" &&
            !Number.isNaN(due.getTime()) &&
            due < today,
        };
      }),
    [bills, today],
  );

  const stats = useMemo(() => {
    const pending = normalizedBills.filter(
      (bill) => bill.normalizedStatus === "pending",
    );
    const paid = normalizedBills.filter(
      (bill) => bill.normalizedStatus === "paid",
    );
    const overdue = pending.filter((bill) => bill.isOverdue);

    return {
      pendingCount: pending.length,
      pendingAmount: pending.reduce(
        (sum, bill) => sum + Number(bill.amount || 0),
        0,
      ),
      paidCount: paid.length,
      paidAmount: paid.reduce(
        (sum, bill) => sum + Number(bill.amount || 0),
        0,
      ),
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce(
        (sum, bill) => sum + Number(bill.amount || 0),
        0,
      ),
    };
  }, [normalizedBills]);

  const visibleBills = useMemo(() => {
    const filtered = normalizedBills.filter((bill) => {
      if (filter === "pending") return bill.normalizedStatus === "pending";
      if (filter === "paid") return bill.normalizedStatus === "paid";
      if (filter === "overdue") return bill.isOverdue;
      return true;
    });

    return filtered.sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    );
  }, [filter, normalizedBills]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitBill = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const amount = Number(form.amount);

    if (!name) return setError("Enter a bill name.");
    if (name.length > 100) {
      return setError("Bill name cannot exceed 100 characters.");
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return setError("Enter an amount greater than zero.");
    }
    if (!form.dueDate || Number.isNaN(new Date(form.dueDate).getTime())) {
      return setError("Select a valid due date.");
    }
    if (!["pending", "paid"].includes(form.status)) {
      return setError("Select a valid bill status.");
    }

    setSaving(true);

    try {
      await axiosInstance.post("/bill", {
        name,
        amount,
        dueDate: new Date(`${form.dueDate}T12:00:00`).toISOString(),
        status: form.status,
      });

      setForm({ ...initialForm, dueDate: todayInputValue() });
      setShowForm(false);
      setSuccess("Bill created successfully.");
      await loadBills();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteBill = async (bill) => {
    const id = bill._id || bill.id;

    if (!id) {
      setError("This bill does not have a valid identifier.");
      return;
    }

    if (!window.confirm(`Delete "${bill.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await axiosInstance.delete(`/bill/${id}`);
      setBills((current) =>
        current.filter((item) => (item._id || item.id) !== id),
      );
      setSuccess("Bill deleted.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId("");
    }
  };

  return (
    <>
      <style>{styles}</style>

      <section className="bills-page">
        <header className="bills-header">
          <div>
            <div className="bills-eyebrow">
              <FiFileText /> LIABILITY TRACKER
            </div>
            <h1>Bill Center</h1>
            <p>Track upcoming obligations, overdue payments and settled bills.</p>
          </div>

          <div className="bills-header-actions">
            <button
              className="bills-button bills-button-ghost"
              type="button"
              onClick={loadBills}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? "bills-spin" : ""} /> Refresh
            </button>

            <button
              className="bills-button bills-button-primary"
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowForm(true);
              }}
            >
              <FiPlus /> Add bill
            </button>
          </div>
        </header>

        {error && (
          <div className="bills-alert bills-alert-error" role="alert">
            <FiAlertCircle />
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
              <FiX />
            </button>
          </div>
        )}

        {success && (
          <div className="bills-alert bills-alert-success" role="status">
            <FiCheckCircle />
            <span>{success}</span>
            <button type="button" onClick={() => setSuccess("")} aria-label="Dismiss message">
              <FiX />
            </button>
          </div>
        )}

        <div className="bills-stats-grid">
          <article className="bills-stat-card bills-stat-pending">
            <div className="bills-stat-icon"><FiClock /></div>
            <span>Pending amount</span>
            <strong>{formatCurrency(stats.pendingAmount)}</strong>
            <small>{stats.pendingCount} unpaid bills</small>
          </article>

          <article className="bills-stat-card bills-stat-overdue">
            <div className="bills-stat-icon"><FiAlertCircle /></div>
            <span>Overdue amount</span>
            <strong>{formatCurrency(stats.overdueAmount)}</strong>
            <small>{stats.overdueCount} overdue bills</small>
          </article>

          <article className="bills-stat-card bills-stat-paid">
            <div className="bills-stat-icon"><FiCheckCircle /></div>
            <span>Paid amount</span>
            <strong>{formatCurrency(stats.paidAmount)}</strong>
            <small>{stats.paidCount} settled bills</small>
          </article>
        </div>

        <div className="bills-list-panel">
          <div className="bills-list-heading">
            <div>
              <h2>Your bills</h2>
              <p>{visibleBills.length} records</p>
            </div>

            <div className="bills-filters" role="group" aria-label="Filter bills">
              {[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "overdue", label: "Overdue" },
                { value: "paid", label: "Paid" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={filter === item.value ? "active" : ""}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bills-empty-state">
              <span className="bills-loader" /> Loading bills…
            </div>
          ) : visibleBills.length === 0 ? (
            <div className="bills-empty-state">
              <div className="bills-empty-icon"><FiCalendar /></div>
              <strong>
                {filter === "all" ? "No bills recorded" : `No ${filter} bills`}
              </strong>
              <p>
                {filter === "all"
                  ? "Add a bill to start tracking upcoming payments."
                  : "There are no bills in this filter right now."}
              </p>
              {filter === "all" && (
                <button
                  type="button"
                  className="bills-button bills-button-primary"
                  onClick={() => setShowForm(true)}
                >
                  <FiPlus /> Add your first bill
                </button>
              )}
            </div>
          ) : (
            <div className="bills-table-wrap">
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Bill</th>
                    <th>Due date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {visibleBills.map((bill) => {
                      const id = bill._id || bill.id;
                      const overdue = bill.isOverdue;

                      return (
                        <motion.tr
                          key={id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td>
                            <div className="bills-name-cell">
                              <span className="bills-row-icon"><FiFileText /></span>
                              <div>
                                <strong>{bill.name}</strong>
                                <small>Added {formatDate(bill.createdAt)}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={overdue ? "bills-due-overdue" : ""}>
                              {formatDate(bill.dueDate)}
                            </span>
                          </td>
                          <td className="bills-amount-cell">
                            {formatCurrency(bill.amount)}
                          </td>
                          <td>
                            <span
                              className={`bills-status ${
                                overdue ? "overdue" : bill.normalizedStatus
                              }`}
                            >
                              {overdue
                                ? "Overdue"
                                : bill.normalizedStatus === "paid"
                                  ? "Paid"
                                  : "Pending"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="bills-delete-button"
                              onClick={() => deleteBill(bill)}
                              disabled={deletingId === id}
                              aria-label={`Delete ${bill.name}`}
                              title="Delete bill"
                            >
                              {deletingId === id
                                ? <span className="bills-mini-loader" />
                                : <FiTrash2 />}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              className="bills-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                  setShowForm(false);
                }
              }}
            >
              <motion.div
                className="bills-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="bills-modal-title"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
              >
                <div className="bills-modal-heading">
                  <div>
                    <span>NEW RECORD</span>
                    <h2 id="bills-modal-title">Add a bill</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                    aria-label="Close dialog"
                  >
                    <FiX />
                  </button>
                </div>

                <form onSubmit={submitBill} className="bills-form">
                  <label>
                    Bill name
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      maxLength={100}
                      placeholder="e.g. Electricity bill"
                      required
                      autoFocus
                    />
                  </label>

                  <div className="bills-form-row">
                    <label>
                      Amount (₹)
                      <input
                        name="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.amount}
                        onChange={updateForm}
                        placeholder="8000"
                        required
                      />
                    </label>

                    <label>
                      Due date
                      <input
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={updateForm}
                        required
                      />
                    </label>
                  </div>

                  <label>
                    Status
                    <select name="status" value={form.status} onChange={updateForm}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </label>

                  <p className="bills-form-note">
                    Pending bills are included in the financial forecast.
                    Paid bills are excluded.
                  </p>

                  <div className="bills-form-actions">
                    <button
                      type="button"
                      className="bills-button bills-button-ghost"
                      onClick={() => setShowForm(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bills-button bills-button-primary"
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Save bill"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Bills;
