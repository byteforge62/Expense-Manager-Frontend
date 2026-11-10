import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaGithub,
  FaTachometerAlt,
  FaMoneyBillWave,
  FaWallet,
  FaChartPie,
  FaExchangeAlt,
  FaFileAlt,
  FaUser,
  FaTimes,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

/**
 * --- USER SIDEBAR ---
 * The main navigation hub for the user dashboard.
 * Includes search, expandable menus, and support shortcuts.
 */
export const UserSidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const userId = user?._id;
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState({});

  // --- DATA: MENU STRUCTURE ---
  const menuItems = [
    {
      label: "Dashboard",
      path: "/private/userdashboard",
      icon: <FaTachometerAlt />,
    },
    {
      label: "Financial Intelligence",
      path: "/private/financial-intelligence",
      icon: <FaChartPie />,
    },
    { label: "Account", path: `/private/account/${userId}`, icon: <FaUser /> },
    {
      label: "Expenses",
      icon: <FaMoneyBillWave />,
      children: [
        { label: "Add Expense", path: "/private/addexpense" },
        { label: "All Expenses", path: "/private/allexpenses" },
        { label: "Recurring Expenses", path: "/private/recurring" },
      ],
    },
    {
      label: "Income",
      icon: <FaWallet />,
      children: [
        { label: "Add Income", path: "/private/addincome" },
        { label: "View Income", path: "/private/viewincome" },
        { label: "Income Summary", path: "/private/incomesummary" },
      ],
    },
    {
      label: "Budget",
      icon: <FaChartPie />,
      children: [
        { label: "Add Budget", path: "/private/addbudget" },
        { label: "View Budget", path: "/private/allbudget" },
        { label: "Budget Summary", path: "/private/budgetsummary" },
      ],
    },
    {
      label: "Transactions",
      path: "/private/transaction",
      icon: <FaExchangeAlt />,
    },
    { label: "Reports", path: "/private/reports", icon: <FaFileAlt /> },
  ];

  // --- LOGIC ---
  const toggleExpand = (label) =>
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));

  const matchesSearch = (item) => {
    if (!searchTerm) return true;
    const labelMatch = item.label
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const childMatch =
      item.children &&
      item.children.some((child) =>
        child.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return labelMatch || childMatch;
  };

  return (
    <>
      {/* ── MOBILE OVERLAY ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR CONTAINER ── */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full z-50 w-[280px] bg-[var(--surface-primary)] border-r border-[var(--border)] shadow-2xl flex flex-col"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <span className="font-bold text-lg">T</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
              Trackit
            </h2>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Global Search Feature */}
        <div className="px-6 py-4">
          <div className="relative group">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-cyan-400 transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search features..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <nav className="space-y-1.5">
            {menuItems.filter(matchesSearch).map((item, index) => {
              const isExpanded = expandedItems[item.label] || searchTerm !== "";
              const isActive =
                location.pathname === item.path ||
                (item.children &&
                  item.children.some((c) => location.pathname === c.path));

              if (item.children) {
                const childMatches = item.children.filter((child) =>
                  child.label.toLowerCase().includes(searchTerm.toLowerCase()),
                );
                const shouldShowChildren = searchTerm
                  ? childMatches.length > 0
                  : isExpanded;

                return (
                  <div key={index} className="space-y-1">
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl transition-all duration-200 group
                        ${
                          shouldShowChildren || isActive
                            ? "bg-[var(--surface-tertiary)] text-cyan-400 font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`${isActive ? "text-cyan-400" : "text-[var(--text-muted)] group-hover:text-cyan-400"} transition-colors`}
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <FaChevronDown
                        className={`text-[10px] transition-transform duration-300 ${shouldShowChildren ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {shouldShowChildren && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-6 space-y-1 overflow-hidden border-l-2 border-[var(--border)] pl-3"
                        >
                          {childMatches.map((child, idx) => (
                            <li key={idx}>
                              <Link
                                to={child.path}
                                onClick={() =>
                                  window.innerWidth < 768 && toggleSidebar()
                                }
                                className={`block py-1.5 px-4 rounded-lg text-sm transition-all duration-200
                                  ${
                                    location.pathname === child.path
                                      ? "text-cyan-400 bg-cyan-500/5 font-medium shadow-sm"
                                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
                                  }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                );
              } else {
                return (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => window.innerWidth < 768 && toggleSidebar()}
                    className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 group
                      ${
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 font-semibold shadow-sm border-l-2 border-cyan-500"
                          : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                  >
                    <span
                      className={`${location.pathname === item.path ? "text-cyan-400" : "text-[var(--text-muted)] group-hover:text-cyan-400"} transition-colors`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              }
            })}
          </nav>
        </div>

        {/* ── FOOTER: SUPPORT HUB ── */}
        <div className="p-6 border-t border-[var(--border)] bg-[var(--surface-secondary)]/30 backdrop-blur-sm">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
            Support Hub
          </p>
          <div className="space-y-3">
            <a
              href="mailto:support@trackit.com"
              className="flex items-center gap-3 text-xs text-[var(--text-secondary)] hover:text-cyan-400 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-tertiary)] flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                <FaEnvelope className="text-[var(--text-muted)] group-hover:text-cyan-400" />
              </div>
              <span>support@trackit.com</span>
            </a>
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] group">
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-tertiary)] flex items-center justify-center">
                <FaPhone className="text-[var(--text-muted)]" />
              </div>
              <span>+91 8980380280</span>
            </div>
            <a
              href="https://github.com/patel192"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-tertiary)] flex items-center justify-center group-hover:bg-[var(--text-primary)]/10 transition-colors">
                <FaGithub className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
              </div>
              <span>patel192 / trackit</span>
            </a>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

