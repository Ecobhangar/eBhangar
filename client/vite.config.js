import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "/",

  plugins: [
    react(),

    // 🔥 THIS ENSURES _redirects GOES TO DIST ROOT 🔥
    viteStaticCopy({
      targets: [
        {
          src: "public/_redirects",
          dest: "./"  // IMPORTANT
        }
      ]
    }),
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
