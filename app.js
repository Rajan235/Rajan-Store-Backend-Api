import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import path from "path"; // Using path for directory handling
import express from "express";
import bodyParser from "body-parser";
import flash from "connect-flash"; // Optional, for flash messages
import cors from "cors"; // CORS middleware
import cookieParser from "cookie-parser";
import sequelize from "./util/database.js"; // Adjust path as needed
import initializeAssociations from "./util/initializeAssociations.js"; // Adjust path as needed
import createAdminUser from "./util/createAdmin.js";

import { verifyJWT } from "./middleware/auth.middleware.js"; // JWT verification middleware

// Import routes
import authRouter from "./routes/auth.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import productRouter from "./routes/product.routes.js";
import userRouter from "./routes/user.routes.js";
import userAdminRouter from "./routes/user.admin.routes.js";
import checkoutAndPaymentRouter from "./routes/checkoutAndPayment.routes.js";

// Initialize express app
const app = express();

// Middleware setup
// {
//   origin: process.env.CORS_ORIGIN,
//   credentials: true,
// }
app.use(
  cors({
    origin: "http://localhost:3000", // Explicitly allow the frontend URL
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // This allows cookies and credentials to be sent
    allowedHeaders: "Content-Type, Authorization", // Specify allowed headers
  })
);

// middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
//app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(cookieParser());
app.use(flash()); // Flash messages middleware

// Initialize model associations (foreign keys, relationships, etc.)
initializeAssociations(sequelize);

// API versioning and route setup
app.use("/api/v1/auth", authRouter); // Public routes for authentication
app.use("/api/v1/products", productRouter); // Public product-related routes
app.use("/api/v1/cart", cartRouter); // Cart routes for logged-in users
app.use("/api/v1/orders", orderRouter); // Order-related routes
app.use("/api/v1/users", userRouter); // User-related actions (profile, etc.)
app.use("/api/v1/admin", userAdminRouter);
app.use("/api/v1/checkout", checkoutAndPaymentRouter); // Checkout and payment routes

// // Error handling routes
// app.use((req, res, next) => {
//   res.status(404).json({ message: "Page Not Found" });
// });

// // Centralized error handling middleware
// app.use((error, req, res, next) => {
//   console.error("Error:", error);
//   res.status(500).json({
//     message: error.message || "Something went wrong",
//   });
// });

// Sync database and export the app instance
sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

export { app };
