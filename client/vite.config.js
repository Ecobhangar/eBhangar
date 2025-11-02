import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ Vite config with proper React routing support for Render
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    open: true,
  },
  // ✅ Ensure Render handles SPA routes like /login
  preview: {
    port: 8080,
  },
});
