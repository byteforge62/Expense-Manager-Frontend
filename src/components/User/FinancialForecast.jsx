import { useState } from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiRefreshCw } from "react-icons/fi";
import axiosInstance from "../Utils/axiosInstance";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Unable to generate forecast.";

const formatAmount = (value, currency) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

export const FinancialForecast = () => {
  const [openingCash, setOpeningCash] = useState("");
  const [horizonMonths, setHorizonMonths] = useState(3);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateForecast = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/financial-forecast", {
        openingCash: Number(openingCash),
        horizonMonths: Number(horizonMonths),
      });
      setForecast(response.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const currency = forecast?.currency || "INR";
  const scenarios = forecast?.scenarios && typeof forecast.scenarios === "object"
    ? Object.entries(forecast.scenarios)
    : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-[var(--text-primary)]"
    >
      <header className="flex items-center gap-3">
        <span className="rounded-2xl bg-violet-500/10 p-3 text-violet-500"><FiTrendingUp size={22} /></span>
        <div>
          <h1 className="text-2xl font-bold">Cash-flow forecast</h1>
          <p className="text-sm text-[var(--text-muted)]">Forecasts use your recent history, recurring schedules and pending bills.</p>
        </div>
      </header>

      <form onSubmit={generateForecast} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-5 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <label className="space-y-2 text-sm font-medium">
          Opening cash
          <input
            required
            min="0"
            step="0.01"
            type="number"
            value={openingCash}
            onChange={(event) => setOpeningCash(event.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2.5"
          />
          <span className="block text-xs text-[var(--text-muted)]">Enter the balance to start from; it is not inferred.</span>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Forecast horizon
          <select
            value={horizonMonths}
            onChange={(event) => setHorizonMonths(event.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2.5"
          >
            {[3, 6, 12].map((months) => <option key={months} value={months}>{months} months</option>)}
          </select>
        </label>
        <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? "Generating…" : "Generate forecast"}
        </button>
      </form>

      {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-600">{error}</p>}

      {forecast && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Opening cash", forecast.openingCash],
              ["Historical daily net flow", forecast.historicalDailyBaseline?.netCashFlow],
              ["Data confidence", forecast.dataConfidence],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                <p className="mt-2 text-lg font-bold">
                  {                  label === "Data confidence"
                    ? (value?.level || value || "Unavailable")
                    : formatAmount(value, currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {scenarios.map(([name, scenario]) => (
              <article key={name} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-5">
                <h2 className="font-bold capitalize">{name.replace(/([A-Z])/g, " $1")}</h2>
                {scenario?.description && <p className="mt-1 text-sm text-[var(--text-muted)]">{scenario.description}</p>}
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3"><dt>Net cash flow</dt><dd className="font-semibold">{formatAmount(scenario?.netCashFlow, currency)}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Closing balance</dt><dd className="font-semibold">{formatAmount(scenario?.closingBalance, currency)}</dd></div>
                </dl>
                {Array.isArray(scenario?.monthly) && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="border-b border-[var(--border)] text-[var(--text-muted)]"><th className="py-2">Period</th><th className="py-2">Net flow</th><th className="py-2">Closing</th></tr></thead>
                      <tbody>{scenario.monthly.map((month, index) => (
                        <tr key={month.key || index} className="border-b border-[var(--border)]/60">
                          <td className="py-2">{month.month || "—"}</td>
                          <td className="py-2">{formatAmount(month.netCashFlow, currency)}</td>
                          <td className="py-2">{formatAmount(month.closingBalance, currency)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </article>
            ))}
          </div>

          {Array.isArray(forecast.warnings) && forecast.warnings.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <h2 className="font-semibold">Forecast notes</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">{forecast.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
};

export default FinancialForecast;
