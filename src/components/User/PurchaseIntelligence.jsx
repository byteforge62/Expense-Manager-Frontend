import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../Utils/axiosInstance";

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
    <section className="space-y-6 text-[var(--text-primary)]">
      <header>
        <h1 className="text-2xl font-bold">Purchase Intelligence</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Track products, prices and backend-provided affordability analysis.</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-600">{error}</p>}

      <form onSubmit={addProduct} className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">Product name<input required minLength="2" maxLength="160" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <label className="space-y-1 text-sm">Current price<input required type="number" min="0.01" step="0.01" value={form.currentPrice} onChange={(event) => setForm({ ...form, currentPrice: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <label className="space-y-1 text-sm">Currency code<input required minLength="3" maxLength="3" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <label className="space-y-1 text-sm">Category (optional)<input maxLength="80" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <label className="space-y-1 text-sm">Target price (optional)<input type="number" min="0.01" step="0.01" value={form.targetPrice} onChange={(event) => setForm({ ...form, targetPrice: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <label className="space-y-1 text-sm">Product URL (optional)<input type="url" value={form.productUrl} onChange={(event) => setForm({ ...form, productUrl: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"><FiPlus />{saving ? "Saving…" : "Add product"}</button>
          <button type="button" onClick={importUrl} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 font-medium"><FiSearch />Resolve URL</button>
          <button type="button" onClick={loadProducts} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 font-medium"><FiRefreshCw />Refresh</button>
        </div>
      </form>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">Available cash (INR) for analysis<input type="number" min="0" step="0.01" value={availableCash} onChange={(event) => setAvailableCash(event.target.value)} className="block rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2" /></label>
        <p className="text-xs text-[var(--text-muted)]">This amount is supplied by you; the app does not infer a balance. The backend affordability model uses INR.</p>
      </div>

      {loading ? <p role="status">Loading tracked products…</p> : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-lg font-semibold">Your watchlist is ready</p><p className="mt-1 text-sm text-[var(--text-muted)]">Add a product to track its current and target price.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <article key={product._id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-primary)] p-5">
              <div className="flex justify-between gap-3">
                <div><h2 className="font-bold">{product.name}</h2><p className="text-xs text-[var(--text-muted)]">{product.category || "Uncategorized"} · {product.status || "CONSIDERING"}</p></div>
                <button aria-label={`Delete ${product.name}`} onClick={() => removeProduct(product._id)} className="text-rose-500"><FiTrash2 /></button>
              </div>
              <p className="mt-4 text-xl font-bold">{product.currency} {product.currentPrice}</p>
              {product.targetPrice != null && <p className="text-sm text-[var(--text-muted)]">Target: {product.currency} {product.targetPrice}</p>}
              <button disabled={product.currency !== "INR"} onClick={() => analyze(product)} className="mt-4 rounded-lg bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-600 disabled:cursor-not-allowed disabled:opacity-50">Analyze affordability</button>
              <label className="mt-4 block text-xs text-[var(--text-muted)]">Status
                <select value={product.status || "CONSIDERING"} onChange={(event) => updateStatus(product, event.target.value)} className="ml-2 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] px-2 py-1 text-[var(--text-primary)]">
                  {["CONSIDERING", "WATCHLIST", "PURCHASED", "CANCELLED"].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              {analyses[product._id]?.analysis && (
                <div className="mt-4 rounded-xl bg-[var(--surface-secondary)] p-3 text-sm">
                  <p className="font-semibold">{analyses[product._id].analysis.risk?.recommendation?.replaceAll("_", " ") || "Analysis available"}</p>
                  <p className="mt-1">{analyses[product._id].analysis.risk?.summary || "No summary provided."}</p>
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
  );
};

export default PurchaseIntelligence;
