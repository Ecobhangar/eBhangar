import { db } from "./db";
import {
  users,
  categories,
  vendors,
  bookings,
  bookingItems,
  reviews,
  invoices,
  settings,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Vendor,
  type InsertVendor,
  type Booking,
  type InsertBooking,
  type BookingItem,
  type InsertBookingItem,
  type Review,
  type InsertReview,
  type Invoice,
  type InsertInvoice,
  type Settings,
  type InsertSettings,
} from "@shared/schema";
import { eq, desc, avg, like } from "drizzle-orm";

/**
 * ===========================================
 * STORAGE CLASS
 * ===========================================
 */
export class DbStorage {
  /* ---------------------- USERS ---------------------- */

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const result = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  /* ---------------------- CATEGORIES ---------------------- */

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  /* ---------------------- VENDORS ---------------------- */

  async getAllVendors(): Promise<(Vendor & { user: User })[]> {
    const result = await db
      .select()
      .from(vendors)
      .leftJoin(users, eq(vendors.userId, users.id));

    return result.map((row: any) => ({
      ...row.vendors,
      user: row.users!,
    }));
  }

  async getVendor(id: string): Promise<(Vendor & { user: User }) | undefined> {
    const result = await db
      .select()
      .from(vendors)
      .leftJoin(users, eq(vendors.userId, users.id))
      .where(eq(vendors.id, id));

    if (result.length === 0) return undefined;

    return {
      ...result[0].vendors,
      user: result[0].users!,
    };
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return result[0];
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(vendor).returning();
    return result[0];
  }

  /* ---------------------- BOOKINGS ---------------------- */

  async getAllBookings(): Promise<
    (Booking & { items: BookingItem[]; vendor?: { name: string; phone: string } })[]
  > {
    const allBookings = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));

    const bookingsWithItems = await Promise.all(
      allBookings.map(async (booking: Booking) => {
        const items = await db
          .select()
          .from(bookingItems)
          .where(eq(bookingItems.bookingId, booking.id));

        let vendor = undefined;

        if (booking.vendorId) {
          const vendorResult = await db
            .select({
              name: users.name,
              phone: users.phoneNumber,
            })
            .from(vendors)
            .leftJoin(users, eq(vendors.userId, users.id))
            .where(eq(vendors.id, booking.vendorId));

          if (vendorResult.length > 0 && vendorResult[0].phone) {
            vendor = {
              name: vendorResult[0].name || vendorResult[0].phone,
              phone: vendorResult[0].phone,
            };
          }
        }

        return { ...booking, items, vendor };
      })
    );

    return bookingsWithItems;
  }

  async getBookingsByCustomer(customerId: string) {
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.createdAt));

    return this.attachItemsAndVendor(result);
  }

  async getBookingsByVendor(vendorId: string) {
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.vendorId, vendorId))
      .orderBy(desc(bookings.createdAt));

    return this.attachItemsAndVendor(result);
  }

  async getBooking(id: string) {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    if (result.length === 0) return undefined;

    const items = await db.select().from(bookingItems).where(eq(bookingItems.bookingId, id));
    return { ...result[0], items };
  }

  async createBooking(booking: InsertBooking, items: InsertBookingItem[]): Promise<Booking> {
    const referenceId = await this.generateBookingReferenceId();
    const result = await db.insert(bookings).values({ ...booking, referenceId }).returning();
    const createdBooking = result[0];

    if (items.length > 0) {
      await db.insert(bookingItems).values(
        items.map((i) => ({ ...i, bookingId: createdBooking.id }))
      );
    }

    return createdBooking;
  }

  async assignVendor(bookingId: string, vendorId: string) {
    const result = await db
      .update(bookings)
      .set({ vendorId })
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  }

  async cancelBooking(bookingId: string) {
    const result = await db
      .update(bookings)
      .set({ vendorId: null, status: "pending" })
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  }

  async updateBookingStatus(bookingId: string, status: string, paymentMode?: string) {
    const updateData: any = { status };

    if (status === "completed") updateData.completedAt = new Date();
    if (paymentMode) updateData.paymentMode = paymentMode;

    const result = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  }

  async updateBookingPaymentStatus(bookingId: string, paymentStatus: string) {
    const result = await db
      .update(bookings)
      .set({ paymentStatus })
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  }

  async deleteBooking(bookingId: string) {
    await db.delete(bookingItems).where(eq(bookingItems.bookingId, bookingId));
    await db.delete(bookings).where(eq(bookings.id, bookingId));
  }

  /* ---------------------- REVIEWS ---------------------- */

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getReviewsByVendor(vendorId: string) {
    const result = await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.vendorId, vendorId))
      .orderBy(desc(reviews.createdAt));

    return result.map((r: any) => ({
      ...r.reviews,
      customer: r.users!,
    }));
  }

  /* ---------------------- INVOICES ---------------------- */

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const result = await db.insert(invoices).values(invoice).returning();
    return result[0];
  }

  async getInvoiceByBooking(bookingId: string) {
    const result = await db.select().from(invoices).where(eq(invoices.bookingId, bookingId));
    return result[0];
  }

  /* ---------------------- SETTINGS ---------------------- */

  async getSetting(key: string) {
    const result = await db.select().from(settings).where(eq(settings.key, key));
    return result[0];
  }

  async updateSetting(key: string, value: string): Promise<Settings> {
    const result = await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return result[0];
  }

  /* ---------------------- UTILS ---------------------- */

  private async attachItemsAndVendor(list: Booking[]) {
    return Promise.all(
      list.map(async (booking) => {
        const items = await db
          .select()
          .from(bookingItems)
          .where(eq(bookingItems.bookingId, booking.id));

        let vendor = undefined;

        if (booking.vendorId) {
          const vendorResult = await db
            .select({
              name: users.name,
              phone: users.phoneNumber,
            })
            .from(vendors)
            .leftJoin(users, eq(vendors.userId, users.id))
            .where(eq(vendors.id, booking.vendorId));

          if (vendorResult.length > 0 && vendorResult[0].phone) {
            vendor = {
              name: vendorResult[0].name || vendorResult[0].phone,
              phone: vendorResult[0].phone,
            };
          }
        }

        return { ...booking, items, vendor };
      })
    );
  }

  async generateBookingReferenceId() {
    const result = await db
      .select({ referenceId: bookings.referenceId })
      .from(bookings)
      .where(like(bookings.referenceId, "EBH-MUM-%"))
      .orderBy(desc(bookings.referenceId))
      .limit(1);

    if (result.length === 0 || !result[0].referenceId) {
      return "EBH-MUM-1000";
    }

    const last = parseInt(result[0].referenceId.split("-")[2]);
    return `EBH-MUM-${(last + 1).toString().padStart(4, "0")}`;
  }
}

export const storage = new DbStorage();
