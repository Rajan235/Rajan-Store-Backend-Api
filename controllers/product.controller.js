import Product from "../models/product.model.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";

//getting all products

const getProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.findAll();
  return res.status(200).json(new ApiResponse(200, products, ""));
});

// getting specific product

const getProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new ApiError(404, "Product not found"));
  }
  return res.status(200).json(new ApiResponse(200, product, ""));
});

export { getProducts, getProduct };
