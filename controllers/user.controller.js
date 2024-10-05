// for simple user not admin
// get user profile

import User from "../models/user.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { ApiError } from "../util/ApiError.js";

const getUserProfile = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// update user profile

const updateUserProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  // Check for required fields
  if (!name || !email) {
    throw new ApiError(400, "All fields are required");
  }

  // Find user by primary key (assuming req.user.id is set correctly)
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user fields
  await user.update({ name, email }); // Directly pass the fields to update

  // Remove sensitive data from response
  const { password, refreshToken, ...userData } = user.dataValues;

  // Send response
  return res
    .status(200)
    .json(
      new ApiResponse(200, userData, "Account details updated successfully")
    );
});

//delete user by user
const deleteUserAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user.id; // Get the user ID from the JWT

  // Find the user in the database
  const user = await User.findByPk(userId);

  // Check if the user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Optionally, you can perform a soft delete instead of a hard delete
  await user.destroy(); // This will delete the user permanently

  res
    .status(200)
    .json(new ApiResponse(200, null, "User account deleted successfully"));
});

export { getUserProfile, updateUserProfile, deleteUserAccount };
