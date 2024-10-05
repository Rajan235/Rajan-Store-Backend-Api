import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

// Public routes
router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword); // No auth needed
router.route("/reset-password/:token").post(resetPassword); // No auth needed

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser); // Requires authentication
router.route("/refresh-token").post(verifyJWT, refreshAccessToken); // Requires authentication

export default router;
