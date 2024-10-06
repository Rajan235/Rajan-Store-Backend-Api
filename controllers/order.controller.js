import OrderItem from "../models/order-item.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";

import PDFDocument from "pdfkit";
import CartItem from "../models/cart-item.model.js";
import User from "../models/user.model.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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

  const cartItems = await CartItem.findAll({
    where: { cartId: fetchedCart.id },
    include: { model: Product },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(400, "No items in the cart");
  }

  let orderTotal = cartItems.reduce((sum, item) => {
    if (!item.Product || item.Product.price == null) {
      throw new ApiError(`Product not found for CartItem with ID ${item.id}`);
    }
    return sum + item.quantity * item.Product.price;
  }, 0);

  const newOrder = await Order.create({ userId: user.id, total: orderTotal });

  const orderItems = cartItems.map((item) => ({
    orderId: newOrder.id,
    productId: item.productId,
    quantity: item.quantity,
    price: item.Product.price,
  }));

  await OrderItem.bulkCreate(orderItems);

  // then destroy cart
  await CartItem.destroy({ where: { cartId: fetchedCart.id } });

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
  const { orderId } = req.params;

  // Fetch the order details from the database
  const order = await Order.findOne({
    where: { id: orderId },
    include: [{ model: User, attributes: ["name", "email"] }, "Products"],
  });

  console.log(order);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = join(
    __dirname,
    "..",
    "public",
    "data",
    "invoices",
    invoiceName
  );

  if (!fs.existsSync(join(__dirname, "..", "public", "data", "invoices"))) {
    fs.mkdirSync(join(__dirname, "..", "public", "data", "invoices"), {
      recursive: true,
    });
  }

  const pdfDoc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${invoiceName}"`);

  const fileStream = fs.createWriteStream(invoicePath);
  pdfDoc.pipe(fileStream);
  pdfDoc.pipe(res);

  // Add Invoice Header
  pdfDoc
    .fontSize(26)
    .text("INVOICE", { align: "center", underline: true })
    .moveDown();

  // Add Company Info
  pdfDoc
    .fontSize(14)
    .text("Your Company Name", { align: "left" })
    .text("Your Company Address", { align: "left" })
    .text("Phone: +1234567890", { align: "left" })
    .text("Email: company@email.com", { align: "left" })
    .moveDown(2);

  // Add Invoice Info
  pdfDoc
    .fontSize(18)
    .text(`Order ID: ${orderId}`, { align: "left" })
    .text(`Date: ${new Date().toLocaleDateString()}`, { align: "left" })
    .text(`Customer: ${order.User.name} (${order.User.email})`, {
      align: "left",
    })
    .moveDown();

  pdfDoc
    .text("----------------------------------------------------")
    .moveDown(1);

  let totalPrice = 0;

  // Iterate over products and ensure price is treated as a number
  order.Products.forEach((prod) => {
    const quantity = prod.OrderItem?.quantity || 0; // Ensure quantity is available
    const price = parseFloat(prod.price); // Convert price to float

    if (isNaN(price)) {
      console.error(`Invalid price for product ${prod.title}: ${prod.price}`);
      return; // Skip this product if price is invalid
    }

    const itemTotal = quantity * price;
    totalPrice += itemTotal;

    pdfDoc
      .fontSize(14)
      .text(
        `${prod.title} - ${quantity} x $${price.toFixed(2)} = $${itemTotal.toFixed(2)}`
      );
  });

  pdfDoc.text("----------------------------------------------------");
  pdfDoc.fontSize(20).text(`Total Price: $${totalPrice.toFixed(2)}`);
  pdfDoc.text("----------------------------------------------------");
  pdfDoc.fontSize(14).text("Thank you for your purchase!");

  pdfDoc.end();

  pdfDoc.on("error", (err) => {
    return next(new ApiError(500, "Error generating invoice: " + err.message));
  });

  fileStream.on("finish", () => {
    console.log(`Invoice ${invoiceName} generated and saved to server.`);
  });
});

export { getUserOrders, getOrder, createOrder, cancelOrder, getInvoice };
