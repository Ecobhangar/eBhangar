import { db } from "./db";
import { categories } from "@shared/schema";

const scrapCategories = [
  { name: "Old AC", unit: "unit", minRate: "800", maxRate: "1500", icon: "AirVent" },
  { name: "Refrigerator", unit: "unit", minRate: "1200", maxRate: "2000", icon: "Refrigerator" },
  { name: "Washing Machine", unit: "unit", minRate: "600", maxRate: "1200", icon: "WashingMachine" },
  { name: "Iron", unit: "unit", minRate: "100", maxRate: "300", icon: "CircuitBoard" },
  { name: "Copper", unit: "kg", minRate: "400", maxRate: "500", icon: "CircuitBoard" },
  { name: "Plastic", unit: "kg", minRate: "10", maxRate: "20", icon: "Trash2" },
  { name: "Paper", unit: "kg", minRate: "8", maxRate: "15", icon: "FileText" },
  { name: "Books", unit: "kg", minRate: "12", maxRate: "18", icon: "BookOpen" },
  { name: "Clothes", unit: "kg", minRate: "5", maxRate: "10", icon: "Shirt" },
];

async function seed() {
  try {
    console.log("Seeding categories...");
    
    for (const category of scrapCategories) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }
    
    console.log("Categories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seed();
