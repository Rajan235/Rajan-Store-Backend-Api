import CartItem from "../models/cart-item.model.js";

import Product from "../models/product.model.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";

//get cart
const getCart = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const cart = await user.getCart();

  if (!cart) {
    throw new ApiError(404, "cart not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

// add to cart

const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const user = req.user;
  console.log(user);
  const product = await Product.findByPk(productId);
  console.log(product);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let cart = await user.getCart();
  console.log(cart);
  if (!cart) {
    cart = await user.createCart();
  }
  console.log(cart);
  let cartItem = await CartItem.findOne({
    where: { cartId: cart.id, productId },
  });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      cartId: cart.id,
      productId,
      quantity,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, cartItem, "Product added to cart"));
});
// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cartItem = await CartItem.findByPk(itemId);
  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }
  cartItem.quantity += quantity;
  if (cartItem.quantity <= 0) {
    await cartItem.destroy(); // Automatically delete the cart item
    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Cart item removed as quantity reached zero")
      );
  }

  // Otherwise, save the updated cart item
  await cartItem.save();
  return res
    .status(200)
    .json(new ApiResponse(200, cartItem, "Cart item updated successfully"));
});

// remove item from cart
const removeCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params; // cartItemId is passed in the route parameters
  const user = req.user; // Assuming req.user contains the authenticated user's instance

  // Find the cart item by the given cartItemId
  const cartItem = await CartItem.findByPk(itemId);

  // Check if the cart item exists
  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  // Ensure the cart item belongs to the user's cart
  const userCart = await user.getCart();
  if (cartItem.cartId !== userCart.id) {
    throw new ApiError(403, "Unauthorized access to cart item");
  }

  // Remove the cart item
  await cartItem.destroy();

  // Send success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Cart item removed successfully"));
});

// Clear entire cart
const clearCart = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const cart = await user.getCart();

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // Remove all items from the cart
  await CartItem.destroy({ where: { cartId: cart.id } });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Cart cleared successfully"));
});

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
