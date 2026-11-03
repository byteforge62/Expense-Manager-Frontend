import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../components/Utils/axiosInstance";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiExternalLink,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

const initialForm = {
  name: "",
  category: "Electronics",
  brand: "",
  currentPrice: "",
  availableCash: "",
  productUrl: "",
  platform: "",
  targetPrice: "",
  notes: "",
  imageUrl: "",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const riskColor = {
  LOW: "success",
  MODERATE: "warning",
  HIGH: "error",
  CRITICAL: "error",
};

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong. Please try again.";

const extractPlatform = (url) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
};

function Metric({ label, value, helper }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>
        {value}
      </Typography>
      {helper ? <Typography variant="caption" color="text.secondary">{helper}</Typography> : null}
    </Box>
  );
}

function ProductCard({ product, availableCash, onAnalyze, onUpdate, onDelete, busyId }) {
  const [newPrice, setNewPrice] = useState(String(product.currentPrice));
  const [listingDraft, setListingDraft] = useState({ platform: "", url: "", price: "" });
  const analysis = product.lastAnalysis?.result;
  const risk = analysis?.risk;
  const isBusy = busyId === product._id;

  return (
    <Card variant="outlined" sx={{ height: "100%", borderRadius: 4, borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
            <Avatar variant="rounded" src={product.imageUrl || undefined} sx={{ bgcolor: "action.hover", color: "primary.main", width: 46, height: 46 }}>
              <FiPackage size={22} />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>{product.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {[product.brand, product.category].filter(Boolean).join(" · ") || "Uncategorized"}
              </Typography>
              <Box sx={{ mt: 0.75 }}>
                <Chip size="small" variant="outlined" label={product.status.replaceAll("_", " ")} />
              </Box>
            </Box>
          </Stack>
          <Button
            size="small"
            color="error"
            aria-label={`Delete ${product.name}`}
            onClick={() => onDelete(product._id)}
            disabled={isBusy}
            sx={{ minWidth: 36, px: 1 }}
          >
            <FiTrash2 />
          </Button>
        </Stack>

        {product.status === "PURCHASED" ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Purchased for {formatCurrency(product.purchasePrice || product.currentPrice)}
            {product.purchaseDate ? ` on ${new Date(product.purchaseDate).toLocaleDateString()}` : ""}.
          </Alert>
        ) : null}

        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Metric label="Current listed price" value={formatCurrency(product.currentPrice)} />
          </Grid>
          <Grid item xs={6}>
            <Metric label="Target price" value={product.targetPrice ? formatCurrency(product.targetPrice) : "Not set"} />
          </Grid>
        </Grid>

        {product.listings?.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">RETAILER RECORD</Typography>
            {product.listings.slice(-3).reverse().map((listing) => (
              <Stack key={listing._id || `${listing.platform}-${listing.observedAt}`} direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
                <Typography variant="body2" sx={{ overflowWrap: "anywhere", mr: 1 }}>{listing.platform}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={700}>{formatCurrency(listing.price)}</Typography>
                  {listing.url ? <Button size="small" component="a" href={listing.url} target="_blank" rel="noreferrer" aria-label={`Open ${listing.platform} listing`}><FiExternalLink /></Button> : null}
                </Stack>
              </Stack>
            ))}
          </Box>
        ) : product.productUrl ? (
          <Button size="small" component="a" href={product.productUrl} target="_blank" rel="noreferrer" endIcon={<FiExternalLink />} sx={{ mt: 1 }}>Open product link</Button>
        ) : null}

        <Box sx={{ mt: 2, p: 1.5, border: 1, borderColor: "divider", borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>ADD ANOTHER RETAILER PRICE</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
              <TextField size="small" fullWidth label="Platform" value={listingDraft.platform} onChange={(event) => setListingDraft((current) => ({ ...current, platform: event.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField size="small" fullWidth label="Listing URL" value={listingDraft.url} onChange={(event) => setListingDraft((current) => ({ ...current, url: event.target.value }))} />
            </Grid>
            <Grid item xs={8} sm={2}>
              <TextField size="small" fullWidth type="number" label="Price ₹" value={listingDraft.price} onChange={(event) => setListingDraft((current) => ({ ...current, price: event.target.value }))} inputProps={{ min: 0.01, step: "0.01" }} />
            </Grid>
            <Grid item xs={4} sm={1}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: 40, minWidth: 0 }}
                disabled={isBusy || (!listingDraft.platform.trim() && !listingDraft.url.trim()) || !listingDraft.price || Number(listingDraft.price) <= 0}
                onClick={() => onUpdate(product._id, { listing: {
                  platform: listingDraft.platform.trim() || extractPlatform(listingDraft.url),
                  url: listingDraft.url.trim() || undefined,
                  price: Number(listingDraft.price),
                } })}
                aria-label="Add retailer listing"
              ><FiPlus /></Button>
            </Grid>
          </Grid>
        </Box>

        {product.priceHistory?.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">RECORDED PRICE HISTORY</Typography>
            {product.priceHistory.slice(-4).reverse().map((observation, index) => (
              <Stack key={`${observation.observedAt}-${index}`} direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{new Date(observation.observedAt).toLocaleDateString()} {observation.platform ? `· ${observation.platform}` : ""}</Typography>
                <Typography variant="caption" fontWeight={700}>{formatCurrency(observation.price)}</Typography>
              </Stack>
            ))}
          </Box>
        ) : null}

        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              type="number"
              label="Record new price"
              value={newPrice}
              onChange={(event) => setNewPrice(event.target.value)}
              inputProps={{ min: 0.01, step: "0.01" }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              disabled={isBusy || !newPrice || Number(newPrice) <= 0 || Number(newPrice) === Number(product.currentPrice)}
              onClick={() => onUpdate(product._id, { currentPrice: Number(newPrice) })}
            >Save price</Button>
          </Stack>
        </Box>

        {risk ? (
          <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: "action.hover" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" fontWeight={800}>Affordability assessment</Typography>
              <Chip size="small" color={riskColor[risk.level] || "default"} label={`${risk.level} RISK`} />
            </Stack>
            <Typography variant="body2" sx={{ mt: 1 }}>{risk.summary}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Recommendation: {risk.recommendation.replaceAll("_", " ").toLowerCase()}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}><Metric label="Cash after purchase" value={formatCurrency(analysis.metrics.cashAfterPurchase)} /></Grid>
              <Grid item xs={6}><Metric label="3-month reserve target" value={formatCurrency(analysis.metrics.emergencyReserveTarget)} /></Grid>
              <Grid item xs={6}><Metric label="Average monthly net" value={formatCurrency(analysis.metrics.averageMonthlyNetCashFlow)} /></Grid>
              <Grid item xs={6}><Metric label="After 15% income drop" value={formatCurrency(analysis.scenarios.incomeFallsBy15Percent)} /></Grid>
              <Grid item xs={6}><Metric label="After one-month expense shock" value={formatCurrency(analysis.scenarios.unexpectedExpenseOfOneAverageMonth)} /></Grid>
              <Grid item xs={6}><Metric label="Savings rate" value={analysis.metrics.savingsRatePercent === null ? "Unavailable" : `${analysis.metrics.savingsRatePercent.toFixed(1)}%`} /></Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
              History confidence: {analysis.historyConfidence}. Analyzed {new Date(analysis.analyzedAt).toLocaleString()}.
            </Typography>
            {analysis.warnings?.map((warning) => (
              <Stack key={warning} direction="row" spacing={0.75} alignItems="flex-start" sx={{ mt: 1 }}>
                <FiAlertTriangle size={14} style={{ flexShrink: 0, marginTop: 3 }} />
                <Typography variant="caption" color="text.secondary">{warning}</Typography>
              </Stack>
            ))}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>No affordability analysis has been saved for this product yet.</Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : <FiRefreshCw />}
            disabled={isBusy || availableCash === "" || Number(availableCash) < 0}
            onClick={() => onAnalyze(product._id)}
          >
            Re-analyze
          </Button>
          {product.status !== "PURCHASED" ? (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FiCheckCircle />}
              disabled={isBusy}
              onClick={() => onUpdate(product._id, {
                status: "PURCHASED",
                purchasePrice: Number(product.currentPrice),
                purchaseDate: new Date().toISOString(),
              })}
            >Mark purchased</Button>
          ) : (
            <Chip color="success" icon={<FiCheckCircle />} label="Purchased" sx={{ justifyContent: "center", px: 1 }} />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function PurchaseIntelligence() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [urlResolving, setUrlResolving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/purchase-intelligence");
      setProducts(response.data?.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleProductUrlBlur = () => {
    if (!form.platform && form.productUrl) {
      setForm((current) => ({ ...current, platform: extractPlatform(current.productUrl) }));
    }
  };

  const handleImportUrl = async () => {
    if (!form.productUrl.trim()) return setError("Paste a product URL before importing.");
    if (!/^https:\/\//i.test(form.productUrl)) return setError("Automatic product import requires an HTTPS retailer URL.");
    setUrlResolving(true);
    setError("");
    setNotice("");
    try {
      const response = await axiosInstance.post("/purchase-intelligence/resolve-url", { url: form.productUrl.trim() });
      const metadata = response.data.data;
      setForm((current) => ({
        ...current,
        name: metadata.name || current.name,
        currentPrice: metadata.currentPrice ? String(metadata.currentPrice) : current.currentPrice,
        imageUrl: metadata.imageUrl || current.imageUrl,
        platform: metadata.platform || current.platform,
        productUrl: metadata.productUrl || current.productUrl,
      }));
      setNotice(`Imported available fields: ${metadata.extractedFields.join(", ") || "retailer link"}. Verify the price before saving.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUrlResolving(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const price = Number(form.currentPrice);
    const cash = Number(form.availableCash);
    if (form.name.trim().length < 2) return setError("Enter a product name with at least 2 characters.");
    if (!Number.isFinite(price) || price <= 0) return setError("Enter a valid product price greater than zero.");
    if (!Number.isFinite(cash) || cash < 0) return setError("Enter your current available cash. Use 0 if you have no available cash.");
    if (form.productUrl && !/^https?:\/\//i.test(form.productUrl)) return setError("Product URL must begin with http:// or https://.");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        brand: form.brand.trim() || undefined,
        currentPrice: price,
        targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined,
        productUrl: form.productUrl.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        notes: form.notes.trim() || undefined,
        listing: form.platform.trim() || form.productUrl.trim()
          ? { platform: form.platform.trim() || extractPlatform(form.productUrl), url: form.productUrl.trim() || undefined, price }
          : undefined,
      };
      const response = await axiosInstance.post("/purchase-intelligence", payload);
      const created = response.data.data;
      setProducts((current) => [created, ...current]);
      setForm((current) => ({ ...initialForm, availableCash: current.availableCash }));
      try {
        const analysisResponse = await axiosInstance.post(`/purchase-intelligence/${created._id}/analyze`, { availableCash: cash });
        const analyzedProduct = analysisResponse.data.data.product;
        setProducts((current) => current.map((item) => item._id === created._id ? analyzedProduct : item));
        setNotice("Product saved and initial affordability analysis completed.");
      } catch (analysisError) {
        setNotice("Product saved. Initial analysis could not complete: " + getErrorMessage(analysisError));
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async (productId) => {
    const cash = Number(form.availableCash);
    if (!Number.isFinite(cash) || cash < 0) {
      setError("Enter a valid available cash amount in the Add product form before analyzing.");
      return;
    }
    setBusyId(productId);
    setError("");
    try {
      const response = await axiosInstance.post(`/purchase-intelligence/${productId}/analyze`, { availableCash: cash });
      const updated = response.data.data.product;
      setProducts((current) => current.map((item) => item._id === productId ? updated : item));
      setNotice("Affordability analysis refreshed.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdate = async (productId, changes) => {
    setBusyId(productId);
    setError("");
    try {
      const response = await axiosInstance.patch(`/purchase-intelligence/${productId}`, changes);
      const updated = response.data.data;
      setProducts((current) => current.map((item) => item._id === productId ? updated : item));
      setNotice("Product record updated.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this tracked product and its price history?")) return;
    setBusyId(productId);
    setError("");
    try {
      await axiosInstance.delete(`/purchase-intelligence/${productId}`);
      setProducts((current) => current.filter((item) => item._id !== productId));
      setNotice("Tracked product deleted.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const summary = useMemo(() => ({
    tracked: products.filter((product) => ["CONSIDERING", "WATCHLIST"].includes(product.status)).length,
    purchased: products.filter((product) => product.status === "PURCHASED").length,
    highRisk: products.filter((product) => ["HIGH", "CRITICAL"].includes(product.lastAnalysis?.result?.risk?.level)).length,
  }), [products]);

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1, sm: 2 }, py: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}><FiShoppingBag /></Avatar>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}>Purchase Intelligence</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Evaluate a purchase against your recorded financial behavior before spending.</Typography>
        </Box>
        <Chip icon={<FiShield />} label="Private financial analysis" variant="outlined" />
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert> : null}
      {notice ? <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert> : null}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}><Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent><Metric label="Products being considered" value={summary.tracked} helper="Watchlist and consideration records" /></CardContent></Card></Grid>
        <Grid item xs={12} sm={4}><Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent><Metric label="Completed purchases" value={summary.purchased} helper="Saved purchase history" /></CardContent></Card></Grid>
        <Grid item xs={12} sm={4}><Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent><Metric label="High-risk assessments" value={summary.highRisk} helper="High or critical purchase risk" /></CardContent></Card></Grid>
      </Grid>

      <Card variant="outlined" sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <FiPlus />
            <Typography variant="h6" fontWeight={800}>Add a product to analyze</Typography>
          </Stack>
          <Box component="form" onSubmit={handleCreate}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField fullWidth required label="Product name" value={form.name} onChange={updateField("name")} inputProps={{ maxLength: 160 }} /></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField fullWidth select label="Category" value={form.category} onChange={updateField("category")}>{["Electronics", "Home", "Fashion", "Appliances", "Education", "Travel", "Other"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Brand (optional)" value={form.brand} onChange={updateField("brand")} /></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField fullWidth required type="number" label="Current price (₹)" value={form.currentPrice} onChange={updateField("currentPrice")} inputProps={{ min: 0.01, step: "0.01" }} /></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField fullWidth required type="number" label="Available cash (₹)" value={form.availableCash} onChange={updateField("availableCash")} inputProps={{ min: 0, step: "0.01" }} helperText="Your current cash balance, entered by you" /></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Target price (₹)" type="number" value={form.targetPrice} onChange={updateField("targetPrice")} inputProps={{ min: 0.01, step: "0.01" }} /></Grid>
              <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Retailer / platform" value={form.platform} onChange={updateField("platform")} helperText="Can be inferred from URL hostname" /></Grid>
              <Grid item xs={12} md={8}><TextField fullWidth label="Product URL (optional)" value={form.productUrl} onChange={updateField("productUrl")} onBlur={handleProductUrlBlur} placeholder="https://www.amazon.in/..." /></Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant="outlined" onClick={handleImportUrl} disabled={urlResolving || !form.productUrl.trim()} sx={{ height: 56 }} startIcon={urlResolving ? <CircularProgress size={16} /> : <FiExternalLink />}>
                  {urlResolving ? "Importing page…" : "Import from URL"}
                </Button>
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Notes (optional)" value={form.notes} onChange={updateField("notes")} inputProps={{ maxLength: 1000 }} /></Grid>
              <Grid item xs={12}>
                <Alert severity="info" icon={<FiActivity />}>Adding a product automatically runs an initial analysis. URL import currently supports selected Indian retailers and extracts only metadata exposed by their product page. If the page blocks access or hides a field, enter it manually.</Alert>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" size="large" disabled={saving} startIcon={saving ? <CircularProgress size={17} color="inherit" /> : <FiPlus />} sx={{ borderRadius: 2, px: 3 }}>
                  {saving ? "Saving and analyzing…" : "Add product & analyze"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>Your product records</Typography>
          <Typography variant="body2" color="text.secondary">Retailer links, price observations, decisions and saved financial assessments.</Typography>
        </Box>
        <Button onClick={loadProducts} disabled={loading} startIcon={loading ? <CircularProgress size={15} /> : <FiRefreshCw />}>Refresh</Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : products.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 4, textAlign: "center", py: 6 }}>
          <CardContent>
            <Avatar sx={{ mx: "auto", mb: 2, width: 56, height: 56, bgcolor: "action.hover", color: "text.secondary" }}><FiShoppingBag size={26} /></Avatar>
            <Typography variant="h6" fontWeight={800}>No tracked products yet</Typography>
            <Typography color="text.secondary" variant="body2">Add a product above to start evaluating purchase decisions.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} md={6} key={product._id}>
              <ProductCard
                product={product}
                availableCash={form.availableCash}
                busyId={busyId}
                onAnalyze={handleAnalyze}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3 }}>
        Financial estimates are decision-support calculations, not guarantees or personalized investment advice. The current milestone does not fetch live retailer prices or verify external product-page content.
      </Typography>
    </Box>
  );
}
