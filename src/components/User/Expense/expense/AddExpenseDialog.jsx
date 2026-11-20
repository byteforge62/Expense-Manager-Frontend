import MuiDialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import {
  FiTrendingDown,
  FiX,
  FiTag,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiPlus,
} from "react-icons/fi";
import { Field } from "./expenseUi";
import { inputCls, selectCls } from "./expenseConfig";

const AddExpenseDialog = ({
  open,
  onClose,
  categories,
  register,
  errors,
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
        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
          <FiTrendingDown size={18} className="text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            New Expense
          </h2>
          <p className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider">
            Record your spending
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
      <form
        onSubmit={onSubmit}
        className="space-y-5"
      >
        <Field
          label="Category"
          icon={<FiTag size={16} />}
          error={errors.categoryID?.message}
        >
          <select
            {...register("categoryID", {
              required: "Please select a category",
            })}
            className={selectCls}
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
          label="Amount (INR)"
          icon={<FiDollarSign size={16} />}
          error={errors.amount?.message}
        >
          <input
            type="number"
            step="0.01"
            {...register("amount", {
              required: "Amount is required",
            })}
            placeholder="0.00"
            className={inputCls}
          />
        </Field>

        <Field
          label="Transaction Date"
          icon={<FiCalendar size={16} />}
          error={errors.date?.message}
        >
          <input
            type="date"
            {...register("date", { required: "Date is required" })}
            className={inputCls}
          />
        </Field>

        <Field
          label="Description / Note"
          icon={<FiFileText size={16} />}
          error={errors.description?.message}
        >
          <input
            type="text"
            {...register("description", {
              required: "Description is required",
            })}
            placeholder="Coffee, Rent, Fuel..."
            className={inputCls}
          />
        </Field>

        <input type="hidden" {...register("userID")} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 mt-4 rounded-2xl bg-[var(--negative)]
                     font-bold text-sm text-white shadow-xl shadow-rose-500/30
                     hover:opacity-95 hover:-translate-y-1 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
                     flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={16} sx={{ color: "white" }} />{" "}
              REGISTERING...
            </>
          ) : (
            <>
              <FiPlus size={20} /> ADD EXPENSE
            </>
          )}
        </button>
      </form>
    </DialogContent>
  </MuiDialog>
);

export default AddExpenseDialog;
