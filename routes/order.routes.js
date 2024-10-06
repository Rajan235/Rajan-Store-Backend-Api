import { Router } from "express";
import {
  getInvoice,
  getOrder,
  getUserOrders,
  cancelOrder,
  createOrder,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/").get(verifyJWT, getUserOrders);
router.route("/:orderId").get(verifyJWT, getOrder);
router.route("/").post(verifyJWT, createOrder);
router.route("/:orderId").delete(verifyJWT, cancelOrder);
//     GET /order-items/:orderId - Retrieve items from a specific order.

// get invoice
router.route("/:orderId/invoice").get(verifyJWT, getInvoice);

export default router;
