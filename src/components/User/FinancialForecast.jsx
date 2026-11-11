import { useState } from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiRefreshCw } from "react-icons/fi";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  const projection = scenarios.reduce((months, [scenarioName, scenario]) => {
    if (!Array.isArray(scenario?.monthly)) return months;
    scenario.monthly.forEach((month) => {
      if (!month?.month) return;
      const current = months.get(month.month) || { month: month.month };
      if (typeof month.closingBalance === "number" && Number.isFinite(month.closingBalance)) {
        current[scenarioName] = month.closingBalance;
      }
      months.set(month.month, current);
    });
    return months;
  }, new Map());
  const projectionData = Array.from(projection.values());

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-7 text-[var(--text-primary)]"
    >
      <header className="flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-lavender)]">Planning / Liquidity</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Cash-flow outlook</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">Compare monthly cash positions using the backend’s expected, best and worst-case projections.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><FiTrendingUp aria-hidden="true" />Based on recent history and known obligations</div>
      </header>

      <form onSubmit={generateForecast} className="grid gap-4 border-b border-[var(--border)] pb-6 sm:grid-cols-[minmax(200px,1fr)_180px_auto] sm:items-end">
        <label className="space-y-2 text-sm font-medium">
          Opening cash
          <input
            required
            min="0"
            step="0.01"
            type="number"
            value={openingCash}
            onChange={(event) => setOpeningCash(event.target.value)}
            className="w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2.5 tabular-nums"
          />
          <span className="block text-xs text-[var(--text-muted)]">Enter the balance to start from; it is not inferred.</span>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Forecast horizon
          <select
            value={horizonMonths}
            onChange={(event) => setHorizonMonths(event.target.value)}
            className="w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2.5"
          >
            {[3, 6, 12].map((months) => <option key={months} value={months}>{months} months</option>)}
          </select>
        </label>
        <button disabled={loading || openingCash === ""} className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent-electric)] px-5 py-3 font-semibold text-[#101a2b] transition hover:brightness-95 disabled:opacity-60">
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? "Generating…" : "Generate forecast"}
        </button>
      </form>

      {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-600">{error}</p>}

      {forecast && (
        <div className="space-y-5">
          <section aria-label="Forecast summary" className="grid gap-3 border-b border-[var(--border)] pb-5 sm:grid-cols-3">
            {[
              ["Opening cash", forecast.openingCash],
              ["Historical daily net flow", forecast.historicalDailyBaseline?.netCashFlow],
              ["Data confidence", forecast.dataConfidence],
            ].map(([label, value]) => (
              <div key={label} className="border-l-2 border-[var(--accent-lavender)] pl-4 py-1">
                <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                <p className="mt-2 text-xl font-semibold tabular-nums">
                  {label === "Data confidence"
                    ? (value?.level || value || "Unavailable")
                    : formatAmount(value, currency)}
                </p>
              </div>
            ))}
          </section>

          {projectionData.length > 0 && (
            <section aria-label="Projected closing balance comparison" className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-primary)] p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="font-semibold">Projected liquidity</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Closing balance by forecast month. Scenarios are illustrative, not guarantees.</p>
              </div>
              <div role="img" aria-label="Line chart comparing monthly closing cash balance across expected, best and worst scenarios" className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} width={78} tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={(value) => new Intl.NumberFormat(undefined, { notation: "compact" }).format(value)} />
                    <Tooltip formatter={(value, name) => [formatAmount(value, currency), name]} contentStyle={{ background: "var(--surface-primary)", borderColor: "var(--border)", borderRadius: 10 }} />
                    <Legend />
                    <Area type="monotone" dataKey="expected" name="Expected" stroke="#3985ff" fill="#3985ff" fillOpacity={0.11} connectNulls={false} />
                    <Area type="monotone" dataKey="best" name="Best case" stroke="#45b889" fill="#45b889" fillOpacity={0.06} connectNulls={false} />
                    <Area type="monotone" dataKey="worst" name="Worst case" stroke="#f07870" fill="#f07870" fillOpacity={0.05} connectNulls={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <div className="grid gap-0 border-y border-[var(--border)] lg:grid-cols-3 lg:divide-x lg:divide-[var(--border)]">
            {scenarios.map(([name, scenario]) => (
              <article key={name} className="py-5 lg:px-5 first:lg:pl-0 last:lg:pr-0">
                <h2 className="font-semibold capitalize">{name} scenario</h2>
                {scenario?.description && <p className="mt-1 text-sm text-[var(--text-muted)]">{scenario.description}</p>}
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3"><dt>Net cash flow</dt><dd className="font-semibold tabular-nums">{formatAmount(scenario?.netCashFlow, currency)}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Closing balance</dt><dd className="font-semibold tabular-nums">{formatAmount(scenario?.closingBalance, currency)}</dd></div>
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
