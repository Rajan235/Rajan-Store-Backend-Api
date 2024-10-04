import OrderItem from "../models/order-item.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";

import PDFDocument from "pdfkit";

//getting all user orders orders

const getUserOrders = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const orders = await Order.findAll({
    where: { userId: user.id },
    include: [
      {
        model: OrderItem,
        include: [
          {
            model: Product,
          },
        ],
      },
    ],
  });

  if (!orders || orders.length === 0) {
    throw new ApiError(404, "Orders not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

//getting specific order

const getOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        include: [
          {
            model: Product,
          },
        ],
      },
    ],
  });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Orders retrieved successfully"));
});

// creating an order

const createOrder = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const fetchedCart = await user.getCart();
  if (!fetchedCart) {
    throw new ApiError(404, "Cart not found");
  }

  const cartItems = await fetchedCart.getItems();
  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(400, "No items in the cart");
  }
  let orderTotal = cartItems.reduce((sum, item) => {
    if (!item.Product || item.Product.price == null) {
      throw new ApiError(`Product not found for CartItem with ID ${item.id}`);
    }
    return sum + item.quantity * item.Product.price;
  }, 0);

  // order item update from cart item
  const newOrder = await Order.create({ userId: user.id, total: orderTotal });
  const orderItems = cartItems.map((item) => ({
    orderId: newOrder.id,
    productId: item.Product.id,
    quantity: item.quantity,
    price: item.Product.price,
  }));
  await OrderItem.bulkCreate(orderItems);

  // then destroy cart
  await fetchedCart.setItems([]);

  return res
    .status(201)
    .json(new ApiResponse(201, newOrder, "Order created successfully"));
});

const cancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  // Find the order by its primary key (orderId)
  const order = await Order.findByPk(orderId);

  // If order is not found, return a 404 error
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Destroy (delete) the order from the database
  await order.destroy();

  // Return a success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Order cancelled successfully"));
});

const getInvoice = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params; // Get orderId from the request parameters

  // Fetch the order details from the database
  const order = await Order.findOne({
    where: { id: orderId },
    include: [{ model: User, attributes: ["name", "email"] }, "Products"], // Adjust based on your models
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);

  const pdfDoc = new PDFDocument();

  // Set the headers for PDF download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${invoiceName}"`); // Force download

  // Pipe the PDF to the response
  pdfDoc.pipe(fs.createWriteStream(invoicePath)); // Optional: save to the file system
  pdfDoc.pipe(res); // Pipe PDF directly to the response

  // PDF content generation
  pdfDoc.fontSize(26).text("Invoice", { underline: true });
  pdfDoc.text("----------------------------------------------------");
  pdfDoc.fontSize(14).text(`Order ID: ${orderId}`);
  pdfDoc.text(`Date: ${new Date().toLocaleDateString()}`);
  pdfDoc.text(`Customer: ${order.User.name} (${order.User.email})`);
  pdfDoc.text("----------------------------------------------------");

  let totalPrice = 0;

  order.Products.forEach((prod) => {
    const itemTotal = prod.OrderItem.quantity * prod.price;
    totalPrice += itemTotal;
    pdfDoc
      .fontSize(14)
      .text(
        `${prod.title} - ${prod.OrderItem.quantity} x $${prod.price.toFixed(2)} = $${itemTotal.toFixed(2)}`
      );
  });

  pdfDoc.text("----------------------------------------------------");
  pdfDoc.fontSize(20).text(`Total Price: $${totalPrice.toFixed(2)}`);
  pdfDoc.text("----------------------------------------------------");
  pdfDoc.fontSize(14).text("Thank you for your purchase!");

  // Finalize the PDF and end the stream
  pdfDoc.end();

  // Handle errors in PDF stream
  pdfDoc.on("error", (err) => {
    return next(new ApiError(500, "Error generating invoice: " + err.message));
  });

  // Optionally, you can handle the finish event
  pdfDoc.on("finish", () => {
    console.log(`Invoice ${invoiceName} generated successfully.`);
  });
});

export { getUserOrders, getOrder, createOrder, cancelOrder, getInvoice };
