import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, requireRole } from "./middleware/auth";
import { insertUserSchema, insertCategorySchema, insertVendorSchema, insertBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/users/me", authenticateUser, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      res.json(user);
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

      const user = await storage.updateUserRole(id, role);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/me", authenticateUser, async (req, res) => {
    try {
      const { name, address } = req.body;
      const currentUser = await storage.getUser(req.user!.id);
      
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // For now, we'll return the user as-is since we don't have an update method
      // TODO: Add updateUser method to storage
      res.json(currentUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Category routes
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

  // Vendor routes
  app.get("/api/vendors", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendors", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const { userId, location } = req.body;
      const vendor = await storage.createVendor({ userId, location });
      
      // Update user role to vendor
      await storage.updateUserRole(userId, "vendor");
      
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Booking routes
  app.get("/api/bookings", authenticateUser, async (req, res) => {
    try {
      let bookings;
      
      if (req.user!.role === "admin") {
        bookings = await storage.getAllBookings();
      } else if (req.user!.role === "vendor") {
        const vendor = await storage.getVendorByUserId(req.user!.id);
        if (!vendor) {
          return res.status(404).json({ error: "Vendor not found" });
        }
        bookings = await storage.getBookingsByVendor(vendor.id);
      } else {
        bookings = await storage.getBookingsByCustomer(req.user!.id);
      }
      
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bookings/:id", authenticateUser, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Check permissions
      if (req.user!.role !== "admin" && booking.customerId !== req.user!.id) {
        if (req.user!.role === "vendor") {
          const vendor = await storage.getVendorByUserId(req.user!.id);
          if (!vendor || booking.vendorId !== vendor.id) {
            return res.status(403).json({ error: "Access denied" });
          }
        } else {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bookings", authenticateUser, async (req, res) => {
    try {
      const { customerName, customerPhone, customerAddress, items, totalValue } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }

      const booking = await storage.createBooking(
        {
          customerId: req.user!.id,
          customerName,
          customerPhone,
          customerAddress,
          totalValue: totalValue.toString()
        },
        items
      );

      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id/assign", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const { vendorId } = req.body;
      const booking = await storage.assignVendor(req.params.id, vendorId);
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id/status", authenticateUser, async (req, res) => {
    try {
      const { status } = req.body;
      
      // Only admin and assigned vendor can update status
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (req.user!.role !== "admin") {
        if (req.user!.role === "vendor") {
          const vendor = await storage.getVendorByUserId(req.user!.id);
          if (!vendor || booking.vendorId !== vendor.id) {
            return res.status(403).json({ error: "Access denied" });
          }
        } else {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      const updatedBooking = await storage.updateBookingStatus(req.params.id, status);
      res.json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
