import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { checkAdmin } from "../middleware/checkAdmin.middleware.js";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/user.admin.controller.js";
const router = Router();

//get user
router.route("/users").get(verifyJWT, checkAdmin, getAllUsers);
router.route("/users/:userId").get(verifyJWT, checkAdmin, getUserById);

//delete a user
router.route("/users/:userId").delete(verifyJWT, checkAdmin, deleteUser);

// Product Management (Admin Only)
router.route("/products").post(verifyJWT, checkAdmin, createProduct);
router.route("/products/:productId").put(verifyJWT, checkAdmin, updateProduct);
router
  .route("/products/:productId")
  .delete(verifyJWT, checkAdmin, deleteProduct);

// Order Management (Admin Only)
router.route("/orders").get(verifyJWT, checkAdmin, getAllOrders);
router
  .route("/orders/:orderId/status")
  .put(verifyJWT, checkAdmin, updateOrderStatus);
router.route("/orders/:orderId").delete(verifyJWT, checkAdmin, cancelOrder);

export default router;
