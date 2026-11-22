import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FiImage, FiUploadCloud, FiX } from "react-icons/fi";

import {
  PURCHASE_CATEGORIES,
  PURCHASE_STATUSES,
  STATUS_LABELS,
  createPurchase,
  emptyPurchaseForm,
  errorText,
  purchasePayload,
  updatePurchase,
  uploadPurchaseImage,
} from "./purchasesApi";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const formFromPurchase = (purchase) => ({
  ...emptyPurchaseForm(),
  name: purchase.name || "",
  description: purchase.description || "",
  category: purchase.category || "Other",
  merchant: purchase.merchant || "",
  sourceWebsite: purchase.sourceWebsite || "",
  productUrl: purchase.productUrl || "",
  imageUrl: purchase.imageUrl || "",
  unitPrice: String(purchase.unitPrice ?? ""),
  quantity: String(purchase.quantity ?? 1),
  purchaseDate: toDateInput(purchase.purchaseDate),
  orderId: purchase.orderId || "",
  paymentMethod: purchase.paymentMethod || "",
  warrantyUntil: toDateInput(purchase.warrantyUntil),
  notes: purchase.notes || "",
  status: purchase.status || "DELIVERED",
});

/**
 * Record or edit a purchase. The product image is uploaded first and only its
 * stored URL is sent with the record, so a failed upload never leaves a
 * half-saved purchase.
 */
export const PurchaseDialog = ({
  open,
  purchase,
  categories,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState(emptyPurchaseForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm(purchase ? formFromPurchase(purchase) : emptyPurchaseForm());
    setError("");
    setFieldErrors({});
  }, [open, purchase]);

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPEG, PNG or WebP image.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("The image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const url = await uploadPurchaseImage(file);
      if (!url) throw new Error("The upload did not return an image URL.");
      setForm((current) => ({ ...current, imageUrl: url }));
    } catch (uploadError) {
      setError(errorText(uploadError));
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter the product name.";
    if (!(Number(form.unitPrice) > 0)) next.unitPrice = "Enter a price above 0.";
    if (!(Number(form.quantity) >= 1)) next.quantity = "Quantity must be at least 1.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError("");
    try {
      const payload = purchasePayload(form);
      const saved = purchase
        ? await updatePurchase(purchase._id, payload)
        : await createPurchase(payload);
      onSaved(saved, Boolean(purchase));
      onClose();
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setSaving(false);
    }
  };

  const total = (Number(form.unitPrice) || 0) * (Number(form.quantity) || 0);

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <form onSubmit={submit} noValidate>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          {purchase ? "Edit purchase" : "Record a purchase"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField
                label="Product name"
                value={form.name}
                onChange={set("name")}
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name}
                required
                size="small"
                sx={{ gridColumn: { sm: "1 / -1" } }}
              />
              <TextField
                label="Merchant or store"
                value={form.merchant}
                onChange={set("merchant")}
                size="small"
                placeholder="Amazon, Flipkart, local shop…"
              />
              <TextField
                label="Source website"
                value={form.sourceWebsite}
                onChange={set("sourceWebsite")}
                size="small"
                placeholder="amazon.in"
              />
              <TextField
                label="Price (per item)"
                type="number"
                value={form.unitPrice}
                onChange={set("unitPrice")}
                error={Boolean(fieldErrors.unitPrice)}
                helperText={fieldErrors.unitPrice}
                required
                size="small"
                inputProps={{ min: 0, step: "0.01" }}
              />
              <TextField
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={set("quantity")}
                error={Boolean(fieldErrors.quantity)}
                helperText={fieldErrors.quantity}
                size="small"
                inputProps={{ min: 1, step: 1 }}
              />
              <TextField
                select
                label="Category"
                value={form.category}
                onChange={set("category")}
                size="small"
              >
                {[...new Set([...PURCHASE_CATEGORIES, form.category].filter(Boolean))].map(
                  (category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ),
                )}
              </TextField>
              <TextField
                select
                label="Status"
                value={form.status}
                onChange={set("status")}
                size="small"
              >
                {PURCHASE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Purchase date"
                type="date"
                value={form.purchaseDate}
                onChange={set("purchaseDate")}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Order ID (optional)"
                value={form.orderId}
                onChange={set("orderId")}
                size="small"
              />
              <TextField
                label="Payment method (optional)"
                value={form.paymentMethod}
                onChange={set("paymentMethod")}
                size="small"
              />
              <TextField
                label="Warranty until (optional)"
                type="date"
                value={form.warrantyUntil}
                onChange={set("warrantyUntil")}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Product URL (optional)"
                type="url"
                value={form.productUrl}
                onChange={set("productUrl")}
                size="small"
                placeholder="https://…"
                sx={{ gridColumn: { sm: "1 / -1" } }}
              />
              <TextField
                label="Description (optional)"
                value={form.description}
                onChange={set("description")}
                size="small"
                multiline
                minRows={2}
                sx={{ gridColumn: { sm: "1 / -1" } }}
              />
              <TextField
                label="Notes (optional)"
                value={form.notes}
                onChange={set("notes")}
                size="small"
                multiline
                minRows={2}
                sx={{ gridColumn: { sm: "1 / -1" } }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "160px minmax(0, 1fr)" },
                alignItems: "start",
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: "10px",
              }}
            >
              <Box
                sx={{
                  height: 120,
                  borderRadius: "8px",
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "var(--surface-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {form.imageUrl ? (
                  <Box
                    component="img"
                    src={form.imageUrl}
                    alt={`Product image for ${form.name || "purchase"}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <FiImage size={26} style={{ color: "var(--text-muted)" }} />
                )}
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                  Product image
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                  JPEG, PNG or WebP up to 5 MB. Optional — a placeholder is shown
                  when no image is attached.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
                  <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    startIcon={<FiUploadCloud size={15} />}
                    disabled={uploading}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    {uploading ? "Uploading…" : form.imageUrl ? "Replace image" : "Upload image"}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImage}
                    />
                  </Button>
                  {form.imageUrl && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<FiX size={15} />}
                      onClick={() => setForm((current) => ({ ...current, imageUrl: "" }))}
                      sx={{ textTransform: "none" }}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>

            <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: "10px" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.syncExpense}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        syncExpense: event.target.checked,
                        expenseCategoryID:
                          event.target.checked && !current.expenseCategoryID
                            ? categories[0]?._id || ""
                            : current.expenseCategoryID,
                      }))
                    }
                    disabled={Boolean(purchase?.linkedExpenseId)}
                    size="small"
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13.5 }}>
                    Record this purchase as spending
                  </Typography>
                }
              />
              <Typography sx={{ fontSize: 12, color: "text.secondary", ml: 4 }}>
                {purchase?.linkedExpenseId
                  ? "This purchase is already linked to an expense. Its amount and date stay in sync, and deleting the purchase removes the expense."
                  : "Creates one linked expense for the total amount, so the purchase appears in budgets and reports without duplicate entries."}
              </Typography>

              {form.syncExpense && !purchase?.linkedExpenseId && (
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Expense category"
                  value={form.expenseCategoryID}
                  onChange={set("expenseCategoryID")}
                  sx={{ mt: 1.5 }}
                  helperText={
                    categories.length === 0
                      ? "No expense categories exist yet. Save the purchase now and ask an admin to add categories."
                      : undefined
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>

            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Purchase total{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 2,
                }).format(total || 0)}
              </Box>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={saving} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || uploading}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {saving ? "Saving…" : purchase ? "Save changes" : "Record purchase"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PurchaseDialog;
