import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy"; // ✅ import this plugin

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      // ✅ ensures _redirects gets copied into the final dist folder
      targets: [{ src: "_redirects", dest: "." }],
    }),
  ],
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
    historyApiFallback: true, // ✅ for React Router in dev mode
  },
  preview: {
    port: 8080,
  },
});
