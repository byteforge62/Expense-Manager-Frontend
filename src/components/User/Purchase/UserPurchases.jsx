import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiImage,
  FiPlus,
  FiX,
} from "react-icons/fi";

import emptyActivity from "../../../assets/illustrations/empty-activity.svg";
import { PurchaseIntelligence } from "../PurchaseIntelligence";
import { PurchaseSummary } from "./PurchaseSummary";
import { PurchaseDialog } from "./PurchaseDialog";
import { PurchaseDetailDialog } from "./PurchaseDetailDialog";
import { StoreConnections } from "./StoreConnections";
import {
  PURCHASE_CATEGORIES,
  PURCHASE_STATUSES,
  STATUS_LABELS,
  dateRangeForPreset,
  deletePurchase,
  fetchExpenseCategories,
  fetchPurchaseSummary,
  formatMoney,
  formatPurchaseDate,
  listPurchases,
} from "./purchasesApi";

const PAGE_SIZE = 20;

const selectClass =
  "rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-2 text-sm text-[var(--text-primary)]";

const ProductThumb = ({ purchase, size = 56 }) => (
  <div
    className="shrink-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-secondary)]"
    style={{ width: size, height: size }}
  >
    {purchase.imageUrl ? (
      <img
        src={purchase.imageUrl}
        alt={`Product thumbnail for ${purchase.name}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
        <FiImage size={18} aria-hidden="true" />
      </div>
    )}
  </div>
);

/**
 * Purchase log — the user-facing home of the purchase record module.
 *
 * Tabs keep the existing price-watchlist workflow reachable without mixing it
 * into the purchase ledger.
 */
export const UserPurchases = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("log");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    merchant: "",
    status: "",
    preset: "all",
    sortBy: "purchaseDate",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [purchases, setPurchases] = useState([]);
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [formOpen, setFormOpen] = useState(searchParams.get("action") === "add");
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters.search]);

  const range = useMemo(() => dateRangeForPreset(filters.preset), [filters.preset]);

  const queryParams = useMemo(() => {
    const params = {
      sortBy: filters.sortBy,
      sortOrder: filters.sortBy === "purchaseDate" ? "desc" : "desc",
      page,
      limit: PAGE_SIZE,
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.category) params.category = filters.category;
    if (filters.merchant) params.merchant = filters.merchant;
    if (filters.status) params.status = filters.status;
    if (range.startDate) params.startDate = range.startDate;
    if (range.endDate) params.endDate = range.endDate;

    return params;
  }, [debouncedSearch, filters.category, filters.merchant, filters.status, filters.sortBy, range, page]);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listPurchases(queryParams);
      setPurchases(result.items);
      setMeta(result.meta);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Purchases could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.category) params.category = filters.category;
      if (filters.merchant) params.merchant = filters.merchant;
      if (filters.status) params.status = filters.status;
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      setSummary(await fetchPurchaseSummary(params));
    } catch {
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [debouncedSearch, filters.category, filters.merchant, filters.status, range]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    let active = true;

    fetchExpenseCategories()
      .then((result) => {
        if (active) setCategories(result);
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);

    if (searchParams.get("action")) {
      const next = new URLSearchParams(searchParams);
      next.delete("action");
      setSearchParams(next, { replace: true });
    }
  };

  const handleSaved = (saved, wasEdit) => {
    const warnings = Array.isArray(saved?.warnings) ? saved.warnings : [];

    setNotice(
      warnings.length > 0
        ? warnings.join(" ")
        : wasEdit
          ? "Purchase updated."
          : "Purchase recorded.",
    );

    loadPurchases();
    loadSummary();
  };

  const handleDelete = async (purchase) => {
    await deletePurchase(purchase._id);
    setNotice(
      purchase.linkedExpenseId
        ? "Purchase and its linked expense were deleted."
        : "Purchase deleted.",
    );
    setDetail(null);
    loadPurchases();
    loadSummary();
  };

  const activeFilters =
    Boolean(debouncedSearch) ||
    Boolean(filters.category) ||
    Boolean(filters.merchant) ||
    Boolean(filters.status) ||
    filters.preset !== "all";

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      merchant: "",
      status: "",
      preset: "all",
      sortBy: "purchaseDate",
    });
    setPage(1);
  };

  const merchantOptions = (summary?.byMerchant || []).map((row) => row.merchant);

  return (
    <section className="space-y-6 text-[var(--text-primary)]">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Purchases</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">
            Keep what you buy, where you bought it and what it cost in one place —
            with an optional link to the matching expense.
          </p>
        </div>
        <Button
          variant="contained"
          onClick={openCreate}
          startIcon={<FiPlus size={16} />}
          sx={{ textTransform: "none", fontWeight: 600, alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Record purchase
        </Button>
      </header>

      <StoreConnections
        onRecordsChanged={() => {
          loadPurchases();
          loadSummary();
        }}
      />

      <div className="flex gap-1 border-b border-[var(--border)]" role="tablist" aria-label="Purchase views">
        {[
          { id: "log", label: "Purchase log" },
          { id: "watchlist", label: "Price watchlist" },
        ].map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === item.id
                ? "border-[var(--accent-electric)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "watchlist" ? (
        <PurchaseIntelligence />
      ) : (
        <div className="space-y-5">
          {notice && (
            <Alert severity="success" onClose={() => setNotice("")}>
              {notice}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              icon={<FiAlertCircle size={18} />}
              action={
                <Button color="inherit" size="small" onClick={loadPurchases} sx={{ textTransform: "none" }}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <PurchaseSummary summary={summary} isLoading={loadingSummary} />

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-primary)] p-3">
            <label className="sr-only" htmlFor="purchase-search">
              Search purchases
            </label>
            <input
              id="purchase-search"
              type="search"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search product, store or order ID"
              className="min-w-[220px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />

            <label className="sr-only" htmlFor="purchase-category">
              Filter by category
            </label>
            <select
              id="purchase-category"
              className={selectClass}
              value={filters.category}
              onChange={(event) => {
                setFilters((current) => ({ ...current, category: event.target.value }));
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {PURCHASE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="purchase-merchant">
              Filter by store
            </label>
            <select
              id="purchase-merchant"
              className={selectClass}
              value={filters.merchant}
              onChange={(event) => {
                setFilters((current) => ({ ...current, merchant: event.target.value }));
                setPage(1);
              }}
            >
              <option value="">All stores</option>
              {merchantOptions.map((merchant) => (
                <option key={merchant} value={merchant}>
                  {merchant}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="purchase-status">
              Filter by status
            </label>
            <select
              id="purchase-status"
              className={selectClass}
              value={filters.status}
              onChange={(event) => {
                setFilters((current) => ({ ...current, status: event.target.value }));
                setPage(1);
              }}
            >
              <option value="">Any status</option>
              {PURCHASE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="purchase-range">
              Filter by date range
            </label>
            <select
              id="purchase-range"
              className={selectClass}
              value={filters.preset}
              onChange={(event) => {
                setFilters((current) => ({ ...current, preset: event.target.value }));
                setPage(1);
              }}
            >
              <option value="all">All time</option>
              <option value="thisMonth">This month</option>
              <option value="last3Months">Last 3 months</option>
              <option value="thisYear">This year</option>
            </select>

            <label className="sr-only" htmlFor="purchase-sort">
              Sort purchases
            </label>
            <select
              id="purchase-sort"
              className={selectClass}
              value={filters.sortBy}
              onChange={(event) => {
                setFilters((current) => ({ ...current, sortBy: event.target.value }));
                setPage(1);
              }}
            >
              <option value="purchaseDate">Newest first</option>
              <option value="totalAmount">Highest amount</option>
              <option value="createdAt">Recently added</option>
            </select>

            {activeFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
              >
                <FiX size={13} /> Clear
              </button>
            )}
          </div>

          <section aria-labelledby="purchase-list-heading">
            <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2.5">
              <h2 id="purchase-list-heading" className="text-sm font-semibold">
                Purchase history
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                {meta?.pagination?.total ?? purchases.length} record
                {(meta?.pagination?.total ?? purchases.length) === 1 ? "" : "s"}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-4" role="status" aria-label="Loading purchases">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex gap-3">
                    <Skeleton variant="rounded" width={56} height={56} />
                    <div className="flex-1">
                      <Skeleton width="45%" height={18} />
                      <Skeleton width="30%" height={14} />
                    </div>
                  </div>
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-10 text-center">
                <img
                  src={emptyActivity}
                  alt=""
                  aria-hidden="true"
                  className="mx-auto mb-4 h-24 w-auto opacity-90"
                />
                <Typography sx={{ fontWeight: 600 }}>
                  {activeFilters ? "No purchases match these filters" : "No purchases recorded yet"}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: 13.5, color: "text.secondary" }}>
                  {activeFilters
                    ? "Clear the filters to see your full purchase history."
                    : "Record a purchase from any store, add an optional photo, and FinTrack keeps the item and its cost together."}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2.5 }}>
                  {activeFilters ? (
                    <Button variant="outlined" onClick={clearFilters} sx={{ textTransform: "none" }}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={openCreate}
                      startIcon={<FiPlus size={15} />}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Record your first purchase
                    </Button>
                  )}
                </Stack>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {purchases.map((purchase) => (
                  <li key={purchase._id}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`View purchase ${purchase.name}`}
                      onClick={() => setDetail(purchase)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setDetail(purchase);
                        }
                      }}
                      className="flex cursor-pointer gap-3 rounded-lg px-1 py-4 transition-colors hover:bg-[var(--surface-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-electric)]"
                    >
                      <ProductThumb purchase={purchase} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold">{purchase.name}</h3>
                            <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                              {purchase.merchant || "Store not recorded"} ·{" "}
                              {formatPurchaseDate(purchase.purchaseDate)}
                              {purchase.orderId ? ` · #${purchase.orderId}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold tabular-nums">
                              {formatMoney(purchase.totalAmount)}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {purchase.quantity} × {formatMoney(purchase.unitPrice)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--text-muted)]">
                          <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                            {purchase.category || "Other"}
                          </span>
                          <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                            {STATUS_LABELS[purchase.status] || purchase.status}
                          </span>
                          {purchase.linkedExpenseId && (
                            <span className="text-[var(--accent-electric)]">In expenses</span>
                          )}
                          {purchase.productUrl && (
                            <a
                              href={purchase.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-[var(--text-primary)]"
                            >
                              Product page <FiExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {meta?.pagination && meta.pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                <p className="text-xs text-[var(--text-muted)]">
                  Page {meta.pagination.page} of {meta.pagination.totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<FiChevronLeft size={14} />}
                    disabled={!meta.pagination.hasPreviousPage}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    sx={{ textTransform: "none" }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    endIcon={<FiChevronRight size={14} />}
                    disabled={!meta.pagination.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                    sx={{ textTransform: "none" }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      <PurchaseDialog
        open={formOpen}
        purchase={editing}
        categories={categories}
        onClose={closeForm}
        onSaved={handleSaved}
      />

      <PurchaseDetailDialog
        open={Boolean(detail)}
        purchase={detail}
        onClose={() => setDetail(null)}
        onEdit={(purchase) => {
          setDetail(null);
          setEditing(purchase);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
      />
    </section>
  );
};

export default UserPurchases;
