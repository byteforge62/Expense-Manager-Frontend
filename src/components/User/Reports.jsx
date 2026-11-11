import { useState } from "react";
import axiosInstance from "../Utils/axiosInstance";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiTarget,
  FiRepeat,
  FiBarChart2,
  FiShield,
  FiCheckCircle,
  FiRefreshCw,
  FiCalendar,
} from "react-icons/fi";
import reportPreview from "../../assets/illustrations/report-preview.svg";

/**
 * --- INTELLIGENCE REPORTS ---
 * Handles the generation and download of financial documentation.
 * Converts historical telemetry into a structured, human-readable PDF.
 */

export const Reports = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState("");

  // --- ACTIONS & LOGIC ---

  const downloadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/reports/me", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "financial-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      
      // Visual feedback trigger
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to download the report. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- CONFIG: DATA MATRIX MODULES ---
  const reportSections = [
    {
      icon: <FiTrendingUp size={16} />,
      label: "Income Summary",
      desc: "Income activity and monthly trends",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: <FiTrendingDown size={16} />,
      label: "Expense Breakdown",
      desc: "Expenses grouped by category",
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      icon: <FiTarget size={16} />,
      label: "Budget Performance",
      desc: "Spending against budget limits",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      icon: <FiPieChart size={16} />,
      label: "Savings Analysis",
      desc: "Income and spending comparison",
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: <FiRepeat size={16} />,
      label: "Recurring Payments",
      desc: "Recurring payment schedules",
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: <FiBarChart2 size={16} />,
      label: "Monthly Comparison",
      desc: "Monthly financial comparisons",
      color: "text-violet-500",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-[var(--text-primary)] pb-10"
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Reports
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Download a PDF summary of your financial activity.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-primary)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">
          <FiFileText size={12} />
          PDF report
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-[#354152] bg-[#171b23] p-6 text-[#e9e7e0] shadow-[var(--shadow-panel)] sm:p-9"
      >
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-[#42516a] bg-[#222a36] text-[#76aaff]">
              <FiFileText size={27} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-[#e9e7e0]">
                Financial report
              </h2>
              <p className="max-w-lg text-sm leading-relaxed text-[#b2bbc7]">
                Generate a PDF with the sections listed below. The report is
                created from your account data when you request it.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2 sm:justify-start">
                {[
                  { icon: <FiCalendar size={12} />, text: "Account activity" },
                  { icon: <FiShield size={12} />, text: "Private to your account" },
                ].map((badge) => (
                  <span
                    key={badge.text}
                    className="inline-flex items-center gap-2 rounded-full border border-[#354152] bg-[#222a36] px-3 py-1.5 text-xs text-[#b2bbc7]"
                  >
                    {badge.icon}
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <img
            src={reportPreview}
            alt=""
            aria-hidden="true"
            className="hidden h-36 w-44 flex-shrink-0 lg:block"
          />

          <motion.button
            onClick={downloadReport}
            disabled={loading}
            whileHover={!loading ? { y: -1 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className={`inline-flex flex-shrink-0 items-center gap-3 rounded-xl px-6 py-3.5 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-70
                        ${
                          downloaded
                            ? "bg-[#45b889] text-[#10271f]"
                            : loading
                              ? "bg-[#354152] text-[#e9e7e0]"
                              : "bg-[#3985ff] text-[#101a2b] hover:bg-[#5b9aff]"
                        }`}
          >
            {loading ? (
              <>
                <FiRefreshCw size={18} className="animate-spin" /> Preparing…
              </>
            ) : downloaded ? (
              <>
                <FiCheckCircle size={18} /> Downloaded
              </>
            ) : (
              <>
                <FiDownload size={18} /> Download report
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm text-rose-600">
          {error}
        </p>
      )}

      <section aria-labelledby="report-sections-heading" className="max-w-4xl">
        <div className="mb-2 border-b border-[var(--border)] pb-4">
          <h3 id="report-sections-heading" className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            What’s included
          </h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            The report covers these areas of your finances.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
          {reportSections.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-4 border-b border-[var(--border)] py-5"
            >
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${section.bg}`}>
                <span className={section.color}>{section.icon}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {section.label}
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  {section.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
