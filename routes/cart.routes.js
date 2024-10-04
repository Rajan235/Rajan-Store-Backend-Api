import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.route("/cart").get(verifyJWT, getCart);
router.route("/cart/items").post(verifyJWT, addToCart);
router.route("/cart/items/:itemId").put(verifyJWT, updateCartItem);
router.route("/cart/items/:itemId").delete(verifyJWT, removeCartItem);
router.route("/cart").delete(verifyJWT, clearCart);

export default router;
