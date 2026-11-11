import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          const modulePath = normalizedId.split("/node_modules/").pop();

          if (!modulePath || modulePath === normalizedId) return;
          if (/^(react|react-dom|scheduler)\//.test(modulePath)) {
            return "react-vendor";
          }
          if (/^(@mui|@emotion)\//.test(modulePath)) {
            return "ui-vendor";
          }
          if (/^(recharts|d3-[^/]+)\//.test(modulePath)) {
            return "chart-vendor";
          }
          if (/^(react-router|react-router-dom|@remix-run)\//.test(modulePath)) {
            return "router-vendor";
          }
          if (/^(@reduxjs|redux|redux-thunk|immer)\//.test(modulePath)) {
            return "state-vendor";
          }
          if (/^(react-icons|lucide-react|@heroicons)\//.test(modulePath)) {
            return "icon-vendor";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    pool: "forks",
  },
});
