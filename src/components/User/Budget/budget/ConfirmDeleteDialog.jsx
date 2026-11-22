import MuiDialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import { FiTrash2 } from "react-icons/fi";

const ConfirmDeleteDialog = ({
  open,
  budget,
  isDeleting,
  onConfirm,
  onCancel,
  onClose,
}) => (
  <MuiDialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: "16px",
        bgcolor: "background.paper",
        backgroundImage: "none",
        border: 1,
        borderColor: "divider",
        boxShadow: 24,
      },
    }}
  >
    <DialogContent sx={{ p: 5, textAlign: "center" }}>
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
        <FiTrash2 size={24} className="text-rose-500" />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        Delete Budget?
      </h3>
      <p className="text-sm font-medium text-[var(--text-muted)] mb-8 leading-relaxed">
        Permanently remove the budget for{" "}
        <span className="text-[var(--text-primary)] font-bold">
          {budget &&
            (typeof budget.categoryID === "object"
              ? budget.categoryID?.name
              : budget.description || "this category")}
        </span>
        ?
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="w-full py-3.5 rounded-xl bg-[var(--negative)] text-sm font-bold text-white hover:opacity-95 transition-all shadow-lg shadow-none active:scale-95 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <CircularProgress size={14} sx={{ color: "white" }} />{" "}
              DELETING...
            </>
          ) : (
            "YES, DELETE"
          )}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all active:scale-95"
        >
          CANCEL
        </button>
      </div>
    </DialogContent>
  </MuiDialog>
);

export default ConfirmDeleteDialog;
