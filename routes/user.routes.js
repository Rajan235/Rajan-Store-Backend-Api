import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "../controllers/user.controller.js";
//get user
router.get("/me", verifyJWT, getUserProfile);
//post user update
// Protected Routes
router.patch("/me", verifyJWT, updateUserProfile);

//delete a user
router.delete("/me", verifyJWT, deleteUserAccount);

export default router;
