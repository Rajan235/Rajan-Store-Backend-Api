import { Router } from "express";

import { getProducts, getProduct } from "../controllers/product.controller.js"; // Assuming you have controllers set up

const router = Router();

// Public routes -
router.route("/").get(getProducts);
router.route("/:productId").get(getProduct);

export default router;
