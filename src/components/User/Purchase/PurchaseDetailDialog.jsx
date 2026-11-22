import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { FiExternalLink, FiImage, FiTrash2 } from "react-icons/fi";

import {
  STATUS_LABELS,
  formatMoney,
  formatPurchaseDate,
} from "./purchasesApi";

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-3 border-b border-[var(--border)] py-2.5 last:border-0">
    <dt className="text-xs font-medium text-[var(--text-muted)]">{label}</dt>
    <dd className="min-w-0 break-words text-sm text-[var(--text-primary)]">{children}</dd>
  </div>
);

export const PurchaseDetailDialog = ({ purchase, open, onClose, onEdit, onDelete }) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!purchase) return null;

  const close = () => {
    setConfirming(false);
    setError("");
    onClose();
  };

  const remove = async () => {
    setDeleting(true);
    setError("");
    try {
      await onDelete(purchase);
      close();
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          deleteError.message ||
          "The purchase could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>{purchase.name}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box
            sx={{
              height: 180,
              borderRadius: "10px",
              border: 1,
              borderColor: "divider",
              bgcolor: "var(--surface-secondary)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {purchase.imageUrl ? (
              <Box
                component="img"
                src={purchase.imageUrl}
                alt={`Product image for ${purchase.name}`}
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Stack alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
                <FiImage size={26} />
                <Typography sx={{ fontSize: 12 }}>No product image</Typography>
              </Stack>
            )}
          </Box>

          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {formatMoney(purchase.totalAmount)}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              {purchase.quantity} × {formatMoney(purchase.unitPrice)} ·{" "}
              {STATUS_LABELS[purchase.status] || purchase.status}
            </Typography>
          </Box>

          <dl>
            <Row label="Merchant">{purchase.merchant || "Not recorded"}</Row>
            <Row label="Source">{purchase.sourceWebsite || "Not recorded"}</Row>
            <Row label="Category">{purchase.category || "Other"}</Row>
            <Row label="Purchased">{formatPurchaseDate(purchase.purchaseDate)}</Row>
            <Row label="Order ID">{purchase.orderId || "Not recorded"}</Row>
            <Row label="Payment">{purchase.paymentMethod || "Not recorded"}</Row>
            <Row label="Warranty">
              {purchase.warrantyUntil ? `Until ${formatPurchaseDate(purchase.warrantyUntil)}` : "Not recorded"}
            </Row>
            <Row label="Expense">
              {purchase.linkedExpenseId
                ? "Linked — edits stay in sync and deleting this purchase removes the expense."
                : "Not linked to an expense"}
            </Row>
            {purchase.description && <Row label="Description">{purchase.description}</Row>}
            {purchase.notes && <Row label="Notes">{purchase.notes}</Row>}
            <Row label="Product page">
              {purchase.productUrl ? (
                <a
                  href={purchase.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--accent-electric)] underline underline-offset-2"
                >
                  Open product page <FiExternalLink size={13} />
                </a>
              ) : (
                "Not recorded"
              )}
            </Row>
          </dl>

          {confirming && (
            <Alert severity="warning">
              Delete this purchase{purchase.linkedExpenseId ? " and its linked expense" : ""}? This
              cannot be undone.
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={remove}
                  disabled={deleting}
                  sx={{ textTransform: "none" }}
                >
                  {deleting ? "Deleting…" : "Delete purchase"}
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  sx={{ textTransform: "none" }}
                >
                  Keep it
                </Button>
              </Stack>
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button
          color="error"
          startIcon={<FiTrash2 size={15} />}
          onClick={() => setConfirming(true)}
          disabled={confirming || deleting}
          sx={{ textTransform: "none" }}
        >
          Delete
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={close} color="inherit" sx={{ textTransform: "none" }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => onEdit(purchase)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Edit purchase
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseDetailDialog;
