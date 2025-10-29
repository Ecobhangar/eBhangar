import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser } from "./middleware/auth";
import PDFDocument from "pdfkit";

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * ✅ OTP Verify Route (Fix for frontend login)
   */
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { phone, otp } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Mock Firebase test numbers
      const testNumbers = ["+917208360413", "+919226255355"];

      if (testNumbers.includes(phone) && otp === "123456") {
        return res.json({
          id: "test-user-" + phone.slice(-4),
          phone,
          name: "Test User",
          role: "customer",
        });
      }

      return res.status(404).json({ error: "Invalid or Not Found OTP" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * ✅ Auth Check Route (frontend fetches role after login)
   */
  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    try {
      const u = await storage.getUser(req.user!.id);
      if (!u) return res.status(404).json({ error: "User not found" });

      const phone = u.phoneNumber || u.phone || u.phone_number || null;
      const name = u.name || null;
      const role = u.role || "customer";

      return res.json({ id: u.id, phone, name, role });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * ✅ Categories route (for frontend category listing)
   */
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * ✅ Invoice PDF Example (optional test)
   */
  app.get("/api/test/pdf", async (req, res) => {
    try {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);
      doc.fontSize(20).text("eBhangar Test PDF ✅", { align: "center" });
      doc.end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * ✅ Fallback for invalid routes
   */
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
