import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllMetals,
  getLatestMarketPrices,
  getLatestMetalPrice,
  getPriceHistory,
  getUserYards,
  getYardById,
  createYard,
  getYardPrices,
  getYardPrice,
  upsertYardPrice,
  calculateYardLeakage,
  getOrCreateUserStripe,
  updateUserStripeCustomer,
  updateUserSubscription,
  createPriceSheet,
  getYardPriceSheets,
  getLatestPriceSheet,
  insertSheetPrices,
  getSheetPrices,
  compareSheetWithMarket,
  updatePriceSheetStatus,
} from "./db";
import Stripe from "stripe";
type StripeClient = InstanceType<typeof Stripe>;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /**
   * METALS - Get all metals and their information
   */
  metals: router({
    list: publicProcedure.query(async () => {
      return getAllMetals();
    }),

    prices: publicProcedure.query(async () => {
      return getLatestMarketPrices();
    }),

    priceForMetal: publicProcedure
      .input(z.object({ metalId: z.number() }))
      .query(async ({ input }) => {
        return getLatestMetalPrice(input.metalId);
      }),

    history: publicProcedure
      .input(z.object({ metalId: z.number(), days: z.number().optional() }))
      .query(async ({ input }) => {
        return getPriceHistory(input.metalId, input.days);
      }),
  }),

  /**
   * YARDS - Manage user scrap yards
   */
  yards: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserYards(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ yardId: z.number() }))
      .query(async ({ input, ctx }) => {
        const yard = await getYardById(input.yardId);
        if (!yard || yard.userId !== ctx.user.id) {
          throw new Error("Yard not found or unauthorized");
        }
        return yard;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          location: z.string().optional(),
          contactName: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createYard(ctx.user.id, input);
      }),
  }),

  /**
   * PRICING - Get and update yard pricing
   */
  pricing: router({
    getYardPrices: protectedProcedure
      .input(z.object({ yardId: z.number() }))
      .query(async ({ input, ctx }) => {
        const yard = await getYardById(input.yardId);
        if (!yard || yard.userId !== ctx.user.id) {
          throw new Error("Yard not found or unauthorized");
        }
        return getYardPrices(input.yardId);
      }),

    updatePrice: protectedProcedure
      .input(
        z.object({
          yardId: z.number(),
          metalId: z.number(),
          priceUsd: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const yard = await getYardById(input.yardId);
        if (!yard || yard.userId !== ctx.user.id) {
          throw new Error("Yard not found or unauthorized");
        }
        await upsertYardPrice(input.yardId, input.metalId, input.priceUsd);
        return { success: true };
      }),

    calculateLeakage: protectedProcedure
      .input(z.object({ yardId: z.number() }))
      .query(async ({ input, ctx }) => {
        const yard = await getYardById(input.yardId);
        if (!yard || yard.userId !== ctx.user.id) {
          throw new Error("Yard not found or unauthorized");
        }
        return calculateYardLeakage(input.yardId);
      }),
  }),

  /**
   * STRIPE - Payment processing and subscription management
   */
  stripe: router({
    createCheckoutSession: protectedProcedure
      .input(
        z.object({
          plan: z.enum(["scout", "pro", "yard_command"]),
          foundingPartner: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Pricing configuration
          const pricing: Record<string, { priceId: string; amount: number; name: string }> = {
            scout: {
              priceId: process.env.STRIPE_PRICE_SCOUT || "",
              amount: 19900, // $199/month in cents
              name: "Ferrum AI Scout - $199/month",
            },
            pro: {
              priceId: process.env.STRIPE_PRICE_PRO || "",
              amount: 49900, // $499/month in cents
              name: "Ferrum AI Pro - $499/month",
            },
            yard_command: {
              priceId: process.env.STRIPE_PRICE_YARD_COMMAND || "",
              amount: 149900, // $1,499/month in cents
              name: "Ferrum AI Yard Command - $1,499/month",
            },
          };

          const planConfig = pricing[input.plan];
          if (!planConfig) {
            throw new Error("Invalid plan");
          }

          // Get or create Stripe customer
          let userStripe = await getOrCreateUserStripe(ctx.user.id);
          let customerId = userStripe?.stripeCustomerId;

          if (!customerId) {
            const customer = await stripe.customers.create({
              email: ctx.user.email || undefined,
              name: ctx.user.name || undefined,
              metadata: {
                userId: ctx.user.id.toString(),
              },
            });
            customerId = customer.id;
          const origin = (ctx.req.headers.origin as string) || "https://metalsense.local";
            await updateUserStripeCustomer(ctx.user.id, customerId);
          }

          // Create checkout session
          let discountAmount = 0;
          if (input.foundingPartner) {
            discountAmount = Math.floor(planConfig.amount * 0.5); // 50% off
          }

          const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: planConfig.name,
                    description: `Ferrum AI ${input.plan} tier${input.foundingPartner ? " - Founding Partner" : ""}`,
                  },
                  unit_amount: discountAmount > 0 ? planConfig.amount - discountAmount : planConfig.amount,
                  recurring: {
                    interval: "month",
                    interval_count: 1,
                  },
                },
                quantity: 1,
              },
            ],
            mode: "subscription",
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing`,
            metadata: {
              userId: ctx.user.id.toString(),
              plan: input.plan,
              foundingPartner: input.foundingPartner ? "true" : "false",
            },
          });

          return { url: session.url };
        } catch (error) {
          console.error("Stripe checkout error:", error);
          throw new Error("Failed to create checkout session");
        }
      }),

    getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      const userStripe = await getOrCreateUserStripe(ctx.user.id);
      if (!userStripe?.stripeSubscriptionId) {
        return { status: "none", plan: "none" };
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(userStripe.stripeSubscriptionId);
        return {
          status: subscription.status,
          plan: userStripe.currentPlan,
          foundingPartner: userStripe.foundingPartner === 1,
          priceLockedAt: userStripe.priceLockedAt,
        };
      } catch (error) {
        console.error("Failed to get subscription status:", error);
        return { status: "error", plan: userStripe.currentPlan };
      }
    }),

    cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      const userStripe = await getOrCreateUserStripe(ctx.user.id);
      if (!userStripe?.stripeSubscriptionId) {
        throw new Error("No active subscription");
      }

      try {
        await stripe.subscriptions.cancel(userStripe.stripeSubscriptionId);
        await updateUserSubscription(ctx.user.id, "", "none", false);
        return { success: true };
      } catch (error) {
        console.error("Failed to cancel subscription:", error);
        throw new Error("Failed to cancel subscription");
      }
    }),
  }),

  /**
   * PRICE SHEETS - Upload and parse price sheets
   */
  priceSheets: router({
    upload: protectedProcedure
      .input(z.object({
        yardId: z.number(),
        fileName: z.string(),
        fileSize: z.number(),
        csvData: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Create price sheet record
          const sheet = await createPriceSheet(input.yardId, input.fileName, input.fileSize);
          const sheetId = (sheet as any).insertId || 0;

          // Parse CSV data
          const lines = input.csvData.trim().split('\n');
          const metals = await getAllMetals();
          const prices: Array<{ metalId: number; priceUsd: number; metalName?: string }> = [];

          // Skip header row
          for (let i = 1; i < lines.length; i++) {
            const [metalName, priceStr] = lines[i].split(',').map(s => s.trim());
            if (!metalName || !priceStr) continue;

            // Find matching metal
            const metal = metals.find(m => 
              m.name.toLowerCase().includes(metalName.toLowerCase())
            );

            if (metal && !isNaN(parseFloat(priceStr))) {
              prices.push({
                metalId: metal.id,
                priceUsd: parseFloat(priceStr),
                metalName,
              });
            }
          }

          if (prices.length === 0) {
            await updatePriceSheetStatus(sheetId, "error", "No valid prices found in CSV");
            throw new Error("No valid prices found in CSV");
          }

          // Insert prices
          await insertSheetPrices(sheetId, prices);
          await updatePriceSheetStatus(sheetId, "parsed", undefined, prices.length);

          return { success: true, sheetId, parsedMetals: prices.length };
        } catch (error) {
          console.error("Price sheet upload error:", error);
          throw new Error("Failed to upload price sheet");
        }
      }),

    list: protectedProcedure
      .input(z.object({ yardId: z.number() }))
      .query(async ({ input }) => {
        return getYardPriceSheets(input.yardId);
      }),

    compare: protectedProcedure
      .input(z.object({ sheetId: z.number() }))
      .query(async ({ input }) => {
        return compareSheetWithMarket(input.sheetId);
      }),

    latest: protectedProcedure
      .input(z.object({ yardId: z.number() }))
      .query(async ({ input }) => {
        const sheet = await getLatestPriceSheet(input.yardId);
        if (!sheet) return null;
        const comparison = await compareSheetWithMarket(sheet.id);
        return { ...sheet, comparison };
      }),
  }),
});

export type AppRouter = typeof appRouter;
