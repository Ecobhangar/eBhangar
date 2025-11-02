import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
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
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
  server: {
    port: 5173,
    open: true,
    historyApiFallback: true, // ✅ critical for React SPA
  },
  preview: {
    port: 8080,
  },
});
