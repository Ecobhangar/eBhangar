import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users, vendors } from "@shared/schema";
import { eq } from "drizzle-orm";
import { authenticateUser, requireRole } from "./middleware/auth";
import {
  insertCategorySchema,
  insertReviewSchema,
} from "@shared/schema";
import { sendBookingNotification } from "./email";
import PDFDocument from "pdfkit";

export async function registerRoutes(app: Express): Promise<Server> {

  // ✅ Fix for frontend login “Not Found” issue
  // Frontend calls /api/auth/me after OTP verification
  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    try {
      const u = await storage.getUser(req.user!.id);
      if (!u) return res.status(404).json({ error: "User not found" });

      const phone =
        // @ts-ignore
        u.phoneNumber || u.phone || u.phone_number || null;
      // @ts-ignore
      const name = u.name || null;
      // @ts-ignore
      const role = u.role || "customer";

      return res.json({
        // @ts-ignore
        id: u.id,
        phone,
        role,
        name,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ========== USER ROUTES ==========
  app.get("/api/users/me", authenticateUser, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const usersList = await storage.getAllUsers();
      res.json(usersList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id/role", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!["customer", "admin", "vendor"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const userData = await storage.getUser(id);
      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = await db.transaction(async (tx) => {
        if (role === "vendor") {
          const existingVendor = await tx.select().from(vendors).where(eq(vendors.userId, id));
          if (existingVendor.length === 0) {
            await tx.insert(vendors).values({
              userId: id,
              // @ts-ignore
              location: userData.address || "To be updated",
              // @ts-ignore
              pinCode: userData.pinCode || null,
              // @ts-ignore
              district: userData.district || "To be updated",
              // @ts-ignore
              state: userData.state || "To be updated",
              aadharNumber: null,
              panNumber: null,
              active: true
            });
          }
        }

        const result = await tx.update(users).set({ role }).where(eq(users.id, id)).returning();
        return result[0];
      });

      res.json(user);
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to update user role",
        details: error.message
      });
    }
  });

  // ========== CATEGORY ROUTES ==========
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== VENDOR ROUTES ==========
  app.get("/api/vendors", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const vendorList = await storage.getAllVendors();
      res.json(vendorList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendors/me", authenticateUser, requireRole("vendor"), async (req, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.user!.id);
      if (!vendor) return res.status(404).json({ error: "Vendor profile not found" });
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== SEED ROUTE ==========
  app.post("/api/seed/categories", async (req, res) => {
    try {
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

      let inserted = 0;
      for (const category of scrapCategories) {
        try {
          await storage.createCategory(category);
          inserted++;
        } catch {
          // ignore duplicates
        }
      }

      res.json({
        success: true,
        message: `Seeded ${inserted} categories successfully!`,
        total: scrapCategories.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
