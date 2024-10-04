// stripeUtils.js
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new Checkout session
const createCheckoutSession = async (
  lineItems,
  successUrl,
  cancelUrl,
  metadata
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment", // Or 'subscription'
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata, // Optional: You can include additional metadata if needed
    });
    return session;
  } catch (error) {
    throw new Error(`Error creating checkout session: ${error.message}`);
  }
};

// Retrieve a checkout session
const getCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    throw new Error(`Error retrieving checkout session: ${error.message}`);
  }
};

// Export utility functions
export { createCheckoutSession, getCheckoutSession };
