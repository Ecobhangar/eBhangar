import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../shared/schema.js"; // ✅ Correct path to your schema file

// ✅ Connect to Neon PostgreSQL
const sql = neon(process.env.DATABASE_URL!);

// ✅ Initialize Drizzle ORM with your schema
export const db = drizzle(sql, { schema });

console.log("✅ Drizzle ORM connected to Neon Database");
