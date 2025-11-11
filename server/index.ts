import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Allowed Frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://ebhangar-fronted.onrender.com",
];

// ✅ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (mobile apps / curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "x-user-phone"],
  })
);

// ✅ Preflight requests
app.options("*", cors());

// ✅ JSON + Cookies Parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Health Check (Render startup)
app.get("/", (req, res) => {
  res.json({
    status: "✅ eBhangar Backend Live",
    time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  });
});

// ✅ Register all API routes
(async () => {
  try {
    await registerRoutes(app);
    console.log("✅ All routes registered successfully");
  } catch (err) {
    console.error("❌ Error registering routes", err);
  }
})();

// ✅ Unknown API route fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start Server
const httpServer = createServer(app);
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Backend URL: https://ebhangar.onrender.com`);
});

export default app;
