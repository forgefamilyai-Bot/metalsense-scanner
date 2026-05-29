import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, metals, marketPrices, priceHistory, yards, yardPrices, usersStripe, priceSheets, sheetPrices } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * METALS - Get all available metals
 */
export async function getAllMetals() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(metals);
}

/**
 * MARKET PRICES - Get latest market prices for all metals
 */
export async function getLatestMarketPrices() {
  const db = await getDb();
  if (!db) return [];
  
  // Get all market prices and group by metal, taking the most recent
  const allPrices = await db.select()
    .from(marketPrices)
    .orderBy(desc(marketPrices.fetchedAt));
  
  const latestByMetal = new Map();
  for (const price of allPrices) {
    if (!latestByMetal.has(price.metalId)) {
      latestByMetal.set(price.metalId, price);
    }
  }
  
  return Array.from(latestByMetal.values());
}

/**
 * MARKET PRICES - Get latest price for a specific metal
 */
export async function getLatestMetalPrice(metalId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(marketPrices)
    .where(eq(marketPrices.metalId, metalId))
    .orderBy(desc(marketPrices.fetchedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * PRICE HISTORY - Get price history for a specific metal
 */
export async function getPriceHistory(metalId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(priceHistory)
    .where(eq(priceHistory.metalId, metalId))
    .orderBy(desc(priceHistory.recordedAt))
    .limit(1000);
}

/**
 * PRICE HISTORY - Insert historical price record
 */
export async function recordPriceHistory(metalId: number, priceUsd: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(priceHistory).values({ metalId, priceUsd: priceUsd.toString() as any });
}

/**
 * YARDS - Get all yards for a user
 */
export async function getUserYards(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(yards)
    .where(eq(yards.userId, userId));
}

/**
 * YARDS - Get a single yard by ID
 */
export async function getYardById(yardId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(yards)
    .where(eq(yards.id, yardId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * YARDS - Create a new yard
 */
export async function createYard(userId: number, data: {
  name: string;
  location?: string;
  contactName?: string;
  email?: string;
  phone?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(yards).values({
    userId,
    ...data,
  });
  
  return result;
}

/**
 * YARD PRICES - Get all prices for a specific yard
 */
export async function getYardPrices(yardId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(yardPrices)
    .where(eq(yardPrices.yardId, yardId));
}

/**
 * YARD PRICES - Get price for a specific yard and metal
 */
export async function getYardPrice(yardId: number, metalId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(yardPrices)
    .where(and(eq(yardPrices.yardId, yardId), eq(yardPrices.metalId, metalId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * YARD PRICES - Update or insert a price for a yard
 */
export async function upsertYardPrice(yardId: number, metalId: number, priceUsd: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select()
    .from(yardPrices)
    .where(and(eq(yardPrices.yardId, yardId), eq(yardPrices.metalId, metalId)))
    .limit(1);
  
  const priceStr = priceUsd.toString();
  
  if (existing.length > 0) {
    await db.update(yardPrices)
      .set({ priceUsd: priceStr as any })
      .where(and(eq(yardPrices.yardId, yardId), eq(yardPrices.metalId, metalId)));
  } else {
    await db.insert(yardPrices).values({ yardId, metalId, priceUsd: priceStr as any });
  }
}

/**
 * LEAKAGE CALCULATION - Calculate revenue leakage for a yard
 */
export async function calculateYardLeakage(yardId: number) {
  const db = await getDb();
  if (!db) return { totalLeakage: 0, byMetal: [] };
  
  // Get yard prices
  const yardPricesList = await getYardPrices(yardId);
  
  // Get latest market prices
  const marketPricesList = await getLatestMarketPrices();
  
  // Calculate leakage
  const leakage = [];
  let totalLeakage = 0;
  
  for (const yp of yardPricesList) {
    const mp = marketPricesList.find(p => p.metalId === yp.metalId);
    if (mp && mp.priceUsd && yp.priceUsd) {
      const diff = Number(mp.priceUsd) - Number(yp.priceUsd);
      if (diff > 0) {
        leakage.push({
          metalId: yp.metalId,
          yardPrice: Number(yp.priceUsd),
          marketPrice: Number(mp.priceUsd),
          leakagePerLb: diff,
        });
        totalLeakage += diff;
      }
    }
  }
  
  return { totalLeakage, byMetal: leakage };
}

/**
 * STRIPE - Get or create Stripe record for user
 */
export async function getOrCreateUserStripe(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select()
    .from(usersStripe)
    .where(eq(usersStripe.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new record
  await db.insert(usersStripe).values({ userId }).catch(() => {});
  
  const result = await db.select()
    .from(usersStripe)
    .where(eq(usersStripe.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * STRIPE - Update Stripe customer ID
 */
export async function updateUserStripeCustomer(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(usersStripe)
    .set({ stripeCustomerId })
    .where(eq(usersStripe.userId, userId));
}

/**
 * STRIPE - Update subscription and plan
 */
export async function updateUserSubscription(
  userId: number,
  stripeSubscriptionId: string,
  currentPlan: 'scout' | 'pro' | 'yard_command' | 'none',
  foundingPartner = false
) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(usersStripe)
    .set({
      stripeSubscriptionId,
      currentPlan,
      foundingPartner: foundingPartner ? 1 : 0,
      priceLockedAt: foundingPartner ? new Date() : undefined,
    })
    .where(eq(usersStripe.userId, userId));
}


/**
 * PRICE SHEETS - Create a new price sheet upload record
 */
export async function createPriceSheet(yardId: number, fileName: string, fileSize: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(priceSheets).values({
    yardId,
    fileName,
    fileSize,
    status: "pending",
  });
  
  return result;
}

/**
 * PRICE SHEETS - Get all price sheets for a yard
 */
export async function getYardPriceSheets(yardId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(priceSheets)
    .where(eq(priceSheets.yardId, yardId))
    .orderBy(desc(priceSheets.uploadedAt));
}

/**
 * PRICE SHEETS - Get latest price sheet for a yard
 */
export async function getLatestPriceSheet(yardId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(priceSheets)
    .where(eq(priceSheets.yardId, yardId))
    .orderBy(desc(priceSheets.uploadedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * SHEET PRICES - Insert prices from uploaded sheet
 */
export async function insertSheetPrices(sheetId: number, prices: Array<{ metalId: number; priceUsd: number; metalName?: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const values = prices.map(p => ({
    sheetId,
    metalId: p.metalId,
    priceUsd: p.priceUsd.toString(),
    metalName: p.metalName,
  }));
  
  await db.insert(sheetPrices).values(values);
}

/**
 * SHEET PRICES - Get all prices from a sheet
 */
export async function getSheetPrices(sheetId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(sheetPrices)
    .where(eq(sheetPrices.sheetId, sheetId));
}

/**
 * SHEET PRICES - Compare sheet prices with market prices
 */
export async function compareSheetWithMarket(sheetId: number) {
  const db = await getDb();
  if (!db) return { comparison: [], totalGap: 0 };
  
  const sheetPricesList = await getSheetPrices(sheetId);
  const marketPricesList = await getLatestMarketPrices();
  
  const comparison = [];
  let totalGap = 0;
  
  for (const sp of sheetPricesList) {
    const mp = marketPricesList.find(p => p.metalId === sp.metalId);
    if (mp && mp.priceUsd && sp.priceUsd) {
      const sheetPrice = Number(sp.priceUsd);
      const marketPrice = Number(mp.priceUsd);
      const gap = marketPrice - sheetPrice;
      
      comparison.push({
        metalId: sp.metalId,
        metalName: sp.metalName,
        sheetPrice,
        marketPrice,
        gap,
        gapPercent: ((gap / marketPrice) * 100).toFixed(2),
        status: gap > 0 ? "below_market" : gap < 0 ? "above_market" : "at_market",
      });
      
      totalGap += gap;
    }
  }
  
  return { comparison, totalGap };
}

/**
 * PRICE SHEETS - Update sheet status after parsing
 */
export async function updatePriceSheetStatus(sheetId: number, status: "pending" | "parsed" | "error", errorMessage?: string, parsedMetals?: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(priceSheets)
    .set({
      status,
      errorMessage,
      parsedMetals,
    })
    .where(eq(priceSheets.id, sheetId));
}
