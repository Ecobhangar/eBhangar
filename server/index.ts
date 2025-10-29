import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 10000;

// ====== Middleware Setup ======
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ====== Health Check (for Render startup) ======
app.get("/", (req, res) => {
  res.json({
    status: "✅ eBhangar Backend Live",
    time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  });
});

// ====== Register All Routes ======
(async () => {
  try {
    await registerRoutes(app);
    console.log("✅ All routes registered successfully");
  } catch (error) {
    console.error("❌ Failed to register routes:", error);
  }
})();

// ====== Fallback for unknown routes ======
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ====== Start Server ======
const httpServer = createServer(app);
httpServer.listen(PORT, () => {
  console.log(`🚀 eBhangar backend running on port ${PORT}`);
  console.log(`🌐 URL: https://ebhangar.onrender.com`);
});

export default app;
