import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// ✅ Vite configuration for eBhangar frontend (Render + Local)
export default defineConfig({
  plugins: [
    react(),

    // ✅ Ensure the _redirects file from public/ is copied into dist/
    viteStaticCopy({
      targets: [
        {
          src: resolve(__dirname, "public/_redirects"), // source file
          dest: "", // destination = dist root
        },
      ],
    }),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    open: true,
  },
});
