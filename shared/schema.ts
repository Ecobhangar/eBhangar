import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name"),
  address: text("address"),
  pinCode: text("pin_code"),
  district: text("district"),
  state: text("state"),
  role: text("role").notNull().default("customer"), // customer, admin, vendor
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull(), // unit, kg
  minRate: decimal("min_rate", { precision: 10, scale: 2 }).notNull(),
  maxRate: decimal("max_rate", { precision: 10, scale: 2 }).notNull(),
  icon: text("icon").notNull(), // icon name for frontend
});

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  location: text("location").notNull(),
  pinCode: text("pin_code"),
  district: text("district").notNull(),
  state: text("state").notNull(),
  aadharNumber: text("aadhar_number"),
  panNumber: text("pan_number"),
  active: boolean("active").notNull().default(true),
  activePickups: integer("active_pickups").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referenceId: text("reference_id").unique(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  pinCode: text("pin_code"),
  district: text("district"),
  state: text("state"),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  paymentMode: text("payment_mode"), // cash, upi
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, on_the_way, completed
  rejectionReason: text("rejection_reason"),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  vendorLatitude: decimal("vendor_latitude", { precision: 10, scale: 7 }),
  vendorLongitude: decimal("vendor_longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const bookingItems = pgTable("booking_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  categoryName: text("category_name").notNull(),
  quantity: integer("quantity").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull().unique(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull().unique(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  vendorName: text("vendor_name").notNull(),
  vendorPhone: text("vendor_phone").notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMode: text("payment_mode").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  activePickups: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  status: true,
  referenceId: true,
});

export const insertBookingItemSchema = createInsertSchema(bookingItems).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1).max(500).optional(),
  });

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type BookingItem = typeof bookingItems.$inferSelect;
export type InsertBookingItem = z.infer<typeof insertBookingItemSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
