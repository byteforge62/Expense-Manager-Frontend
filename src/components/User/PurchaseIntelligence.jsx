import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../Utils/axiosInstance";
import purchaseWatchlist from "../../assets/illustrations/purchase-watchlist.svg";

const errorText = (error) =>
  error.response?.data?.message || error.message || "The request could not be completed.";

const initialProduct = {
  name: "",
  currentPrice: "",
  currency: "INR",
  category: "",
  productUrl: "",
  imageUrl: "",
  targetPrice: "",
  notes: "",
};

export const PurchaseIntelligence = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialProduct);
  const [availableCash, setAvailableCash] = useState("");
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/purchase-intelligence");
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const addProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        currentPrice: Number(form.currentPrice),
        currency: form.currency,
        ...(form.targetPrice !== "" ? { targetPrice: Number(form.targetPrice) } : {}),
        ...(form.productUrl ? { productUrl: form.productUrl } : {}),
        ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
        ...(form.category ? { category: form.category } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
      };
      await axiosInstance.post("/purchase-intelligence", payload);
      setForm(initialProduct);
      await loadProducts();
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setSaving(false);
    }
  };

  const importUrl = async () => {
    const url = window.prompt("Enter the product URL to resolve");
    if (!url) return;
    setError("");
    try {
      const response = await axiosInstance.post("/purchase-intelligence/resolve-url", { url });
      const metadata = response.data.data;
      setForm((current) => ({
        ...current,
        name: metadata?.name || current.name,
        currentPrice: metadata?.currentPrice ?? current.currentPrice,
        currency: metadata?.currency || current.currency,
        imageUrl: metadata?.imageUrl || current.imageUrl,
        productUrl: metadata?.productUrl || url,
      }));
    } catch (requestError) {
      setError(errorText(requestError));
    }
  };

  const analyze = async (product) => {
    if (product.currency !== "INR") {
      setError("Affordability analysis is available only for INR-priced products; no currency conversion is provided.");
      return;
    }
    if (availableCash === "") {
      setError("Enter available cash before running affordability analysis.");
      return;
    }
    setError("");
    try {
      const response = await axiosInstance.post(
        `/purchase-intelligence/${product._id}/analyze`,
        { availableCash: Number(availableCash) },
      );
      setAnalyses((current) => ({ ...current, [product._id]: response.data.data }));
    } catch (requestError) {
      setError(errorText(requestError));
    }
  };

  const removeProduct = async (id) => {
    setError("");
    try {
      await axiosInstance.delete(`/purchase-intelligence/${id}`);
      setProducts((current) => current.filter((product) => product._id !== id));
    } catch (requestError) {
      setError(errorText(requestError));
    }
  };

  const updateStatus = async (product, status) => {
    setError("");
    try {
      const response = await axiosInstance.patch(
        `/purchase-intelligence/${product._id}`,
        { status },
      );
      setProducts((current) => current.map((item) =>
        item._id === product._id ? response.data.data : item,
      ));
    } catch (requestError) {
      setError(errorText(requestError));
    }
  };

  return (
    <section className="space-y-7 text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-electric)]">Planning / Decisions</p>
        <h1 className="mt-2 text-2xl font-bold">Purchase intelligence</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Track prices and review affordability using cash you provide.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-600">{error}</p>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="order-2 space-y-6 xl:order-1">
          <section aria-label="Affordability analysis" className="grid gap-4 rounded-2xl border border-[#354152] bg-[#171b23] p-5 text-[#e9e7e0] sm:grid-cols-[minmax(180px,0.7fr)_minmax(0,1.3fr)] sm:items-center">
            <label className="space-y-2 text-sm font-medium">
              Available cash (INR) for analysis
              <input type="number" min="0" step="0.01" value={availableCash} onChange={(event) => setAvailableCash(event.target.value)} className="w-full rounded-lg border border-[#465160] bg-[#222a36] px-3 py-2.5 text-[#e9e7e0]" />
            </label>
            <p className="text-sm leading-relaxed text-[#aab3bf]">
              This amount comes from you; Fintrack does not infer your balance. The affordability model supports INR-priced products.
            </p>
          </section>

          <section aria-labelledby="watchlist-heading">
            <div className="mb-2 flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 id="watchlist-heading" className="font-semibold">Product watchlist</h2>
              <span className="text-xs text-[var(--text-muted)]">{products.length} tracked</span>
            </div>
            {loading ? <p role="status" className="py-8 text-sm text-[var(--text-muted)]">Loading tracked products…</p> : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
                <img src={purchaseWatchlist} alt="" aria-hidden="true" className="mx-auto mb-4 h-24 w-32" />
                <p className="font-semibold">No products tracked</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Add a product to keep its current and target price in view.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {products.map((product) => (
                  <article key={product._id} className="py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{product.category || "Uncategorized"} · {product.status || "CONSIDERING"}</p>
                      </div>
                      <button aria-label={`Delete ${product.name}`} onClick={() => removeProduct(product._id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-500/10"><FiTrash2 /></button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-xl font-semibold tabular-nums">{product.currency} {product.currentPrice}</p>
                        {product.targetPrice != null && <p className="mt-1 text-sm text-[var(--text-muted)]">Target: {product.currency} {product.targetPrice}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button disabled={product.currency !== "INR"} onClick={() => analyze(product)} className="rounded-lg bg-[var(--accent-electric-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent-electric)] disabled:cursor-not-allowed disabled:opacity-50">Analyze affordability</button>
                        <label className="sr-only" htmlFor={`status-${product._id}`}>Status for {product.name}</label>
                        <select id={`status-${product._id}`} value={product.status || "CONSIDERING"} onChange={(event) => updateStatus(product, event.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2 py-2 text-xs text-[var(--text-primary)]">
                          {["CONSIDERING", "WATCHLIST", "PURCHASED", "CANCELLED"].map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                    </div>
                    {analyses[product._id]?.analysis && (
                      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-4 text-sm">
                        <p className="font-semibold">{analyses[product._id].analysis.risk?.recommendation?.replaceAll("_", " ") || "Analysis available"}</p>
                        <p className="mt-1 text-[var(--text-secondary)]">{analyses[product._id].analysis.risk?.summary || "No summary provided."}</p>
                        <p className="mt-2 text-xs text-[var(--text-muted)]">Confidence: {analyses[product._id].analysis.historyConfidence || "Unavailable"}</p>
                        {Array.isArray(analyses[product._id].analysis.warnings) && analyses[product._id].analysis.warnings.length > 0 && (
                          <ul className="mt-2 list-inside list-disc text-xs text-[var(--text-muted)]">{analyses[product._id].analysis.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="order-1 h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-5 xl:order-2">
          <h2 className="mb-4 font-semibold">Track a product</h2>
          <form onSubmit={addProduct} className="grid gap-4">
            <label className="space-y-1 text-sm">Product name<input required minLength="2" maxLength="160" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">Current price<input required type="number" min="0.01" step="0.01" value={form.currentPrice} onChange={(event) => setForm({ ...form, currentPrice: event.target.value })} className="w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
              <label className="space-y-1 text-sm">Currency<input required minLength="3" maxLength="3" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} className="w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
            </div>
            <label className="space-y-1 text-sm">Category (optional)<input maxLength="80" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
            <label className="space-y-1 text-sm">Target price (optional)<input type="number" min="0.01" step="0.01" value={form.targetPrice} onChange={(event) => setForm({ ...form, targetPrice: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
            <label className="space-y-1 text-sm">Product URL (optional)<input type="url" value={form.productUrl} onChange={(event) => setForm({ ...form, productUrl: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3985ff] px-4 py-2.5 font-semibold text-[#101a2b] disabled:opacity-60"><FiPlus />{saving ? "Saving…" : "Add product"}</button>
            <button type="button" onClick={importUrl} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium"><FiSearch />Resolve product URL</button>
            <button type="button" onClick={loadProducts} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-secondary)]"><FiRefreshCw />Refresh watchlist</button>
          </form>
        </aside>
      </div>
    </section>
  );
};

export default PurchaseIntelligence;
