import { db } from "./db";
import { 
  users, 
  categories, 
  vendors, 
  bookings, 
  bookingItems,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Vendor,
  type InsertVendor,
  type Booking,
  type InsertBooking,
  type BookingItem,
  type InsertBookingItem
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
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
  getAllBookings(): Promise<(Booking & { items: BookingItem[] })[]>;
  getBookingsByCustomer(customerId: string): Promise<(Booking & { items: BookingItem[] })[]>;
  getBookingsByVendor(vendorId: string): Promise<(Booking & { items: BookingItem[] })[]>;
  getBooking(id: string): Promise<(Booking & { items: BookingItem[] }) | undefined>;
  createBooking(booking: InsertBooking, items: InsertBookingItem[]): Promise<Booking>;
  assignVendor(bookingId: string, vendorId: string): Promise<Booking | undefined>;
  updateBookingStatus(bookingId: string, status: string): Promise<Booking | undefined>;
  deleteBooking(bookingId: string): Promise<void>;
  cancelBooking(bookingId: string): Promise<Booking | undefined>;
  updateBooking(bookingId: string, booking: Partial<InsertBooking>, items?: InsertBookingItem[]): Promise<Booking | undefined>;
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

  async getVendor(id: string): Promise<(Vendor & { user: User }) | undefined> {
    const result = await db.select()
      .from(vendors)
      .leftJoin(users, eq(vendors.userId, users.id))
      .where(eq(vendors.id, id));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].vendors,
      user: result[0].users!
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

  // Booking methods
  async getAllBookings(): Promise<(Booking & { items: BookingItem[] })[]> {
    const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    
    const bookingsWithItems = await Promise.all(
      allBookings.map(async (booking: Booking) => {
        const items = await db.select().from(bookingItems).where(eq(bookingItems.bookingId, booking.id));
        return { ...booking, items };
      })
    );
    
    return bookingsWithItems;
  }

  async getBookingsByCustomer(customerId: string): Promise<(Booking & { items: BookingItem[] })[]> {
    const customerBookings = await db.select()
      .from(bookings)
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.createdAt));
    
    const bookingsWithItems = await Promise.all(
      customerBookings.map(async (booking: Booking) => {
        const items = await db.select().from(bookingItems).where(eq(bookingItems.bookingId, booking.id));
        return { ...booking, items };
      })
    );
    
    return bookingsWithItems;
  }

  async getBookingsByVendor(vendorId: string): Promise<(Booking & { items: BookingItem[] })[]> {
    const vendorBookings = await db.select()
      .from(bookings)
      .where(eq(bookings.vendorId, vendorId))
      .orderBy(desc(bookings.createdAt));
    
    const bookingsWithItems = await Promise.all(
      vendorBookings.map(async (booking: Booking) => {
        const items = await db.select().from(bookingItems).where(eq(bookingItems.bookingId, booking.id));
        return { ...booking, items };
      })
    );
    
    return bookingsWithItems;
  }

  async getBooking(id: string): Promise<(Booking & { items: BookingItem[] }) | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    if (result.length === 0) return undefined;
    
    const items = await db.select().from(bookingItems).where(eq(bookingItems.bookingId, id));
    return { ...result[0], items };
  }

  async createBooking(booking: InsertBooking, items: InsertBookingItem[]): Promise<Booking> {
    const result = await db.insert(bookings).values(booking).returning();
    const createdBooking = result[0];
    
    if (items.length > 0) {
      await db.insert(bookingItems).values(
        items.map(item => ({ ...item, bookingId: createdBooking.id }))
      );
    }
    
    return createdBooking;
  }

  async assignVendor(bookingId: string, vendorId: string): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ vendorId, status: "assigned" })
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  }

  async cancelBooking(bookingId: string): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ vendorId: null, status: "pending" })
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking | undefined> {
    const updateData: any = { status };
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    
    const result = await db.update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  }

  async deleteBooking(bookingId: string): Promise<void> {
    await db.delete(bookingItems).where(eq(bookingItems.bookingId, bookingId));
    await db.delete(bookings).where(eq(bookings.id, bookingId));
  }

  async updateBooking(bookingId: string, booking: Partial<InsertBooking>, items?: InsertBookingItem[]): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set(booking)
      .where(eq(bookings.id, bookingId))
      .returning();
    
    if (items && items.length > 0) {
      await db.delete(bookingItems).where(eq(bookingItems.bookingId, bookingId));
      await db.insert(bookingItems).values(
        items.map(item => ({ ...item, bookingId }))
      );
    }
    
    return result[0];
  }
}

export const storage = new DbStorage();
