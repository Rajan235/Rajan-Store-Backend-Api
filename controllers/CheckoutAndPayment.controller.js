import { createCheckoutSession, getCheckoutSession } from "../util/stripe.js"; // Import utility functions
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";
import Order from "../models/order.model.js";

const initiateCheckout = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const cart = await user.getCart();

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const cartItems = await cart.getItems();

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let totalAmount = cartItems.reduce((sum, item) => {
    if (!item.Product || item.Product.price == null) {
      throw new ApiError(
        404,
        `Product not found for CartItem with ID ${item.id}`
      );
    }
    return sum + item.quantity * item.Product.price;
  }, 0);

  const taxAmount = totalAmount * 0.18; // Example 18% tax
  const shippingFee = 10.0; // Flat shipping fee (example)
  const finalAmount = totalAmount + taxAmount + shippingFee;

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "usd", // Adjust the currency as needed
      product_data: {
        name: item.Product.name,
        description: item.Product.description || "",
      },
      unit_amount: item.Product.price * 100, // Stripe expects amounts in cents
    },
    quantity: item.quantity,
  }));

  // Create a checkout session using the utility function
  const session = await createCheckoutSession(
    lineItems,
    `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    `${process.env.FRONTEND_URL}/checkout/cancel`,
    { userId: user.id, orderId: cart.id }
  );

  return res.status(200).json(
    new ApiResponse(200, {
      totalAmount: finalAmount,
      items: cartItems.map((item) => ({
        productId: item.Product.id,
        productName: item.Product.name,
        quantity: item.quantity,
        pricePerItem: item.Product.price,
        totalItemCost: item.quantity * item.Product.price,
      })),
      tax: taxAmount,
      shipping: shippingFee,
      checkoutUrl: session.url, // Include the checkout URL for redirection
      message: "Checkout initiated. Proceed to payment.",
    })
  );
});

const getPaymentStatus = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params; // Get sessionId from the request parameters

  // Retrieve the checkout session from Stripe
  const session = await getCheckoutSession(sessionId);

  if (!session) {
    throw new ApiError(404, "Payment session not found");
  }

  // Prepare response with relevant payment status
  const paymentStatus = {
    id: session.id,
    payment_status: session.payment_status, // Possible values: 'paid', 'unpaid', etc.
    amount_total: session.amount_total / 100, // Convert from cents to dollars
    currency: session.currency,
    created: new Date(session.created * 1000).toISOString(), // Convert UNIX timestamp to ISO format
    customer_email: session.customer_email, // Optional: if you collect email
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paymentStatus,
        "Payment status retrieved successfully."
      )
    );
});

const processPayment = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.body; // Get session ID from the request body

  // Retrieve the checkout session from Stripe
  const session = await getCheckoutSession(sessionId);

  // Check if the payment was successful
  if (session.payment_status === "paid") {
    // Create an order in your database
    const order = await Order.create({
      userId: session.metadata.userId, // User ID stored in metadata
      total: session.amount_total / 100, // Convert from cents to dollars
      status: "completed", // Set the order status to completed
      stripeSessionId: sessionId, // Store the Stripe session ID for reference
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderId: order.id },
          "Payment processed successfully."
        )
      );
  } else {
    // Handle different payment statuses accordingly
    if (session.payment_status === "unpaid") {
      throw new ApiError(400, "Payment has not been completed yet.");
    } else {
      throw new ApiError(400, "Payment was not successful.");
    }
  }
});

export { initiateCheckout, getPaymentStatus, processPayment };
