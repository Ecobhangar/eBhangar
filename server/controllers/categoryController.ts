import express from "express";
import { drizzle } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { categories } from "../db/schema.js"; // adjust path based on your schema

const router = express.Router();

// ✅ Connect to Neon DB
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ✅ /api/categories
router.get("/", async (req, res) => {
  try {
    // Example category data — replace with DB query when ready
    const dummyCategories = [
      { id: 1, name: "Plastic" },
      { id: 2, name: "Metal" },
      { id: 3, name: "Paper" },
      { id: 4, name: "Electronics" }
    ];
    return res.json(dummyCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error fetching categories" });
  }
});

export { router as categoryRouter };
