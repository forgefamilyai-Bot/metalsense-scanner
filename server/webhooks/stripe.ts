import { Request, Response } from "express";
import Stripe from "stripe";
import { updateUserSubscription, getDb } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    ) as Stripe.Event;
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook] Invoice paid: ${invoice.id}`);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Checkout session completed: ${session.id}`);

  const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null;
  const plan = session.metadata?.plan || "unknown";
  const foundingPartner = session.metadata?.foundingPartner === "true";

  if (!userId) {
    console.error("[Webhook] No user_id in session metadata");
    return;
  }

  // Get subscription ID from session
  if (session.subscription) {
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

    // Update user subscription in database
    const now = new Date();
    const priceLockedAt = foundingPartner ? now : null;

    await updateUserSubscription(
      userId,
      subscriptionId,
      plan as 'scout' | 'pro' | 'yard_command' | 'none',
      foundingPartner
    );

    console.log(
      `[Webhook] User ${userId} subscription created: ${subscriptionId} (${plan})`
    );

    // Send welcome email (optional - implement your email service here)
    console.log(`[Webhook] Welcome email would be sent to user ${userId}`);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Subscription updated: ${subscription.id}`);

  const customerId = subscription.customer as string;
  const status = subscription.status;

  // Find user by Stripe customer ID and update subscription status
  const db = await getDb();
  if (!db) return;

  try {
    // Update subscription status in database
    // This is a simplified example - you'd want to match customer ID to user
    console.log(`[Webhook] Subscription ${subscription.id} status: ${status}`);
  } catch (error) {
    console.error("[Webhook] Error updating subscription:", error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Subscription deleted: ${subscription.id}`);

  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID and mark subscription as cancelled
  const db = await getDb();
  if (!db) return;

  try {
    console.log(`[Webhook] Subscription ${subscription.id} cancelled`);
  } catch (error) {
    console.error("[Webhook] Error cancelling subscription:", error);
  }
}
