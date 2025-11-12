import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { userRouter } from "./controllers/userController.js";
import { categoryRouter } from "./controllers/categoryController.js";
import { db } from "./db.js"; // ✅ Ensure DB connection initializes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS setup for frontend (Render + Local)
app.use(
  cors({
    origin: [
      "https://ebhangar-fronted.onrender.com", // Render frontend
      "http://localhost:5173" // Local dev frontend
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ API Routes
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ eBhangar Backend is Live and Healthy 🚀");
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler (for unexpected issues)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log("✅ All routes registered successfully");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Backend URL: https://ebhangar.onrender.com`);
});
