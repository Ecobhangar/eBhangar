import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "/", // VERY IMPORTANT for Render static routing

  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/_redirects", // copy redirects file
          dest: "."                // put inside dist root
        }
      ]
    })
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
});
