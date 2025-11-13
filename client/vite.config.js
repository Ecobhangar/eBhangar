import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),

    // ✅ Copy _redirects file from /public into /dist (needed for Render SPA routing)
    viteStaticCopy({
      targets: [
        {
          src: resolve(__dirname, "public/_redirects"),
          dest: ".", // copy into dist root
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
