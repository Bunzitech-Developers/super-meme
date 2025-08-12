import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import subscriptionService from "../services/subscription.service.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  await subscriptionService.handleStripeWebhook(event);
  
  res.json({ received: true });
});

export default router;