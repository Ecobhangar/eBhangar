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
  type InsertSettings
} from "@shared/schema";

import { eq, and, desc, avg, sql as drizzleSql, like } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // Category management
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Vendor management
  getAllVendors(): Promise<(Vendor & { user: User })[]>;
  getVendor(id: string): Promise<(Vendor & { user: User }) | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;

  // Booking management
  getAllBookings(): Promise<(Booking & { items: BookingItem[], vendor?: { name: string, phone: string } })[]>;
  getBookingsByCustomer(customerId: string): Promise<(Booking & { items: BookingItem[] })[]>;
  getBookingsByVendor(vendorId: string): Promise<(Booking & { items: BookingItem[] })[]>;
  getBooking(id: string): Promise<(Booking & { items: BookingItem[] }) | undefined>;
  createBooking(booking: InsertBooking, items: InsertBookingItem[]): Promise<Booking>;
  assignVendor(bookingId: string, vendorId: string): Promise<Booking | undefined>;
  updateBookingStatus(bookingId: string, status: string, paymentMode?: string): Promise<Booking | undefined>;
  updateBookingPaymentStatus(bookingId: string, paymentStatus: string): Promise<Booking | undefined>;
  deleteBooking(bookingId: string): Promise<void>;
  cancelBooking(bookingId: string): Promise<Booking | undefined>;
  updateBooking(bookingId: string, booking: Partial<InsertBooking>, items?: InsertBookingItem[]): Promise<Booking | undefined>;

  // Review management
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByVendor(vendorId: string): Promise<(Review & { customer: User })[]>;
  getReviewByBooking(bookingId: string): Promise<Review | undefined>;
  getVendorAverageRating(vendorId: string): Promise<number>;

  // Invoice management
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoiceByBooking(bookingId: string): Promise<Invoice | undefined>;

  // Settings management
  getSetting(key: string): Promise<Settings | undefined>;
  updateSetting(key: string, value: string): Promise<Settings>;

  // Reference ID generation
  generateBookingReferenceId(): Promise<string>;

  // Booking rejection
  rejectBooking(bookingId: string, reason: string): Promise<Booking | undefined>;
}

export class DbStorage implements IStorage {
  // User methods
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
    const result = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Category methods
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

  // Vendor methods
  async getAllVendors(): Promise<(Vendor & { user: User })[]> {
    const result = await db.select()
      .from(vendors)
      .leftJoin(users, eq(vendors.userId, users.id));
    
    return result.map((row: any) => ({
      ...row.vendors,
      user: row.users!
    }));
  }

  // ---- (rest of file continues EXACTLY as your provided version) ----

} // end class

export const storage = new DbStorage();
