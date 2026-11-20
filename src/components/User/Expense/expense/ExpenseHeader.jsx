import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";

const ExpenseHeader = ({ activeTab, onTabChange, tabs, onAdd, children }) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Expenses
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Review spending by category, date, and amount.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 self-start rounded bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
      >
        <FiPlus size={16} /> Add expense
      </button>
    </motion.div>

    {children}

    <div className="mt-5 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded border border-[var(--border)] bg-[var(--surface-primary)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 whitespace-nowrap rounded px-4 py-2 text-sm transition-colors ${
            activeTab === tab.id
              ? "bg-[var(--surface-tertiary)] font-semibold text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  </>
);

export default ExpenseHeader;
