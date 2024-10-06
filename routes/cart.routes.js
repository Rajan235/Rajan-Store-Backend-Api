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

router.route("/").get(verifyJWT, getCart);
router.route("/items").post(verifyJWT, addToCart);
router.route("/items/:itemId").put(verifyJWT, updateCartItem);
router.route("/items/:itemId").delete(verifyJWT, removeCartItem);
router.route("/").delete(verifyJWT, clearCart);

export default router;
