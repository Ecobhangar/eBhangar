import express from "express";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { users } from "../../shared/schema.js"; // ✅ Correct schema path

const router = express.Router();

// ✅ Connect to Neon PostgreSQL via Drizzle ORM
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { users } });

// ✅ /api/users/me — returns logged-in user (temporary dummy data)
router.get("/me", async (req, res) => {
  try {
    // 🧩 Replace this with real DB logic later
    // const currentUser = await db.select().from(users).where(eq(users.id, 1));

    const demoUser = {
      id: 1,
      name: "Demo User",
      email: "demo@ebhangar.com",
      role: "User",
      profileComplete: false,
    };

    return res.status(200).json(demoUser);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
});

export { router as userRouter };
