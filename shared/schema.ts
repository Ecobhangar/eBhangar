import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---------------- USERS ----------------
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

// ---------------- CATEGORIES ----------------
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull(), // unit, kg
  minRate: decimal("minRate", { precision: 10, scale: 2 }).notNull(),
  maxRate: decimal("maxRate", { precision: 10, scale: 2 }).notNull(),
  icon: text("icon").notNull(), // icon name for frontend
});

// ---------------- VENDORS ----------------
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

// ---------------- BOOKINGS ----------------
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
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, paid
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, on_the_way, completed
  rejectionReason: text("rejection_reason"),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// ---------------- BOOKING ITEMS ----------------
export const bookingItems = pgTable("booking_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  categoryName: text("category_name").notNull(),
  quantity: integer("quantity").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
});

// ---------------- REVIEWS ----------------
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull().unique(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---------------- INVOICES ----------------
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
  platformFee: decimal("platform_fee", { pr_
