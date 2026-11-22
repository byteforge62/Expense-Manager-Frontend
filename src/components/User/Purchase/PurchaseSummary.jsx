import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactMoney, formatMonth, formatMoney } from "./purchasesApi";

/**
 * Purchase analytics. Values arrive from `/purchases/summary`; nothing here is
 * recalculated, so the page cannot disagree with the API about a total.
 */

const Figure = ({ label, value, detail }) => (
  <div className="min-w-0 px-4 py-4 first:pl-0 last:pr-0">
    <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
    <p className="mt-1.5 truncate text-xl font-semibold tabular-nums text-[var(--text-primary)]">
      {value}
    </p>
    {detail ? (
      <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{detail}</p>
    ) : null}
  </div>
);

export const PurchaseSummary = ({ summary, isLoading }) => {
  if (isLoading && !summary) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-5">
        <p role="status" className="text-sm text-[var(--text-muted)]">
          Loading purchase analytics…
        </p>
      </div>
    );
  }

  if (!summary) return null;

  const { totals, byMerchant, byMonth } = summary;
  const chartData = (byMonth || []).map((row) => ({
    month: formatMonth(row.month),
    spend: row.spend,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] px-4 sm:grid-cols-4 sm:divide-x">
        <Figure
          label="Total spent"
          value={formatMoney(totals.totalSpend)}
          detail={`${totals.purchaseCount} purchase${totals.purchaseCount === 1 ? "" : "s"}`}
        />
        <Figure
          label="Items bought"
          value={totals.itemCount}
          detail="Across all purchases"
        />
        <Figure
          label="Average purchase"
          value={formatMoney(totals.averageSpend)}
          detail="Per recorded purchase"
        />
        <Figure
          label="Stores"
          value={(byMerchant || []).length}
          detail="With recorded spend"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="purchase-monthly-heading"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-5"
        >
          <h3
            id="purchase-monthly-heading"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Monthly purchase spend
          </h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Last 12 months with purchases
          </p>

          {chartData.length === 0 ? (
            <p className="mt-8 mb-6 text-sm text-[var(--text-muted)]">
              No purchases in this period yet.
            </p>
          ) : (
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickFormatter={(value) => formatCompactMoney(value)}
                    width={72}
                  />
                  <Tooltip
                    formatter={(value) => [formatMoney(value), "Spend"]}
                    contentStyle={{
                      background: "var(--surface-primary)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="spend"
                    fill="var(--chart-1, var(--accent-electric))"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section
          aria-labelledby="purchase-merchants-heading"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-5"
        >
          <h3
            id="purchase-merchants-heading"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Spending by store
          </h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Where your purchase money went
          </p>

          {(byMerchant || []).length === 0 ? (
            <p className="mt-8 text-sm text-[var(--text-muted)]">
              Add a merchant to a purchase to see this breakdown.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {byMerchant.slice(0, 6).map((row) => {
                const top = byMerchant[0]?.spend || 1;
                const width = Math.max(4, Math.round((row.spend / top) * 100));
                return (
                  <li key={row.merchant}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-[var(--text-primary)]">
                        {row.merchant}
                      </span>
                      <span className="shrink-0 tabular-nums text-[var(--text-secondary)]">
                        {formatMoney(row.spend)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-[var(--surface-secondary)]">
                      <div
                        className="h-1.5 rounded-full bg-[var(--accent-electric)]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default PurchaseSummary;
