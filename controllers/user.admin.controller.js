import User from "../models/user.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.findAll(); // Fetch all users

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId; // Get user ID from the request parameters
  const user = await User.findByPk(userId); // Find user by ID

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { password, refreshToken, ...userData } = user.dataValues; // Remove sensitive data
  return res
    .status(200)
    .json(new ApiResponse(200, userData, "User fetched successfully"));
});

// Delete user by ID
const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId; // Get user ID from the request parameters
  const user = await User.findByPk(userId); // Find user by ID

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.destroy(); // Delete the user permanently
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});

// Create a new product
const createProduct = asyncHandler(async (req, res, next) => {
  const { title, price, description, imageUrl } = req.body; // Adjust as per your product model
  const userId = req.user.id;

  if (!title || !price || !description || !imageUrl) {
    throw new ApiError(400, "All fields are required");
  }

  const newProduct = await Product.create({
    title,
    price,
    description,
    imageUrl,
    userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newProduct, "Product created successfully"));
});

// Update a product by ID
const updateProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId; // Get product ID from request parameters
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const { title, price, description, imageUrl } = req.body; // Update fields

  await product.update({ title, price, description, imageUrl });
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

// Delete a product by ID
const deleteProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId; // Get product ID from request parameters
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await product.destroy(); // Delete the product
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

// Get all orders
const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.findAll(); // Fetch all orders

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Update order status by ID
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const orderId = req.params.orderId; // Get order ID from request parameters
  const { status } = req.body; // Get new status from request body

  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  await order.update({ status });
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// Cancel an order by ID
const cancelOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.orderId; // Get order ID from request parameters
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  await order.destroy(); // Delete the order or update the status to canceled
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Order canceled successfully"));
});

export {
  getAllUsers,
  getUserById,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
