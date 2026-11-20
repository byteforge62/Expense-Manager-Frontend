import MuiDialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import {
  FiTarget,
  FiX,
  FiTag,
  FiDollarSign,
  FiAlignLeft,
  FiPlus,
} from "react-icons/fi";
import { Field } from "./budgetUi";
import { inputCls, selectCls } from "./budgetConfig";

const AddBudgetDialog = ({
  open,
  onClose,
  categories,
  form,
  onChange,
  onSubmit,
  isSubmitting,
}) => (
  <MuiDialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 2,
        bgcolor: "background.paper",
        backgroundImage: "none",
        border: 1,
        borderColor: "divider",
        boxShadow: 24,
        overflow: "hidden",
      },
    }}
  >
    <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
          <FiTarget size={18} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            New Budget
          </h2>
          <p className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider">
            Set spending limits
          </p>
        </div>
      </div>
      <IconButton
        onClick={onClose}
        size="small"
        sx={{ color: "text.secondary", border: 1, borderColor: "divider", borderRadius: 2 }}
      >
        <FiX size={18} />
      </IconButton>
    </div>
    <DialogContent sx={{ px: 4, py: 4 }}>
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Category" icon={<FiTag size={16} />}>
          <select
            value={form.categoryID}
            onChange={(e) => onChange("categoryID", e.target.value)}
            className={selectCls}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Monthly Limit (INR)"
          icon={<FiDollarSign size={16} />}
        >
          <input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            className={inputCls}
            required
            min="0.01"
            step="0.01"
          />
        </Field>
        <Field
          label="Short Note (Optional)"
          icon={<FiAlignLeft size={16} />}
        >
          <input
            type="text"
            placeholder="e.g. For household items"
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            className={inputCls}
          />
        </Field>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 mt-4 rounded-2xl bg-[var(--primary)]
                     font-bold text-sm text-white shadow-xl shadow-emerald-500/30
                     hover:opacity-95 hover:-translate-y-1 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
                     flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={16} sx={{ color: "white" }} />{" "}
              ESTABLISHING...
            </>
          ) : (
            <>
              <FiPlus size={20} /> INITIALIZE BUDGET
            </>
          )}
        </button>
      </form>
    </DialogContent>
  </MuiDialog>
);

export default AddBudgetDialog;
