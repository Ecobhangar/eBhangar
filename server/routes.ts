import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, requireRole } from "./middleware/auth";
import { insertUserSchema, insertCategorySchema, insertVendorSchema, insertBookingSchema } from "@shared/schema";
import { sendBookingNotification } from "./email";

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
      const { name, address, pinCode, district, state } = req.body;
      const currentUser = await storage.getUser(req.user!.id);
      
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate required fields
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name is required" });
      }
      if (!address || !address.trim()) {
        return res.status(400).json({ error: "Address is required" });
      }
      const trimmedPinCode = pinCode?.trim() || "";
      if (!trimmedPinCode || !/^\d{6}$/.test(trimmedPinCode)) {
        return res.status(400).json({ error: "Valid 6-digit pin code is required" });
      }
      if (!district || !district.trim()) {
        return res.status(400).json({ error: "District is required" });
      }
      if (!state || !state.trim()) {
        return res.status(400).json({ error: "State is required" });
      }

      const updatedUser = await storage.updateUser(req.user!.id, {
        name: name.trim(),
        address: address.trim(),
        pinCode: pinCode.trim(),
        district: district.trim(),
        state: state.trim()
      });

      res.json(updatedUser);
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
      const { userId, location, pinCode } = req.body;
      const vendor = await storage.createVendor({ userId, location, pinCode });
      
      // Update user role to vendor
      await storage.updateUserRole(userId, "vendor");
      
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vendor onboarding - creates both user and vendor
  app.post("/api/admin/vendors/onboard", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const { name, phoneNumber, location, pinCode, district, state, aadharNumber, panNumber, active } = req.body;

      // Validate required fields
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Vendor name is required" });
      }
      if (!phoneNumber || !phoneNumber.trim()) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      if (!location || !location.trim()) {
        return res.status(400).json({ error: "Area/Locality is required" });
      }
      const trimmedPinCode = pinCode?.trim() || "";
      if (!trimmedPinCode || !/^\d{6}$/.test(trimmedPinCode)) {
        return res.status(400).json({ error: "Valid 6-digit pin code is required" });
      }
      if (!district || !district.trim()) {
        return res.status(400).json({ error: "District is required" });
      }
      if (!state || !state.trim()) {
        return res.status(400).json({ error: "State is required" });
      }

      // Validate Aadhar Number (12 digits, optional)
      if (aadharNumber && aadharNumber.trim()) {
        const trimmedAadhar = aadharNumber.trim();
        if (!/^\d{12}$/.test(trimmedAadhar)) {
          return res.status(400).json({ error: "Aadhar number must be exactly 12 digits" });
        }
      }

      // Validate PAN Number (10 alphanumeric characters in format: 5 letters, 4 digits, 1 letter, optional)
      if (panNumber && panNumber.trim()) {
        const trimmedPan = panNumber.trim().toUpperCase();
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(trimmedPan)) {
          return res.status(400).json({ error: "Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)" });
        }
      }

      // Check if user with phone already exists
      const existingUser = await storage.getUserByPhone(phoneNumber.trim());
      if (existingUser) {
        return res.status(400).json({ error: "A user with this phone number already exists" });
      }

      // Create user with vendor role
      const user = await storage.createUser({
        phoneNumber: phoneNumber.trim(),
        name: name.trim(),
        pinCode: trimmedPinCode,
        role: "vendor"
      });

      // Create vendor profile
      const vendor = await storage.createVendor({
        userId: user.id,
        location: location.trim(),
        pinCode: trimmedPinCode,
        district: district.trim(),
        state: state.trim(),
        aadharNumber: aadharNumber?.trim() || null,
        panNumber: panNumber?.trim().toUpperCase() || null,
        active: active !== undefined ? active : true
      });

      res.json({ user, vendor });
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
      const { customerName, customerPhone, customerAddress, pinCode, district, state, items, totalValue } = req.body;
      
      // Validate required customer details
      if (!customerName || !customerName.trim()) {
        return res.status(400).json({ error: "Customer name is required" });
      }
      if (!customerPhone || !customerPhone.trim()) {
        return res.status(400).json({ error: "Customer phone is required" });
      }
      if (!customerAddress || !customerAddress.trim()) {
        return res.status(400).json({ error: "Customer address is required" });
      }
      const bookingPinCode = pinCode?.trim() || "";
      if (!bookingPinCode || !/^\d{6}$/.test(bookingPinCode)) {
        return res.status(400).json({ error: "Valid 6-digit pin code is required" });
      }
      if (!district || !district.trim()) {
        return res.status(400).json({ error: "District is required" });
      }
      if (!state || !state.trim()) {
        return res.status(400).json({ error: "State is required" });
      }
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }

      const booking = await storage.createBooking(
        {
          customerId: req.user!.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          pinCode: pinCode.trim(),
          district: district.trim(),
          state: state.trim(),
          totalValue: totalValue.toString()
        },
        items
      );

      // Send email notification to admin (async, non-blocking)
      sendBookingNotification({
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        items: items.map((item: any) => ({
          categoryName: item.categoryName,
          quantity: item.quantity,
          estimatedValue: item.value?.toString() || '0'
        })),
        totalValue: booking.totalValue
      }).catch(err => console.error('[email] Failed to send notification:', err));

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

  app.delete("/api/bookings/:id", authenticateUser, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Only customer who created the booking or admin can delete
      if (req.user!.role !== "admin" && booking.customerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only pending bookings can be deleted
      if (booking.status !== "pending") {
        return res.status(400).json({ error: "Only pending bookings can be deleted" });
      }

      await storage.deleteBooking(req.params.id);
      res.json({ message: "Booking deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id/cancel", authenticateUser, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Only customer who created the booking can cancel
      if (booking.customerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only assigned bookings can be cancelled
      if (booking.status !== "assigned") {
        return res.status(400).json({ error: "Only assigned bookings can be cancelled" });
      }

      const updatedBooking = await storage.cancelBooking(req.params.id);
      res.json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id", authenticateUser, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Only customer who created the booking can edit
      if (booking.customerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only pending bookings can be edited
      if (booking.status !== "pending") {
        return res.status(400).json({ error: "Only pending bookings can be edited" });
      }

      const { customerName, customerPhone, customerAddress, items, totalValue } = req.body;
      
      const updatedBooking = await storage.updateBooking(
        req.params.id,
        {
          customerName,
          customerPhone,
          customerAddress,
          totalValue: totalValue?.toString()
        },
        items
      );

      res.json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
