import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// ✅ Final production-ready Vite config (Render compatible)
export default defineConfig({
  plugins: [
    react(),
    // 🔹 Ensure _redirects file gets copied to dist/
    viteStaticCopy({
      targets: [
        {
          src: "_redirects",
          dest: ".", // copy to dist root
        },
      ],
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
      input: "index.html",
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  preview: {
    port: 8080,
  },
});
