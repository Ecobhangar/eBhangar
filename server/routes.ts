import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users, vendors } from "@shared/schema";
import { eq } from "drizzle-orm";
import { authenticateUser, requireRole } from "./middleware/auth";
import { insertUserSchema, insertCategorySchema, insertVendorSchema, insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { sendBookingNotification } from "./email";
import PDFDocument from "pdfkit";

export async function registerRoutes(app: Express): Promise<Server> {

  /**
   * ✅ NEW: Minimal auth route for frontend after OTP login
   * Returns compact JSON: { id, phone, role, name }
   * Frontend expects this at `${VITE_API_URL}/auth/me`
   */
  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    try {
      const u = await storage.getUser(req.user!.id);
      if (!u) return res.status(404).json({ error: "User not found" });

      // Try to be flexible about phone field naming
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

  // ===== User routes =====
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

  app.patch("/api/users/me", authenticateUser, async (req, res) => {
    try {
      const { name, address, pinCode, district, state } = req.body;
      const currentUser = await storage.getUser(req.user!.id);

      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });
      if (!address || !address.trim()) return res.status(400).json({ error: "Address is required" });

      const trimmedPinCode = pinCode?.trim() || "";
      if (!trimmedPinCode || !/^\d{6}$/.test(trimmedPinCode)) {
        return res.status(400).json({ error: "Valid 6-digit pin code is required" });
      }
      if (!district || !district.trim()) return res.status(400).json({ error: "District is required" });
      if (!state || !state.trim()) return res.status(400).json({ error: "State is required" });

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

  // ===== Category routes =====
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

  // ===== Vendor routes =====
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

  app.post("/api/vendors", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const { userId, location, pinCode, district, state } = req.body;
      const vendor = await storage.createVendor({
        userId,
        location,
        pinCode,
        district: district || "Mumbai",
        state: state || "Maharashtra"
      });

      await storage.updateUserRole(userId, "vendor");

      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== Vendor onboarding =====
  app.post("/api/admin/vendors/onboard", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const { name, phoneNumber, location, pinCode, district, state, aadharNumber, panNumber, active } = req.body;

      if (!name?.trim()) return res.status(400).json({ error: "Vendor name is required" });
      if (!phoneNumber?.trim()) return res.status(400).json({ error: "Phone number is required" });
      if (!location?.trim()) return res.status(400).json({ error: "Area/Locality is required" });

      const trimmedPinCode = pinCode?.trim() || "";
      if (!/^\d{6}$/.test(trimmedPinCode)) return res.status(400).json({ error: "Valid 6-digit pin code is required" });
      if (!district?.trim()) return res.status(400).json({ error: "District is required" });
      if (!state?.trim()) return res.status(400).json({ error: "State is required" });

      if (aadharNumber?.trim() && !/^\d{12}$/.test(aadharNumber.trim())) {
        return res.status(400).json({ error: "Aadhar number must be exactly 12 digits" });
      }

      if (panNumber?.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim().toUpperCase())) {
        return res.status(400).json({ error: "Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)" });
      }

      const existingUser = await storage.getUserByPhone(phoneNumber.trim());
      if (existingUser) return res.status(400).json({ error: "A user with this phone number already exists" });

      const user = await storage.createUser({
        phoneNumber: phoneNumber.trim(),
        name: name.trim(),
        pinCode: trimmedPinCode,
        role: "vendor"
      });

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

  // ===== Booking routes =====
  app.get("/api/bookings", authenticateUser, async (req, res) => {
    try {
      let bookings;

      if (req.user!.role === "admin") {
        bookings = await storage.getAllBookings();
      } else if (req.user!.role === "vendor") {
        const vendor = await storage.getVendorByUserId(req.user!.id);
        if (!vendor) return res.status(404).json({ error: "Vendor not found" });
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
      if (!booking) return res.status(404).json({ error: "Booking not found" });

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

      if (!customerName?.trim()) return res.status(400).json({ error: "Customer name is required" });
      if (!customerPhone?.trim()) return res.status(400).json({ error: "Customer phone is required" });
      if (!customerAddress?.trim()) return res.status(400).json({ error: "Customer address is required" });

      const bookingPinCode = pinCode?.trim() || "";
      if (!/^\d{6}$/.test(bookingPinCode)) return res.status(400).json({ error: "Valid 6-digit pin code is required" });
      if (!district?.trim()) return res.status(400).json({ error: "District is required" });
      if (!state?.trim()) return res.status(400).json({ error: "State is required" });

      if (!items || items.length === 0) return res.status(400).json({ error: "At least one item is required" });

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

      sendBookingNotification({
        id: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        items: items.map((item: any) => ({
          categoryName: item.categoryName,
          quantity: item.quantity,
          estimatedValue: item.value?.toString() || "0"
        })),
        totalValue: booking.totalValue
      }).catch(err => console.error("[email] Failed to send notification:", err));

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
      const { status, paymentMode } = req.body;

      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

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

      if (status === "completed" && !paymentMode) {
        return res.status(400).json({ error: "Payment mode is required when completing a booking" });
      }

      const updatedBooking = await storage.updateBookingStatus(req.params.id, status, paymentMode);

      if (status === "completed") {
        const existingInvoice = await storage.getInvoiceByBooking(req.params.id);

        if (!existingInvoice) {
          const vendor = booking.vendorId ? await storage.getVendor(booking.vendorId) : null;
          if (vendor) {
            const platformFeeSetting = await storage.getSetting("platform_fee_percent");
            const platformFeePercent = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 0;
            const platformFee = (parseFloat(booking.totalValue) * platformFeePercent) / 100;
            const netAmount = parseFloat(booking.totalValue) - platformFee;

            const invoiceNumber = `INV-${booking.referenceId?.replace("EBH-MUM-", "")}`;

            await storage.createInvoice({
              bookingId: booking.id,
              invoiceNumber,
              customerName: booking.customerName,
              customerPhone: booking.customerPhone,
              customerAddress: booking.customerAddress,
              vendorName: vendor.user.name || vendor.user.phoneNumber,
              vendorPhone: vendor.user.phoneNumber,
              totalValue: booking.totalValue,
              platformFee: platformFee.toFixed(2),
              netAmount: netAmount.toFixed(2),
              paymentMode: paymentMode || "cash"
            });
          }
        }
      }

      res.json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id/payment-status", authenticateUser, async (req, res) => {
    try {
      const { paymentStatus } = req.body;

      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

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

      const updatedBooking = await storage.updateBookingPaymentStatus(req.params.id, paymentStatus);
      res.json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/bookings/:id", authenticateUser, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (req.user!.role !== "admin" && booking.customerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

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
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (booking.customerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

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
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (booking.customerId !== req.user!.id) return res.status(403).json({ error: "Access denied" });

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

  // ===== Review routes =====
  app.post("/api/reviews", authenticateUser, async (req, res) => {
    try {
      const { bookingId, vendorId, rating, comment } = req.body;

      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (booking.status !== "completed") return res.status(400).json({ error: "Can only review completed bookings" });

      if (booking.customerId !== req.user!.id) return res.status(403).json({ error: "You can only review your own bookings" });

      const existingReview = await storage.getReviewByBooking(bookingId);
      if (existingReview) return res.status(400).json({ error: "Review already submitted for this booking" });

      const validatedData = insertReviewSchema.parse({
        bookingId,
        customerId: req.user!.id,
        vendorId,
        rating,
        comment
      });

      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/reviews/vendor/:vendorId", async (req, res) => {
    try {
      const { vendorId } = req.params;
      const reviews = await storage.getReviewsByVendor(vendorId);
      const averageRating = await storage.getVendorAverageRating(vendorId);

      res.json({
        reviews,
        averageRating,
        totalReviews: reviews.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reviews/booking/:bookingId", authenticateUser, async (req, res) => {
    try {
      const { bookingId } = req.params;
      const review = await storage.getReviewByBooking(bookingId);
      res.json(review || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== Booking rejection =====
  app.patch("/api/bookings/:id/reject", authenticateUser, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const vendor = await storage.getVendorByUserId(req.user!.id);
      if (!vendor && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only vendors and admins can reject bookings" });
      }

      const { reason } = req.body;
      if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const updatedBooking = await storage.rejectBooking(booking.id, reason.trim());
      res.json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== Invoice routes =====
  app.post("/api/invoices", authenticateUser, async (req, res) => {
    try {
      const { bookingId } = req.body;

      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (booking.status !== "completed") {
        return res.status(400).json({ error: "Can only generate invoice for completed bookings" });
      }

      const existingInvoice = await storage.getInvoiceByBooking(bookingId);
      if (existingInvoice) return res.json(existingInvoice);

      const vendor = booking.vendorId ? await storage.getVendor(booking.vendorId) : null;
      if (!vendor) return res.status(400).json({ error: "Vendor information not found" });

      const platformFeeSetting = await storage.getSetting("platform_fee_percent");
      const platformFeePercent = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 0;
      const platformFee = (parseFloat(booking.totalValue) * platformFeePercent) / 100;
      const netAmount = parseFloat(booking.totalValue) - platformFee;

      const invoiceNumber = `INV-${booking.referenceId?.replace("EBH-MUM-", "")}`;

      const invoice = await storage.createInvoice({
        bookingId: booking.id,
        invoiceNumber,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        vendorName: vendor.user.name || vendor.user.phoneNumber,
        vendorPhone: vendor.user.phoneNumber,
        totalValue: booking.totalValue,
        platformFee: platformFee.toFixed(2),
        netAmount: netAmount.toFixed(2),
        paymentMode: booking.paymentMode || "cash"
      });

      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices/booking/:bookingId", authenticateUser, async (req, res) => {
    try {
      const invoice = await storage.getInvoiceByBooking(req.params.bookingId);
      res.json(invoice || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PDF Download =====
  app.get("/api/invoices/:bookingId/download", authenticateUser, async (req, res) => {
    try {
      const { bookingId } = req.params;

      let invoice = await storage.getInvoiceByBooking(bookingId);

      if (!invoice) {
        const booking = await storage.getBooking(bookingId);
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        if (booking.status !== "completed") {
          return res.status(400).json({ error: "Can only generate invoice for completed bookings" });
        }

        const vendor = booking.vendorId ? await storage.getVendor(booking.vendorId) : null;
        if (!vendor) return res.status(400).json({ error: "Vendor information not found" });

        const platformFeeSetting = await storage.getSetting("platform_fee_percent");
        const platformFeePercent = platformFeeSetting ? parseFloat(platformFeeSetting.value) : 0;
        const platformFee = (parseFloat(booking.totalValue) * platformFeePercent) / 100;
        const netAmount = parseFloat(booking.totalValue) - platformFee;

        const invoiceNumber = `INV-${booking.referenceId?.replace("EBH-MUM-", "")}`;

        invoice = await storage.createInvoice({
          bookingId: booking.id,
          invoiceNumber,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          customerAddress: booking.customerAddress,
          vendorName: vendor.user.name || vendor.user.phoneNumber,
          vendorPhone: vendor.user.phoneNumber,
          totalValue: booking.totalValue,
          platformFee: platformFee.toFixed(2),
          netAmount: netAmount.toFixed(2),
          paymentMode: booking.paymentMode || "cash"
        });
      }

      const booking = await storage.getBooking(bookingId);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=eBhangar-Invoice-${booking.referenceId}.pdf`);

      doc.pipe(res);

      doc.fontSize(24).fillColor("#16a34a").text("eBhangar", { align: "center" });
      doc.fontSize(10).fillColor("#666").text("Eco Recycling Partner", { align: "center" });
      doc.moveDown();

      doc.fontSize(18).fillColor("#000").text("INVOICE", { align: "center" });
      doc.moveDown();

      doc.fontSize(10);
      const invoiceDate = booking.completedAt || invoice.createdAt || new Date();
      const istDate = new Date(invoiceDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
      const istTime = new Date(invoiceDate).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, doc.y);
      doc.text(`Booking Reference: ${booking.referenceId}`, 50, doc.y);
      doc.text(`Date: ${istDate}`, 50, doc.y);
      doc.text(`Time: ${istTime}`, 50, doc.y);
      doc.text(`Payment Mode: ${invoice.paymentMode.toUpperCase()}`, 50, doc.y);
      doc.moveDown();

      doc.fontSize(12).fillColor("#16a34a").text("CUSTOMER DETAILS", 50, doc.y);
      doc.fontSize(10).fillColor("#000");
      doc.text(`Name: ${invoice.customerName}`, 50, doc.y);
      doc.text(`Contact: ${invoice.customerPhone}`, 50, doc.y);
      doc.text(`Address: ${invoice.customerAddress}`, 50, doc.y, { width: 500 });
      doc.moveDown();

      doc.fontSize(12).fillColor("#16a34a").text("VENDOR DETAILS", 50, doc.y);
      doc.fontSize(10).fillColor("#000");
      doc.text(`Name: ${invoice.vendorName}`, 50, doc.y);
      doc.text(`Contact: ${invoice.vendorPhone}`, 50, doc.y);
      doc.moveDown();

      doc.fontSize(12).fillColor("#16a34a").text("SCRAP DETAILS", 50, doc.y);
      doc.moveDown(0.5);

      const tableTop = doc.y;
      doc.fontSize(9).fillColor("#000");
      doc.text("Item", 50, tableTop, { width: 200 });
      doc.text("Qty", 250, tableTop, { width: 60, align: "right" });
      doc.text("Rate", 320, tableTop, { width: 80, align: "right" });
      doc.text("Value", 410, tableTop, { width: 100, align: "right" });

      doc.moveTo(50, doc.y + 5).lineTo(520, doc.y + 5).stroke();
      doc.moveDown(0.5);

      // @ts-ignore
      booking.items.forEach((item) => {
        const y = doc.y;
        doc.text(item.categoryName, 50, y, { width: 200 });
        doc.text(item.quantity.toString(), 250, y, { width: 60, align: "right" });
        doc.text(`₹${parseFloat(item.rate).toFixed(2)}`, 320, y, { width: 80, align: "right" });
        doc.text(`₹${parseFloat(item.value).toFixed(2)}`, 410, y, { width: 100, align: "right" });
        doc.moveDown(0.8);
      });

      doc.moveTo(50, doc.y + 5).lineTo(520, doc.y + 5).stroke();
      doc.moveDown();

      doc.fontSize(10);
      doc.text(`Total Value:`, 350, doc.y, { width: 100, align: "right" });
      doc.text(`₹${parseFloat(invoice.totalValue).toFixed(2)}`, 450, doc.y, { width: 70, align: "right" });
      doc.moveDown(0.5);

      doc.text(`Platform Fee:`, 350, doc.y, { width: 100, align: "right" });
      doc.text(`₹${parseFloat(invoice.platformFee).toFixed(2)}`, 450, doc.y, { width: 70, align: "right" });
      doc.moveDown(0.5);

      doc.fontSize(12).fillColor("#16a34a");
      doc.text(`Net Amount:`, 350, doc.y, { width: 100, align: "right" });
      doc.text(`₹${parseFloat(invoice.netAmount).toFixed(2)}`, 450, doc.y, { width: 70, align: "right" });

      doc.moveDown(3);
      doc.fontSize(10).fillColor("#666").text(
        "Thank you for recycling with eBhangar ♻️ – Eco Recycling Partner",
        50,
        doc.page.height - 100,
        { align: "center", width: 500 }
      );

      doc.end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== Settings routes =====
  app.get("/api/settings/:key", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      res.json(setting || { key: req.params.key, value: "0" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/settings/:key", authenticateUser, requireRole("admin"), async (req, res) => {
    try {
      const { value } = req.body;
      if (value === undefined || value === null) {
        return res.status(400).json({ error: "Value is required" });
      }

      const setting = await storage.updateSetting(req.params.key, value.toString());
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== Seed categories (one-time) =====
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
          // skip duplicates
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
