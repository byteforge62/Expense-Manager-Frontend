import MuiDialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import {
  FiTrendingUp,
  FiX,
  FiDollarSign,
  FiList,
  FiCalendar,
  FiChevronDown,
  FiPlus,
} from "react-icons/fi";
import { Field } from "./incomeUi";
import { inputCls, selectCls } from "./incomeConfig";

const AddIncomeDialog = ({
  open,
  onClose,
  register,
  errors,
  onSubmit,
  isSubmitting,
}) => (
  <MuiDialog
    open={open}
    onClose={() => onClose()}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: "16px",
        bgcolor: "background.paper",
        backgroundImage: "none",
        border: 1,
        borderColor: "divider",
        boxShadow: 24,
        overflow: "hidden",
      },
    }}
  >
    <div className="flex items-center justify-between px-8 py-7 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-[1rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
          <FiTrendingUp size={20} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Record income
          </h2>
          <p className="text-[11px] font-extrabold text-[var(--text-muted)] tracking-normal mt-0.5">
            Add an income entry
          </p>
        </div>
      </div>
      <IconButton
        onClick={() => onClose()}
        size="small"
        sx={{ color: "text.secondary", border: 1, borderColor: "divider", borderRadius: "8px" }}
      >
        <FiX size={18} />
      </IconButton>
    </div>

    <DialogContent sx={{ px: 4, py: 4 }}>
      <form
        onSubmit={onSubmit}
        className="space-y-6"
      >
        <Field
          label="Amount (INR)"
          error={errors.amount?.message}
          icon={<FiDollarSign size={16} />}
        >
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { required: "Required" })}
            className={inputCls + " pl-10"}
          />
        </Field>

        <Field
          label="Source Channel"
          error={errors.source?.message}
          icon={<FiList size={16} />}
        >
          <div className="relative group">
            <select
              {...register("source", { required: "Required" })}
              className={selectCls + " pl-10"}
            >
              <option value="">Select channel</option>
              <option value="Salary">Salary</option>
              <option value="Freelancing">Freelancing</option>
              <option value="Investments">Investments</option>
              <option value="Other">Other</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none transition-colors group-focus-within:text-cyan-500" />
          </div>
        </Field>

        <Field
          label="Value Date"
          error={errors.date?.message}
          icon={<FiCalendar size={16} />}
        >
          <input
            type="date"
            {...register("date", { required: "Required" })}
            className={inputCls + " pl-10"}
          />
        </Field>


        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-[var(--primary)]
                     font-extrabold text-sm text-white shadow-2xl shadow-none
                     hover:opacity-95 hover:-translate-y-1 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0
                     flex items-center justify-center gap-3 mt-4"
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={16} sx={{ color: "white" }} />{" "}
              COMMITTING...
            </>
          ) : (
            <>
              <FiPlus size={20} /> AUTHORIZE ENTRY
            </>
          )}
        </button>
      </form>
    </DialogContent>
  </MuiDialog>);

export default AddIncomeDialog;
