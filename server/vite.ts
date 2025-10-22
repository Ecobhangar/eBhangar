// ✅ server/vite.ts — Clean version for backend-only deployment on Render

/**
 * This file disables Vite integration since we are running
 * only the backend on Render (no frontend build needed here).
 */

import type { Express } from "express";

export async function setupVite(_app: Express, _server: any) {
  console.log("⚙️ Skipping Vite setup — backend only mode.");
}

export function serveStatic(_app: Express) {
  console.log("⚙️ Skipping static file serving — backend only mode.");
}

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${formattedTime} [express] ${message}`);
}
