import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "/",

  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/_redirects",
          dest: "."
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
  },
});
