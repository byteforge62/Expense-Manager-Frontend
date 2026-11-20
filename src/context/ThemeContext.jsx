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
    primary: "#6735c8",
    primaryDeep: "#4922a8",
    primaryContrast: "#ffffff",
    secondary: "#4c6fa8",
    secondaryContrast: "#ffffff",
    background: "#f7f6f3",
    paper: "#ffffff",
    text: "#191922",
    textSecondary: "#5b5b69",
    textDisabled: "#9494a0",
    divider: "#e7e3da",
    hover: "rgba(25, 25, 34, 0.04)",
    selected: "rgba(103, 53, 200, 0.08)",
    success: "#1f9d6b",
    error: "#d94f43",
    warning: "#b07c26",
    info: "#4c6fa8",
    accent: "#6735c8",
    brass: "#4c6fa8",
  },
  dark: {
    primary: "#b199f5",
    primaryDeep: "#8f74e6",
    primaryContrast: "#1c1233",
    secondary: "#7fa5e0",
    secondaryContrast: "#0e0e14",
    background: "#121218",
    paper: "#1a1a22",
    text: "#f0eee9",
    textSecondary: "#c3c1cc",
    textDisabled: "#85838f",
    divider: "rgba(240, 238, 233, 0.11)",
    hover: "rgba(240, 238, 233, 0.05)",
    selected: "rgba(177, 153, 245, 0.14)",
    success: "#55c79b",
    error: "#ff8a7a",
    warning: "#e0b36c",
    info: "#7fa5e0",
    accent: "#b199f5",
    brass: "#7fa5e0",
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
    const display = '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif';
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
      shape: { borderRadius: 6 },
      shadows: Array.from({ length: 25 }, (_, i) =>
        i === 0
          ? "none"
          : isDark
            ? "0 2px 6px rgba(0,0,0,0.4), 0 30px 60px -38px rgba(0,0,0,0.9)"
            : "0 1px 2px rgba(25,25,34,0.04), 0 18px 44px -30px rgba(37,21,76,0.28)",
      ),
      typography: {
        fontFamily: sans,
        fontSize: 14.5,
        htmlFontSize: 16,
        h1: {
          fontFamily: display,
          fontSize: "clamp(2.1rem, 4.6vw, 3.5rem)",
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: "-0.042em",
        },
        h2: {
          fontFamily: display,
          fontSize: "clamp(1.75rem, 3.1vw, 2.55rem)",
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.038em",
        },
        h3: {
          fontFamily: display,
          fontSize: "clamp(1.45rem, 2.2vw, 1.95rem)",
          fontWeight: 600,
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
        },
        h4: {
          fontFamily: display,
          fontSize: "clamp(1.3rem, 1.8vw, 1.6rem)",
          fontWeight: 600,
          lineHeight: 1.18,
          letterSpacing: "-0.028em",
        },
        h5: {
          fontFamily: display,
          fontSize: "1.25rem",
          fontWeight: 600,
          lineHeight: 1.22,
          letterSpacing: "-0.022em",
        },
        h6: {
          fontFamily: display,
          fontSize: "1.06rem",
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: "-0.018em",
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
            rounded: { borderRadius: 16 },
          },
        },
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: {
              border: `1px solid ${c.divider}`,
              borderRadius: 16,
              boxShadow: "none",
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
              borderRadius: 999,
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
              borderColor: c.divider,
              "&:hover": { borderColor: c.primary, backgroundColor: c.selected },
            },
            text: {
              "&:hover": { backgroundColor: c.hover },
            },
            sizeLarge: { minHeight: 48, paddingInline: 24, fontSize: "0.92rem" },
            sizeSmall: { minHeight: 32, paddingInline: 13, fontSize: "0.78rem" },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: { borderRadius: 10, color: c.textSecondary },
          },
        },
        MuiButtonBase: {
          styleOverrides: {
            root: { borderRadius: 10 },
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
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
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
              borderRadius: 20,
              border: `1px solid ${c.divider}`,
              backgroundImage: "none",
              boxShadow: isDark
                ? "0 40px 80px -40px rgba(0, 0, 0, 0.85)"
                : "0 2px 6px rgba(25,25,34,0.05), 0 40px 80px -44px rgba(37,21,76,0.4)",
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
              backgroundColor: isDark ? "#ecebe6" : "#15161a",
              color: isDark ? "#111116" : "#ffffff",
              fontSize: "0.72rem",
              borderRadius: 3,
              padding: "6px 9px",
            },
            arrow: { color: isDark ? "#ecebe6" : "#15161a" },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: 14,
              border: `1px solid ${c.divider}`,
              boxShadow: "0 24px 44px -32px rgba(10, 10, 14, 0.35)",
              backgroundImage: "none",
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: { root: { fontSize: "0.84rem", minHeight: 38 } },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: { height: 6, borderRadius: 2, backgroundColor: c.hover },
            bar: { borderRadius: 2 },
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
              borderRadius: "6px !important",
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
