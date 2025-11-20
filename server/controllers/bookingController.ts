import { Router } from "express";
import { storage } from "../storage";

export const bookingRouter = Router();

// GET all bookings
bookingRouter.get("/", async (req, res) => {
  try {
    const bookings = await storage.getAllBookings();
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single booking
bookingRouter.get("/:id", async (req, res) => {
  try {
    const booking = await storage.getBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
