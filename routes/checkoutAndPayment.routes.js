import { Router } from "express";
import {
  getPaymentStatus,
  initiateCheckout,
  processPayment,
} from "../controllers/CheckoutandPayment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/payment/status").get(verifyJWT, getPaymentStatus); // user admin
router.route("/checkout/initiate").post(verifyJWT, initiateCheckout);
router.route("/payment/process").post(verifyJWT, processPayment);

export default router;
