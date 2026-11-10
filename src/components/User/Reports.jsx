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

/**
 * --- INTELLIGENCE REPORTS ---
 * Handles the generation and download of financial documentation.
 * Converts historical telemetry into a structured, human-readable PDF.
 */

export const Reports = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // --- ACTIONS & LOGIC ---

  // Compile and fetch the report blob from the backend
  const downloadReport = async () => {
    try {
      setLoading(true);
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
      console.error("Report download error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CONFIG: DATA MATRIX MODULES ---
  const reportSections = [
    {
      icon: <FiTrendingUp size={16} />,
      label: "Income Summary",
      desc: "Comprehensive inflow tracking & monthly velocity",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: <FiTrendingDown size={16} />,
      label: "Expense Breakdown",
      desc: "Granular sector allocation & spending heatmaps",
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      icon: <FiTarget size={16} />,
      label: "Budget Performance",
      desc: "Strategic deviation analysis vs allocated capital",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      icon: <FiPieChart size={16} />,
      label: "Savings Analysis",
      desc: "Net surplus trajectory and efficiency metrics",
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: <FiRepeat size={16} />,
      label: "Recurring Payments",
      desc: "Automated subscription auditing & schedules",
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: <FiBarChart2 size={16} />,
      label: "Monthly Comparison",
      desc: "Temporal performance delta & benchmarks",
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
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent uppercase">
            Intelligence Reports
          </h1>
          <p className="text-sm font-bold text-[var(--text-muted)] mt-1 uppercase tracking-[0.2em]">
            Comprehensive Financial Audit Ledger
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border bg-violet-500/10 border-violet-500/20 text-violet-500 text-[10px] font-black uppercase tracking-widest shadow-sm">
          <FiFileText size={12} />
          PDF DOCUMENTATION
        </div>
      </div>

      {/* ── CENTRAL ACTION HUB (Download Section) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[var(--surface-primary)] border border-[var(--border)] shadow-2xl p-8 sm:p-12 group"
      >
        {/* Ambient Glow Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-violet-500/10 blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
            {/* Visual Anchor Icon */}
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-2xl shadow-violet-500/30 transform group-hover:rotate-6 transition-transform duration-500">
              <FiFileText size={32} className="text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                Full Spectrum Export
              </h2>
              <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed max-w-lg">
                Compile and synchronize your entire financial history into a
                cryptographic, human-readable PDF document spanning all vectors:
                Inflow, Outflow, Strategic Budgets, and Automated Protocols.
              </p>
              
              {/* Feature Badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-3">
                {[
                  { icon: <FiCalendar size={12} />, text: "REAL-TIME SYNC" },
                  { icon: <FiShield size={12} />, text: "AES-256 SECURE" },
                  {
                    icon: <FiCheckCircle size={12} />,
                    text: "INSTANT COMPILER",
                  },
                ].map((badge, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 text-[9px] font-black
                                           text-[var(--text-muted)] bg-[var(--surface-secondary)]/50 border border-[var(--border)] px-3 py-1.5 rounded-full uppercase tracking-widest"
                  >
                    {badge.icon}
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* TRIGGER MODULE (The Download Button) */}
          <motion.button
            onClick={downloadReport}
            disabled={loading}
            whileHover={!loading ? { scale: 1.05 } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
            className={`flex-shrink-0 inline-flex items-center gap-3 px-10 py-5 rounded-3xl
                        font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl text-white
                        ${
                          downloaded
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/40"
                            : loading
                              ? "bg-[var(--surface-tertiary)] cursor-wait text-[var(--text-muted)]"
                              : "bg-gradient-to-r from-violet-600 to-blue-700 shadow-violet-600/40 hover:shadow-violet-600/60"
                        }`}
          >
            {loading ? (
              <>
                <FiRefreshCw size={18} className="animate-spin" /> Compiling...
              </>
            ) : downloaded ? (
              <>
                <FiCheckCircle size={18} /> Sync Complete
              </>
            ) : (
              <>
                <FiDownload size={18} /> Initiate Download
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── TELEMETRY BREAKDOWN (Feature Grid) ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-inner">
            <FiFileText size={16} className="text-violet-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
              Data Matrix Components
            </h3>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
              Included Intelligence Modules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportSections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-start gap-4 p-6 rounded-[2rem] bg-[var(--surface-primary)] border border-[var(--border)] hover:bg-[var(--surface-secondary)]/50 transition-all group border-dashed"
            >
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform ${section.bg}`}
              >
                <span className={section.color}>{section.icon}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">
                  {section.label}
                </p>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-loose mt-1">
                  {section.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── OPERATIONAL FLOW (Instructional Grid) ── */}
      <div className="rounded-[2.5rem] bg-[var(--surface-secondary)]/30 border border-[var(--border)] p-8 sm:p-10 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[80px] pointer-events-none" />
        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-8 px-2">
          Operational Protocol
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "VECTOR TRIGGER",
              desc: "Initiate the download command via the primary interface module.",
              color: "text-violet-500",
              bg: "bg-violet-500/10 border-violet-500/20",
            },
            {
              step: "02",
              title: "DATA SYNTHESIS",
              desc: "System compiles historical telemetry into a structured document ledger.",
              color: "text-blue-500",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              step: "03",
              title: "HARDWARE SYNC",
              desc: "The synthesized document is securely transferred to your local hardware storage.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-6 rounded-[2rem] bg-[var(--surface-primary)]/50 border border-[var(--border)] relative group"
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black ${s.bg} ${s.color} shadow-inner`}
              >
                {s.step}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">
                  {s.title}
                </p>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-loose mt-1">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
