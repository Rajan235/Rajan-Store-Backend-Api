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
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  // in this user remove password field for better secuirity
  const user = await User.findByPk({ where: { id: req.user.id } });

  user.update({ data: { name: fullName, email: email } });
  const { password, refreshToken, ...userData } = user.dataValues;

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
