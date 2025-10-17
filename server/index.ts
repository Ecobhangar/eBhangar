import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { corsOptions } from "./config/cors";
import { db } from "./db";
import { categories } from "../shared/schema";
import { sql } from "drizzle-orm";

const app = express();
app.use(corsOptions); // Enable CORS for external deployments
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Auto-seed categories on startup if empty
async function seedCategoriesIfEmpty() {
  try {
    // Efficient check: count instead of loading all rows
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const count = Number(result?.count) || 0;
    
    if (count === 0) {
      log('🌱 Seeding categories...');
      
      const seedData = [
        { id: '7bf337dc-dfc7-4512-90ba-3995fd09787d', name: 'Old AC', unit: 'unit', minRate: '800.00', maxRate: '1500.00', icon: 'AirVent' },
        { id: '3328fffe-35d4-4efc-b66e-41b0adc7da34', name: 'Refrigerator', unit: 'unit', minRate: '1200.00', maxRate: '2000.00', icon: 'Refrigerator' },
        { id: '5639017a-b647-4fb0-b51b-51e1ae273342', name: 'Washing Machine', unit: 'unit', minRate: '600.00', maxRate: '1200.00', icon: 'WashingMachine' },
        { id: '60d57280-788c-4bc4-9953-d6d6c0ec33f8', name: 'Iron', unit: 'unit', minRate: '100.00', maxRate: '300.00', icon: 'CircuitBoard' },
        { id: '326f4781-19eb-4db8-89f3-84ab23a90ee5', name: 'Copper', unit: 'kg', minRate: '400.00', maxRate: '500.00', icon: 'CircuitBoard' },
        { id: 'e8729ec3-e59e-4cf0-9817-c07b73dfa44d', name: 'Plastic', unit: 'kg', minRate: '10.00', maxRate: '20.00', icon: 'Trash2' },
        { id: 'ed0bfaac-26c7-4135-88cb-81428f894b2d', name: 'Paper', unit: 'kg', minRate: '8.00', maxRate: '15.00', icon: 'FileText' },
        { id: 'd97876ff-d1ea-4bf7-af02-50c9acb93c89', name: 'Books', unit: 'kg', minRate: '12.00', maxRate: '18.00', icon: 'BookOpen' },
        { id: '2afce35f-5e04-4afd-8bda-376bbb87eeda', name: 'Clothes', unit: 'kg', minRate: '5.00', maxRate: '10.00', icon: 'Shirt' }
      ];
      
      // Use onConflictDoNothing to prevent crashes on duplicate IDs
      await db.insert(categories).values(seedData).onConflictDoNothing();
      log('✅ Categories seeded successfully!');
    }
  } catch (error) {
    log(`⚠️  Category seed error: ${error}`);
  }
}

(async () => {
  // Seed categories first
  await seedCategoriesIfEmpty();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // For Replit deployments, PORT is automatically set by the platform
  // For local development, default to 5001
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
