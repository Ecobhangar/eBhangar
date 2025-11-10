import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "_redirects", dest: "." } // ✅ copy to dist root
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
  },

  server: {
    port: 5173,
    open: true,
  },

  preview: {
    port: 8080,
  },

  // ✅ Required for SPA routing (Render needs this too)
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth"],
  },
});
