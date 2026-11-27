import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  FiActivity,
  FiClock,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";

import {
  buildInvestmentPlan,
  createHolding,
  deleteHolding,
  deleteTransaction,
  errorText,
  fetchMarketOverview,
  fetchPortfolio,
  fetchTransactions,
  formatCompactMoney,
  formatMoney,
  formatPercent,
  recordTransaction,
  searchMarketAssets,
} from "./investmentsApi";

/**
 * Investments: a paper portfolio and a goal planner.
 *
 * FinTrack does not place orders. A holding is what the user already owns;
 * the API values it with cached public quotes (Yahoo Finance / MFAPI). Advice
 * is arithmetic on the user's ledger and a stated expected return, so nothing
 * here pretends to be a forecast.
 */

const CARD =
  "rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-4";

const Stat = ({ label, value, detail, tone }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
    <p
      className={`mt-1 truncate text-xl font-semibold tabular-nums ${
        tone === "positive"
          ? "text-emerald-500"
          : tone === "negative"
            ? "text-rose-500"
            : "text-[var(--text-primary)]"
      }`}
    >
      {value}
    </p>
    {detail ? (
      <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{detail}</p>
    ) : null}
  </div>
);

const KindBadge = ({ kind }) => (
  <span className="rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">
    {kind === "FUND" ? "Fund" : "Stock"}
  </span>
);

const emptyForm = {
  kind: "STOCK",
  symbol: "",
  name: "",
  exchange: "",
  units: "",
  avgCost: "",
  investedAt: new Date().toISOString().slice(0, 10),
};

const emptyTrade = () => ({
  type: "BUY",
  units: "",
  price: "",
  tradedAt: new Date().toISOString().slice(0, 10),
});

export const InvestmentPortfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [planInput, setPlanInput] = useState({
    targetAmount: 1000000,
    years: 10,
    expectedReturn: 12,
    existingMonthly: "",
  });
  const [plan, setPlan] = useState(null);
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState("");

  const [ledgerHolding, setLedgerHolding] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState("");
  const [trade, setTrade] = useState(emptyTrade);
  const [tradeSaving, setTradeSaving] = useState(false);

  const mounted = useRef(true);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    const [portfolioResult, overviewResult] = await Promise.allSettled([
      fetchPortfolio(),
      fetchMarketOverview(),
    ]);

    if (!mounted.current) return;

    if (portfolioResult.status === "fulfilled") {
      setPortfolio(portfolioResult.value);
    } else {
      setError(errorText(portfolioResult.reason));
    }

    if (overviewResult.status === "fulfilled") {
      setOverview(overviewResult.value);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();

    return () => {
      mounted.current = false;
    };
  }, [load]);

  // Debounced instrument search; only runs while the add dialog is open.
  useEffect(() => {
    if (!dialogOpen) return undefined;

    const term = searchTerm.trim();

    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    let active = true;
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const found = await searchMarketAssets(term);
        if (active) setResults(found);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [dialogOpen, searchTerm]);

  const openDialog = () => {
    setForm(emptyForm);
    setSelected(null);
    setSearchTerm("");
    setResults([]);
    setFormError("");
    setDialogOpen(true);
  };

  const chooseAsset = (asset) => {
    setSelected(asset);
    setForm((current) => ({
      ...current,
      kind: asset.kind,
      symbol: asset.symbol,
      name: asset.name,
      exchange: asset.exchange || "",
      avgCost: "",
      units: "",
    }));
  };

  const saveHolding = async () => {
    const units = Number(form.units);
    const avgCost = Number(form.avgCost);

    if (!form.symbol) {
      setFormError("Search and pick an instrument first.");
      return;
    }

    if (!(units > 0)) {
      setFormError("Enter the number of units you own.");
      return;
    }

    if (!(avgCost >= 0) || form.avgCost === "") {
      setFormError("Enter your average cost per unit (0 is allowed for bonus units).");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await createHolding({
        kind: form.kind,
        symbol: form.symbol,
        name: form.name,
        exchange: form.exchange || undefined,
        units,
        avgCost,
        investedAt: form.investedAt || undefined,
      });

      setDialogOpen(false);
      setNotice(`${form.name} added to your portfolio.`);
      await load(true);
    } catch (saveError) {
      setFormError(errorText(saveError));
    } finally {
      setSaving(false);
    }
  };

  const removeHolding = async (holding) => {
    if (!window.confirm(`Remove ${holding.name} from your portfolio?`)) return;

    try {
      await deleteHolding(holding._id);
      setNotice(`${holding.name} removed.`);
      await load(true);
    } catch (removeError) {
      setError(errorText(removeError));
    }
  };

  const loadLedger = useCallback(async (holdingId) => {
    setLedgerLoading(true);
    setLedgerError("");

    try {
      const data = await fetchTransactions(holdingId);
      setLedger(data.ledger);
      setTransactions(data.transactions);
    } catch (ledgerFailure) {
      setLedgerError(errorText(ledgerFailure));
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  const openLedger = (holding) => {
    setLedgerHolding(holding);
    setLedger(null);
    setTransactions([]);
    setTrade(emptyTrade());
    loadLedger(holding._id);
  };

  const closeLedger = () => {
    setLedgerHolding(null);
    setLedger(null);
    setTransactions([]);
    setLedgerError("");
  };

  const submitTrade = async (event) => {
    event.preventDefault();

    if (!(Number(trade.units) > 0)) {
      setLedgerError("Enter the units you traded.");
      return;
    }

    if (trade.price === "" || !(Number(trade.price) >= 0)) {
      setLedgerError("Enter the price per unit.");
      return;
    }

    setTradeSaving(true);
    setLedgerError("");

    try {
      const result = await recordTransaction(ledgerHolding._id, {
        type: trade.type,
        units: Number(trade.units),
        price: Number(trade.price),
        ...(trade.tradedAt ? { tradedAt: trade.tradedAt } : {}),
      });

      setLedger(result.ledger);
      setTrade({ ...emptyTrade(), tradedAt: trade.tradedAt });
      await loadLedger(ledgerHolding._id);
      await load(true);
      setNotice("Trade recorded.");
    } catch (tradeFailure) {
      setLedgerError(errorText(tradeFailure));
    } finally {
      setTradeSaving(false);
    }
  };

  const removeTrade = async (row) => {
    if (
      !window.confirm(
        `Remove this ${row.type === "BUY" ? "buy" : "sell"} of ${row.units} units?`,
      )
    ) {
      return;
    }

    setTradeSaving(true);
    setLedgerError("");

    try {
      await deleteTransaction(ledgerHolding._id, row._id);
      await loadLedger(ledgerHolding._id);
      await load(true);
      setNotice("Transaction removed.");
    } catch (tradeFailure) {
      setLedgerError(errorText(tradeFailure));
    } finally {
      setTradeSaving(false);
    }
  };

  const runPlan = async (event) => {
    event.preventDefault();
    setPlanning(true);
    setPlanError("");

    try {
      const result = await buildInvestmentPlan({
        targetAmount: Number(planInput.targetAmount),
        years: Number(planInput.years),
        expectedReturn: Number(planInput.expectedReturn) || 12,
        ...(planInput.existingMonthly !== ""
          ? { existingMonthly: Number(planInput.existingMonthly) }
          : {}),
      });

      setPlan(result);
    } catch (planFailure) {
      setPlanError(errorText(planFailure));
    } finally {
      setPlanning(false);
    }
  };

  const totals = portfolio?.totals;
  const holdings = portfolio?.holdings || [];

  return (
    <section className="space-y-5 text-[var(--text-primary)]">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Investments</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">
            Track the stocks and mutual funds you own against live public market
            data, then size a goal from your real cash flow. FinTrack never places
            an order.
          </p>
        </div>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            onClick={() => load(true)}
            disabled={refreshing || loading}
            startIcon={<FiRefreshCw size={15} />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {refreshing ? "Refreshing…" : "Refresh prices"}
          </Button>
          <Button
            variant="contained"
            onClick={openDialog}
            startIcon={<FiPlus size={16} />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Add holding
          </Button>
        </Stack>
      </header>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      {/* ── Market strip ── */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(overview?.indices || []).map((index) => (
          <div
            key={index.symbol}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] px-4 py-3"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                {index.label}
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {index.available ? index.price?.toLocaleString("en-IN") : "—"}
              </p>
            </div>
            {index.available ? (
              <p
                className={`text-sm font-semibold tabular-nums ${
                  index.change >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {formatPercent(index.changePercent)}
              </p>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)]">Unavailable</p>
            )}
          </div>
        ))}
        {!overview && (
          <div className={`${CARD} sm:col-span-3`}>
            <Skeleton height={30} />
          </div>
        )}
      </div>

      {/* ── Portfolio totals ── */}
      <div className="grid grid-cols-2 divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] px-4 sm:grid-cols-4 sm:divide-x">
        <div className="py-3 pr-4">
          <Stat
            label="Invested"
            value={totals ? formatCompactMoney(totals.invested) : "—"}
            detail={`${totals?.holdingCount ?? 0} holding${totals?.holdingCount === 1 ? "" : "s"}`}
          />
        </div>
        <div className="py-3 sm:px-4">
          <Stat
            label="Current value"
            value={totals ? formatCompactMoney(totals.currentValue) : "—"}
            detail={
              totals?.unpricedHoldings
                ? `${totals.unpricedHoldings} awaiting a price`
                : "Live public quotes"
            }
          />
        </div>
        <div className="py-3 pr-4 sm:px-4">
          <Stat
            label="Overall P&L"
            value={totals ? formatCompactMoney(totals.pnl) : "—"}
            detail={totals ? formatPercent(totals.pnlPercent) : "—"}
            tone={
              totals ? (totals.pnl > 0 ? "positive" : totals.pnl < 0 ? "negative" : undefined) : undefined
            }
          />
        </div>
        <div className="py-3 sm:pl-4">
          <Stat
            label="Today"
            value={totals ? formatCompactMoney(totals.dayChange) : "—"}
            detail="Across priced holdings"
            tone={
              totals
                ? totals.dayChange > 0
                  ? "positive"
                  : totals.dayChange < 0
                    ? "negative"
                    : undefined
                : undefined
            }
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* ── Holdings ── */}
        <div className={CARD}>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Your holdings</h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Prices refresh on demand; the API caches quotes for about a minute.
              </p>
            </div>
            <span className="shrink-0 text-right text-xs text-[var(--text-muted)]">
              {holdings.length} record{holdings.length === 1 ? "" : "s"}
              {totals?.realizedGain ? (
                <span
                  className={`mt-0.5 block tabular-nums ${
                    totals.realizedGain >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  Realised {formatMoney(totals.realizedGain)}
                </span>
              ) : null}
            </span>
          </div>

          {loading && !portfolio ? (
            <div className="mt-4 space-y-2" role="status" aria-label="Loading portfolio">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} height={54} />
              ))}
            </div>
          ) : holdings.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--border)] px-5 py-8 text-center">
              <FiTrendingUp className="mx-auto mb-3 text-[var(--text-muted)]" size={22} />
              <p className="text-sm font-semibold">No holdings recorded yet</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-[var(--text-secondary)]">
                Add a stock or mutual fund you already own. FinTrack values it with
                public market data and keeps the cost basis, so you can see the real
                gain or loss without a broker login.
              </p>
              <Button
                onClick={openDialog}
                variant="contained"
                startIcon={<FiPlus size={15} />}
                sx={{ mt: 2, textTransform: "none", fontWeight: 600 }}
              >
                Add your first holding
              </Button>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--border)]">
              {holdings.map((holding) => (
                <li
                  key={holding._id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-sm font-semibold">{holding.name}</span>
                      <KindBadge kind={holding.kind} />
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                      {holding.symbol}
                      {holding.exchange ? ` · ${holding.exchange}` : ""} ·{" "}
                      {holding.units} × {formatMoney(holding.avgCost)}
                      {holding.ledgerUntracked
                        ? " · no trade history"
                        : ` · ${holding.transactionCount} trade${
                            holding.transactionCount === 1 ? "" : "s"
                          }`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {holding.currentValue == null
                          ? formatMoney(holding.invested)
                          : formatMoney(holding.currentValue)}
                      </p>
                      {holding.priceUnavailable ? (
                        <p className="text-[10.5px] text-[var(--text-muted)]">
                          Price unavailable · cost basis
                        </p>
                      ) : (
                        <p
                          className={`text-[11px] font-semibold tabular-nums ${
                            holding.pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {holding.pnl >= 0 ? "+" : ""}
                          {formatMoney(holding.pnl)} ({formatPercent(holding.pnlPercent)})
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openLedger(holding)}
                      aria-label={`Trade history for ${holding.name}`}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
                    >
                      <FiClock size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHolding(holding)}
                      aria-label={`Remove ${holding.name}`}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-rose-500"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Allocation ── */}
        <div className={CARD}>
          <h2 className="text-sm font-semibold">Where the value sits</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            By current market value, priced holdings only
          </p>

          {!portfolio?.allocation?.length ? (
            <p className="mt-5 text-xs text-[var(--text-muted)]">
              Add a holding with a live price to see the split.
            </p>
          ) : (
            <ul className="mt-4 space-y-3.5">
              {portfolio.allocation.map((row) => (
                <li key={row.symbol}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-xs text-[var(--text-primary)]">
                      {row.name}
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-[var(--text-secondary)]">
                      {formatCompactMoney(row.value)} · {row.share}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-[var(--surface-secondary)]">
                    <div
                      className="h-1.5 rounded-full bg-[var(--accent-electric)]"
                      style={{ width: `${Math.max(row.share, 2)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 border-t border-[var(--border)] pt-3 text-[10.5px] leading-relaxed text-[var(--text-muted)]">
            Quotes are delayed public data (Yahoo Finance / AMFI via MFAPI) and are
            not investment advice. FinTrack stores only your units and average cost.
          </p>
        </div>
      </div>

      {/* ── Goal planner ── */}
      <div className={CARD}>
        <div className="flex items-start gap-2">
          <FiTarget className="mt-0.5 text-[var(--accent-electric)]" size={17} />
          <div>
            <h2 className="text-sm font-semibold">Goal-based suggestion</h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Uses your last three months of income and expenses to size a monthly
              contribution. The expected return is yours to set and is shown in the
              result.
            </p>
          </div>
        </div>

        <form onSubmit={runPlan} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <TextField
            label="Target amount (₹)"
            type="number"
            size="small"
            value={planInput.targetAmount}
            onChange={(event) => setPlanInput({ ...planInput, targetAmount: event.target.value })}
            inputProps={{ min: 1000, step: 1000 }}
          />
          <TextField
            label="Years"
            type="number"
            size="small"
            value={planInput.years}
            onChange={(event) => setPlanInput({ ...planInput, years: event.target.value })}
            inputProps={{ min: 1, max: 50 }}
          />
          <TextField
            label="Expected return %"
            type="number"
            size="small"
            value={planInput.expectedReturn}
            onChange={(event) => setPlanInput({ ...planInput, expectedReturn: event.target.value })}
            inputProps={{ min: 1, max: 30, step: 0.5 }}
          />
          <TextField
            label="Already saving / month (₹)"
            type="number"
            size="small"
            value={planInput.existingMonthly}
            onChange={(event) => setPlanInput({ ...planInput, existingMonthly: event.target.value })}
            inputProps={{ min: 0, step: 500 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={planning}
            startIcon={<FiActivity size={15} />}
            sx={{ textTransform: "none", fontWeight: 600, alignSelf: "stretch" }}
          >
            {planning ? "Calculating…" : "Build plan"}
          </Button>
        </form>

        {planError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {planError}
          </Alert>
        )}

        {plan && (
          <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Monthly surplus"
                value={formatCompactMoney(plan.snapshot.monthlySurplus)}
                detail={`${formatCompactMoney(plan.snapshot.avgMonthlyIncome)} income − ${formatCompactMoney(plan.snapshot.avgMonthlyExpenses)} expenses`}
              />
              <Stat
                label="Required per month"
                value={formatCompactMoney(plan.goal.requiredMonthly)}
                detail={`At ${plan.goal.expectedReturn}% for ${plan.goal.years} years`}
              />
              <Stat
                label="Suggested contribution"
                value={formatCompactMoney(plan.goal.suggestedMonthly)}
                detail={`Cap: 40% of surplus (${formatCompactMoney(plan.goal.contributionCap)})`}
                tone={plan.goal.feasible ? "positive" : "negative"}
              />
              <Stat
                label="Emergency fund first"
                value={formatCompactMoney(plan.snapshot.avgMonthlyExpenses * 6)}
                detail="Six months of average expenses"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                  Suggested split for {plan.goal.years} years
                </h3>
                <ul className="mt-2 space-y-2">
                  {plan.allocation.map((row) => (
                    <li key={row.asset} className="text-xs">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">{row.asset}</span>
                        <span className="tabular-nums text-[var(--text-secondary)]">{row.share}%</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">{row.idea}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                  What this means
                </h3>
                <ul className="mt-2 space-y-2">
                  {plan.recommendations.map((line) => (
                    <li key={line} className="flex gap-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      <FiTrendingUp className="mt-0.5 shrink-0 text-[var(--accent-electric)]" size={12} />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[10.5px] text-[var(--text-muted)]">
              Projection at a constant {plan.goal.expectedReturn}% annual return;
              actual market returns vary and can be negative. This is a planning
              estimate, not a recommendation to buy a specific security.
            </p>
          </div>
        )}
      </div>

      {/* ── Trade history dialog ── */}
      <Dialog
        open={Boolean(ledgerHolding)}
        onClose={tradeSaving ? undefined : closeLedger}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          {ledgerHolding?.name} · history
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {ledgerError && <Alert severity="error">{ledgerError}</Alert>}

            {ledgerLoading ? (
              <div className="space-y-2">
                <Skeleton height={54} />
                <Skeleton height={96} />
              </div>
            ) : (
              <>
                {ledger?.untracked && (
                  <Alert severity="info">
                    This holding was recorded as a single position. Your first trade
                    adds an opening buy so the history stays complete.
                  </Alert>
                )}

                <div className="grid grid-cols-3 gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
                  <Stat label="Units now" value={ledger ? ledger.units : "—"} />
                  <Stat
                    label="Average cost"
                    value={ledger ? formatMoney(ledger.avgCost) : "—"}
                  />
                  <Stat
                    label="Realised gain"
                    value={ledger ? formatMoney(ledger.realizedGain) : "—"}
                    tone={
                      ledger
                        ? ledger.realizedGain > 0
                          ? "positive"
                          : ledger.realizedGain < 0
                            ? "negative"
                            : undefined
                        : undefined
                    }
                  />
                </div>

                {transactions.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">
                    No trades recorded for this holding yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--border)]">
                    {transactions.map((row) => (
                      <li
                        key={row._id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">
                            {row.type === "BUY" ? "Buy" : "Sell"} {row.units} ×{" "}
                            {formatMoney(row.price)}
                          </p>
                          <p className="truncate text-[10.5px] text-[var(--text-muted)]">
                            {new Date(row.tradedAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            {row.notes ? ` · ${row.notes}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-xs tabular-nums">
                            {formatMoney(row.units * row.price)}
                          </span>
                          <button
                            type="button"
                            disabled={tradeSaving}
                            onClick={() => removeTrade(row)}
                            aria-label={`Remove ${row.type} of ${row.units} units`}
                            className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-rose-500 disabled:opacity-40"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <form
                  onSubmit={submitTrade}
                  className="grid gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2"
                >
                  <TextField
                    select
                    label="Type"
                    size="small"
                    value={trade.type}
                    onChange={(event) =>
                      setTrade({ ...trade, type: event.target.value })
                    }
                  >
                    <MenuItem value="BUY">Buy</MenuItem>
                    <MenuItem value="SELL">Sell</MenuItem>
                  </TextField>
                  <TextField
                    label="Units"
                    type="number"
                    size="small"
                    value={trade.units}
                    onChange={(event) =>
                      setTrade({ ...trade, units: event.target.value })
                    }
                    inputProps={{ min: 0, step: "any" }}
                    required
                  />
                  <TextField
                    label="Price per unit (₹)"
                    type="number"
                    size="small"
                    value={trade.price}
                    onChange={(event) =>
                      setTrade({ ...trade, price: event.target.value })
                    }
                    inputProps={{ min: 0, step: "any" }}
                    required
                  />
                  <TextField
                    label="Trade date"
                    type="date"
                    size="small"
                    value={trade.tradedAt}
                    onChange={(event) =>
                      setTrade({ ...trade, tradedAt: event.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={tradeSaving}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      {tradeSaving
                        ? "Saving…"
                        : `Record ${trade.type === "BUY" ? "buy" : "sell"}`}
                    </Button>
                  </div>
                </form>

                <p className="text-[10.5px] text-[var(--text-muted)]">
                  Units and average cost are derived from these trades. Selling
                  realises gain against the average cost at that date; removing a
                  buy a later sale depends on is refused.
                </p>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={closeLedger}
            disabled={tradeSaving}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add holding dialog ── */}
      <Dialog open={dialogOpen} onClose={saving ? undefined : () => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Add a holding</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <div>
              <label htmlFor="instrument-search" className="text-xs font-medium text-[var(--text-secondary)]">
                Find a stock or mutual fund
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3">
                <FiSearch size={14} className="text-[var(--text-muted)]" />
                <input
                  id="instrument-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="e.g. Reliance, Nifty index fund"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                />
                {searching && <span className="text-[10px] text-[var(--text-muted)]">Searching…</span>}
              </div>

              {results.length > 0 && (
                <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-1">
                  {results.map((asset) => (
                    <li key={`${asset.kind}-${asset.symbol}`}>
                      <button
                        type="button"
                        onClick={() => chooseAsset(asset)}
                        className={`flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--surface-secondary)] ${
                          selected?.symbol === asset.symbol ? "bg-[var(--surface-secondary)]" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium">{asset.name}</span>
                          <span className="block truncate text-[10.5px] text-[var(--text-muted)]">
                            {asset.symbol} · {asset.exchange || asset.type}
                          </span>
                        </span>
                        <KindBadge kind={asset.kind} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {searchTerm.trim().length >= 2 && !searching && results.length === 0 && (
                <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                  No match. Try the company name, NSE symbol, or the fund house name.
                </p>
              )}
            </div>

            {selected && (
              <>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2">
                  <p className="text-xs font-semibold">{selected.name}</p>
                  <p className="text-[10.5px] text-[var(--text-muted)]">
                    {selected.symbol}
                    {selected.exchange ? ` · ${selected.exchange}` : ""}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label={selected.kind === "FUND" ? "Units held" : "Shares held"}
                    type="number"
                    size="small"
                    value={form.units}
                    onChange={(event) => setForm({ ...form, units: event.target.value })}
                    inputProps={{ min: 0, step: "any" }}
                    required
                  />
                  <TextField
                    label="Average cost per unit (₹)"
                    type="number"
                    size="small"
                    value={form.avgCost}
                    onChange={(event) => setForm({ ...form, avgCost: event.target.value })}
                    inputProps={{ min: 0, step: "any" }}
                    required
                  />
                  <TextField
                    label="Holding since"
                    type="date"
                    size="small"
                    value={form.investedAt}
                    onChange={(event) => setForm({ ...form, investedAt: event.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
              </>
            )}

            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              Enter what you already own. FinTrack does not connect to a broker,
              place orders, or ask for trading credentials.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveHolding}
            disabled={saving || !selected}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {saving ? "Saving…" : "Add holding"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ height: 4 }} />
    </section>
  );
};

export default InvestmentPortfolio;
