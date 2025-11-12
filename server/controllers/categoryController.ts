import express from "express";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { categories } from "../db/schema.js"; // adjust this path if needed

const router = express.Router();

// ✅ Connect to Neon DB
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { categories } });

// ✅ /api/categories
router.get("/", async (req, res) => {
  try {
    // Example query (when real DB is ready):
    // const allCategories = await db.select().from(categories);
    // return res.json(allCategories);

    // Temporary dummy response
    const dummyCategories = [
      { id: 1, name: "Plastic" },
      { id: 2, name: "Metal" },
      { id: 3, name: "Paper" },
      { id: 4, name: "Electronics" }
    ];

    return res.status(200).json(dummyCategories);
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ message: "Server error fetching categories" });
  }
});

export { router as categoryRouter };
