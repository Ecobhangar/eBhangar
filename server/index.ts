// server/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { userRouter } from "./controllers/userController.js";
import { categoryRouter } from "./controllers/categoryController.js";
import { bookingRouter } from "./controllers/bookingController.js";
import { db } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Correct CORS for your real frontend
app.use(
  cors({
    origin: [
      "https://ebhangar-app.onrender.com",  // your frontend
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------  API ROUTES  --------------------- */

app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/bookings", bookingRouter);

// Health Check
app.get("/", (req, res) => {
  res.send("✅ eBhangar Backend is Live and Healthy 🚀");
});

/* -------------------  NOT FOUND  --------------------- */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ------------------- GLOBAL ERROR HANDLER -------------- */

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ------------------- START SERVER --------------------- */

app.listen(PORT, () => {
  console.log("✅ All routes registered successfully");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Backend URL: https://ebhangar.onrender.com`);
});
