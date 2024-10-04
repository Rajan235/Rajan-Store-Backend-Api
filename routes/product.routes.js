import { Router } from "express";

import { getProducts, getProduct } from "../controllers/product.controller.js"; // Assuming you have controllers set up

const router = Router();

// Public routes -
router.route("/products").get(getProducts);
router.route("/products/:productId").get(getProduct);

export default router;
