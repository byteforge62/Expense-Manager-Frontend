import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    pool: "forks",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "e2e/**",
    ],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor";
          }

          if (id.includes("@mui") || id.includes("@emotion")) {
            return "mui-vendor";
          }

          if (id.includes("recharts") || id.includes("d3-")) {
            return "charts-vendor";
          }

          if (id.includes("framer-motion")) {
            return "motion-vendor";
          }

          if (
            id.includes("@reduxjs") ||
            id.includes("react-redux") ||
            id.includes("redux")
          ) {
            return "redux-vendor";
          }
        },
      },
    },
  },
});
