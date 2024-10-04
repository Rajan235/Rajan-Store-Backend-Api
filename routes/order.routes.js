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

router.route("/orders").get(verifyJWT, getUserOrders);
router.route("/orders/:orderId").get(verifyJWT, getOrder);
router.route("/orders").post(verifyJWT, createOrder);
router.route("/orders/:orderId").delete(verifyJWT, cancelOrder);
//     GET /order-items/:orderId - Retrieve items from a specific order.

// get invoice
router.route("/orders/:orderId/invoice").get(verifyJWT, getInvoice);

export default router;
