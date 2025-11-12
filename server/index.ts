import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { userRouter } from "./controllers/userController.js";
import { categoryRouter } from "./controllers/categoryController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS setup for Render frontend
app.use(
  cors({
    origin: [
      "https://ebhangar-fronted.onrender.com",
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ eBhangar Backend is Live and Healthy 🚀");
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
