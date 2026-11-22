import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeContext = createContext();

/**
 * --- STAMPED PAPER THEME ---
 * One token set drives MUI and the Tailwind variables in App.css.
 * Uncoated paper, an ink-black text colour, one authorisation violet
 * and a semantic oxblood for money leaving the account. Surfaces are
 * separated by hairlines, not shadows.
 */

const palette = {
  light: {
    primary: "#6366f1",
    primaryDeep: "#4f46e5",
    primaryContrast: "#ffffff",
    secondary: "#0f172a",
    secondaryContrast: "#ffffff",
    background: "#f8fafc",
    paper: "#ffffff",
    text: "#1e293b",
    textSecondary: "#64748b",
    textDisabled: "#94a3b8",
    divider: "#e2e8f0",
    hover: "rgba(15, 23, 42, 0.04)",
    selected: "rgba(99, 102, 241, 0.08)",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#6366f1",
    accent: "#6366f1",
    brass: "#6366f1",
  },
  dark: {
    primary: "#818cf8",
    primaryDeep: "#a5b4fc",
    primaryContrast: "#0f172a",
    secondary: "#e2e8f0",
    secondaryContrast: "#0b1120",
    background: "#0b1120",
    paper: "#111827",
    text: "#e2e8f0",
    textSecondary: "#94a3b8",
    textDisabled: "#64748b",
    divider: "rgba(148, 163, 184, 0.16)",
    hover: "rgba(226, 232, 240, 0.05)",
    selected: "rgba(129, 140, 248, 0.14)",
    success: "#34d399",
    error: "#f87171",
    warning: "#fbbf24",
    info: "#818cf8",
    accent: "#818cf8",
    brass: "#a5b4fc",
  },
};

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const saved = localStorage.getItem("fintrack-theme");
    if (saved) return saved;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const muiTheme = useMemo(() => {
    const c = palette[theme];
    const isDark = theme === "dark";
    const display =
      '"Plus Jakarta Sans", "Instrument Sans", "Segoe UI", system-ui, sans-serif';
    const sans = '"Instrument Sans", "Segoe UI", system-ui, sans-serif';

    return createTheme({
      palette: {
        mode: theme,
        primary: { main: c.primary, contrastText: c.primaryContrast },
        secondary: { main: c.secondary, contrastText: c.secondaryContrast },
        background: { default: c.background, paper: c.paper },
        text: { primary: c.text, secondary: c.textSecondary, disabled: c.textDisabled },
        divider: c.divider,
        success: { main: c.success, contrastText: "#ffffff" },
        error: { main: c.error, contrastText: "#ffffff" },
        warning: { main: c.warning, contrastText: "#ffffff" },
        info: { main: c.info, contrastText: "#ffffff" },
        action: {
          hover: c.hover,
          selected: c.selected,
          focus: c.selected,
        },
        /* Legacy palette keys still referenced by existing pages. */
        cyan: { main: c.accent, dark: c.primary, light: c.brass, contrastText: c.primaryContrast },
        emerald: { main: c.success },
        rose: { main: c.error },
        indigo: { main: c.brass },
        violet: { main: c.accent },
        blue: { main: c.info },
      },
      shape: { borderRadius: 12 },
      shadows: Array.from({ length: 25 }, (_, i) =>
        i === 0
          ? "none"
          : isDark
            ? "0 4px 6px -1px rgba(0,0,0,0.40), 0 2px 4px -1px rgba(0,0,0,0.35)"
            : "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)",
      ),
      typography: {
        fontFamily: sans,
        fontSize: 14.5,
        htmlFontSize: 16,
        h1: {
          fontFamily: display,
          fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
          fontWeight: 700,
          lineHeight: 1.02,
          letterSpacing: "-0.045em",
        },
        h2: {
          fontFamily: display,
          fontSize: "clamp(1.8rem, 3.1vw, 2.6rem)",
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
        },
        h3: {
          fontFamily: display,
          fontSize: "clamp(1.45rem, 2.2vw, 1.95rem)",
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.032em",
        },
        h4: {
          fontFamily: display,
          fontSize: "clamp(1.3rem, 1.8vw, 1.6rem)",
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "-0.03em",
        },
        h5: {
          fontFamily: display,
          fontSize: "1.25rem",
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: "-0.025em",
        },
        h6: {
          fontFamily: display,
          fontSize: "1.06rem",
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
        },
        subtitle1: { fontSize: "0.95rem", fontWeight: 600, letterSpacing: "-0.005em" },
        subtitle2: { fontSize: "0.83rem", fontWeight: 600, letterSpacing: "0" },
        body1: { fontSize: "0.95rem", lineHeight: 1.65, letterSpacing: "0" },
        body2: { fontSize: "0.855rem", lineHeight: 1.6, letterSpacing: "0" },
        button: {
          fontSize: "0.83rem",
          fontWeight: 600,
          letterSpacing: "0",
          textTransform: "none",
        },
        caption: { fontSize: "0.75rem", lineHeight: 1.5, letterSpacing: "0.005em" },
        overline: {
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          lineHeight: 1.6,
          textTransform: "none",
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              fontFamily: sans,
            },
          },
        },
        MuiPaper: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
            rounded: { borderRadius: 12 },
          },
        },
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: {
              border: `1px solid ${c.divider}`,
              borderRadius: 12,
              boxShadow: isDark
                ? "0 4px 6px -1px rgba(0,0,0,0.40), 0 2px 4px -1px rgba(0,0,0,0.35)"
                : "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)",
              backgroundImage: "none",
            },
          },
        },
        MuiCardHeader: {
          styleOverrides: {
            title: { fontFamily: display, fontSize: "1.02rem", fontWeight: 600, letterSpacing: "-0.02em" },
            subheader: { fontSize: "0.8rem" },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              padding: 20,
              "&:last-child": { paddingBottom: 20 },
            },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: {
              borderRadius: 8,
              textTransform: "none",
              fontWeight: 600,
              letterSpacing: "-0.005em",
              minHeight: 40,
              paddingInline: 18,
              paddingBlock: 8,
              boxShadow: "none",
            },
            contained: {
              "&:hover": { boxShadow: "none", backgroundColor: c.primaryDeep },
            },
            outlined: {
              borderColor: `color-mix(in srgb, ${c.primary} 38%, transparent)`,
              color: c.primary,
              "&:hover": { borderColor: c.primary, backgroundColor: c.selected },
            },
            text: {
              "&:hover": { backgroundColor: c.hover },
            },
            sizeLarge: { minHeight: 48, paddingInline: 26, fontSize: "0.95rem", borderRadius: 10 },
            sizeSmall: { minHeight: 32, paddingInline: 14, fontSize: "0.78rem", borderRadius: 6 },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: { borderRadius: 8, color: c.textSecondary },
          },
        },
        MuiButtonBase: {
          styleOverrides: {
            root: { borderRadius: 8 },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              backgroundColor: c.paper,
              fontSize: "0.9rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: c.divider },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.textSecondary },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: c.primary,
                borderWidth: 1.5,
              },
              "&.Mui-focused": { boxShadow: `0 0 0 3px ${c.selected}` },
            },
            input: { padding: "12px 14px" },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: { fontSize: "0.86rem", color: c.textSecondary },
          },
        },
        MuiSelect: {
          styleOverrides: {
            select: { padding: "11px 13px" },
          },
        },
        MuiFormHelperText: {
          styleOverrides: {
            root: { fontSize: "0.72rem", marginLeft: 2 },
          },
        },
        MuiFormLabel: {
          styleOverrides: {
            root: { fontSize: "0.86rem" },
          },
        },
        MuiTable: {
          styleOverrides: {
            root: { borderCollapse: "collapse" },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${c.divider}`,
              padding: "12px 16px",
              fontSize: "0.85rem",
            },
            head: {
              fontSize: "0.79rem",
              fontWeight: 600,
              letterSpacing: "0.005em",
              textTransform: "none",
              color: c.textSecondary,
              backgroundColor: "transparent",
              whiteSpace: "nowrap",
              paddingTop: 10,
              paddingBottom: 10,
            },
            body: { fontVariantNumeric: "tabular-nums" },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              "&:last-child td": { borderBottom: 0 },
              "&.MuiTableRow-hover:hover": { backgroundColor: c.hover },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 999,
              fontWeight: 600,
              fontSize: "0.72rem",
              height: 26,
            },
            outlined: { borderColor: c.divider },
          },
        },
        MuiAppBar: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: { backgroundImage: "none", boxShadow: "none" },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundImage: "none",
              borderRight: `1px solid ${c.divider}`,
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: { borderRadius: 10, minHeight: 40 },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            primary: { fontSize: "0.85rem" },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: { minHeight: 44, borderBottom: `1px solid ${c.divider}` },
            indicator: { height: 2, backgroundColor: c.primary },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.82rem",
              minHeight: 44,
              minWidth: 0,
              paddingInline: 14,
              letterSpacing: "0",
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 16,
              border: `1px solid ${c.divider}`,
              backgroundImage: "none",
              boxShadow: isDark
                ? "0 40px 80px -40px rgba(0, 0, 0, 0.85)"
                : "0 24px 60px -24px rgba(15,23,42,0.28)",
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: { fontFamily: display, fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.025em", paddingBottom: 4 },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: isDark ? "#e2e8f0" : "#0f172a",
              color: isDark ? "#0f172a" : "#ffffff",
              fontSize: "0.72rem",
              lineHeight: 1.5,
              borderRadius: 6,
              padding: "8px 10px",
              maxWidth: 240,
            },
            arrow: { color: isDark ? "#e2e8f0" : "#0f172a" },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: 12,
              border: `1px solid ${c.divider}`,
              boxShadow: "0 12px 32px -12px rgba(15, 23, 42, 0.24)",
              backgroundImage: "none",
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: { root: { fontSize: "0.84rem", minHeight: 38 } },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: { height: 6, borderRadius: 999, backgroundColor: c.hover },
            bar: { borderRadius: 999 },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: { borderRadius: 4, fontSize: "0.85rem" },
          },
        },
        MuiAvatar: {
          styleOverrides: {
            root: { fontFamily: display, fontWeight: 600 },
          },
        },
        MuiSkeleton: {
          styleOverrides: {
            root: { borderRadius: 4, backgroundColor: c.hover },
          },
        },
        MuiDivider: {
          styleOverrides: { root: { borderColor: c.divider } },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              borderRadius: 4,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
            },
          },
        },
        MuiAccordion: {
          styleOverrides: {
            root: {
              border: `1px solid ${c.divider}`,
              borderRadius: "12px !important",
              boxShadow: "none",
              backgroundImage: "none",
              "&:before": { display: "none" },
            },
          },
        },
        MuiBadge: {
          styleOverrides: {
            badge: { fontSize: "0.62rem", fontWeight: 700 },
          },
        },
        MuiSwitch: {
          styleOverrides: {
            root: { padding: 8 },
            track: { borderRadius: 999 },
            thumb: { boxShadow: "0 1px 3px rgba(15, 23, 42, 0.24)" },
          },
        },
      },
    });
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("fintrack-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
