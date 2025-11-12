import express from "express";
import { drizzle } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { users } from "../db/schema.js"; // adjust this import based on your schema

const router = express.Router();

// ✅ Neon database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ✅ /api/users/me
router.get("/me", async (req, res) => {
  try {
    // Example: If user session/cookie is not implemented yet, return demo
    const demoUser = {
      id: 1,
      name: "Demo User",
      email: "demo@ebhangar.com",
      profileComplete: false,
    };
    return res.json(demoUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
});

export { router as userRouter };
