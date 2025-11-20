// server/controllers/bookingController.ts
import express from "express";
import { storage } from "../storage";

export const bookingRouter = express.Router();

/**
 * ---------------------------------------------------------
 * GET /api/bookings
 * Returns *all bookings* with items + vendor info
 * ---------------------------------------------------------
 */
bookingRouter.get("/", async (req, res) => {
  try {
    const bookings = await storage.getAllBookings();
    res.json(bookings);
  } catch (err: any) {
    console.error("❌ Error in GET /api/bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ---------------------------------------------------------
 * GET /api/bookings/:id
 * Returns a single booking with its items
 *
