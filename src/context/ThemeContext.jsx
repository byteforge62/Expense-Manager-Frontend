import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const saved = localStorage.getItem("fintrack-theme");

    if (saved) return saved;

    // fallback to system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: {
            main: theme === "dark" ? "#76aaff" : "#3985ff",
            contrastText: "#101a2b",
          },
          background: {
            default: theme === "dark" ? "#171b23" : "#f1f0eb",
            paper: theme === "dark" ? "#222a36" : "#faf9f5",
          },
          text: {
            primary: theme === "dark" ? "#e9e7e0" : "#222a36",
            secondary: theme === "dark" ? "#c1c8d1" : "#465160",
          },
          divider:
            theme === "dark"
              ? "rgba(233, 231, 224, 0.12)"
              : "rgba(34, 42, 54, 0.12)",
          action: {
            selected:
              theme === "dark"
                ? "rgba(118, 170, 255, 0.13)"
                : "rgba(57, 133, 255, 0.10)",
          },

          cyan: {
            main: theme === "dark" ? "#76aaff" : "#3985ff",
          },

          emerald: {
            main: "#45b889",
          },

          rose: {
            main: "#f07870",
          },

          indigo: {
            main: theme === "dark" ? "#a9c8f5" : "#4d74ad",
          },

          violet: {
            main: theme === "dark" ? "#76aaff" : "#3985ff",
          },
          success: {
            main: "#45b889",
          },
          error: {
            main: "#f07870",
          },
          warning: {
            main: "#e8b66b",
          },
        },
      }),
    [theme],
  );
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
