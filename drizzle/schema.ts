import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stripe integration fields for users
 */
export const usersStripe = mysqlTable("users_stripe", {
  userId: int("userId").primaryKey().references(() => users.id),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPlan: mysqlEnum("currentPlan", ["scout", "pro", "yard_command", "none"]).default("none"),
  foundingPartner: int("foundingPartner").default(0), // 1 = true, 0 = false
  priceLockedAt: timestamp("priceLockedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type UsersStripe = typeof usersStripe.$inferSelect;
export type InsertUsersStripe = typeof usersStripe.$inferInsert;

/**
 * Scrap metal types and categories
 */
export const metals = mysqlTable("metals", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }),
  description: text("description"),
  unit: varchar("unit", { length: 20 }).default("lb"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Metal = typeof metals.$inferSelect;
export type InsertMetal = typeof metals.$inferInsert;

/**
 * Live market prices for each metal
 */
export const marketPrices = mysqlTable("market_prices", {
  id: int("id").autoincrement().primaryKey(),
  metalId: int("metalId").notNull().references(() => metals.id),
  priceUsd: decimal("priceUsd", { precision: 10, scale: 4 }),
  source: varchar("source", { length: 100 }),
  fetchedAt: timestamp("fetchedAt").defaultNow(),
}, (table) => ({
  metalIdIdx: index("metalId_idx").on(table.metalId),
}));

export type MarketPrice = typeof marketPrices.$inferSelect;
export type InsertMarketPrice = typeof marketPrices.$inferInsert;

/**
 * Price history for trend analysis
 */
export const priceHistory = mysqlTable("price_history", {
  id: int("id").autoincrement().primaryKey(),
  metalId: int("metalId").notNull().references(() => metals.id),
  priceUsd: decimal("priceUsd", { precision: 10, scale: 4 }),
  recordedAt: timestamp("recordedAt").defaultNow(),
}, (table) => ({
  metalIdIdx: index("metalId_idx").on(table.metalId),
}));

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * User scrap yards
 */
export const yards = mysqlTable("yards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 200 }),
  location: varchar("location", { length: 300 }),
  contactName: varchar("contactName", { length: 100 }),
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type Yard = typeof yards.$inferSelect;
export type InsertYard = typeof yards.$inferInsert;

/**
 * Custom pricing per yard per metal
 */
export const yardPrices = mysqlTable("yard_prices", {
  id: int("id").autoincrement().primaryKey(),
  yardId: int("yardId").notNull().references(() => yards.id),
  metalId: int("metalId").notNull().references(() => metals.id),
  priceUsd: decimal("priceUsd", { precision: 10, scale: 4 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  yardIdIdx: index("yardId_idx").on(table.yardId),
  metalIdIdx: index("metalId_idx").on(table.metalId),
}));

export type YardPrice = typeof yardPrices.$inferSelect;
export type InsertYardPrice = typeof yardPrices.$inferInsert;


/**
 * Uploaded price sheets from users
 */
export const priceSheets = mysqlTable("price_sheets", {
  id: int("id").autoincrement().primaryKey(),
  yardId: int("yardId").notNull().references(() => yards.id),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"),
  uploadedAt: timestamp("uploadedAt").defaultNow(),
  parsedMetals: int("parsedMetals"),
  status: mysqlEnum("status", ["pending", "parsed", "error"]).default("pending"),
  errorMessage: text("errorMessage"),
}, (table) => ({
  yardIdIdx: index("yardId_idx").on(table.yardId),
}));

export type PriceSheet = typeof priceSheets.$inferSelect;
export type InsertPriceSheet = typeof priceSheets.$inferInsert;

/**
 * Individual prices from uploaded sheets
 */
export const sheetPrices = mysqlTable("sheet_prices", {
  id: int("id").autoincrement().primaryKey(),
  sheetId: int("sheetId").notNull().references(() => priceSheets.id),
  metalId: int("metalId").notNull().references(() => metals.id),
  priceUsd: decimal("priceUsd", { precision: 10, scale: 4 }),
  metalName: varchar("metalName", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  sheetIdIdx: index("sheetId_idx").on(table.sheetId),
  metalIdIdx: index("metalId_idx").on(table.metalId),
}));

export type SheetPrice = typeof sheetPrices.$inferSelect;
export type InsertSheetPrice = typeof sheetPrices.$inferInsert;
