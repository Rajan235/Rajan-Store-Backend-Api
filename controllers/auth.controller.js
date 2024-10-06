import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",

  port: 587,

  auth: {
    user: process.env.MAILTRAP_USER, // Add these to your .env file
    pass: process.env.MAILTRAP_PASS,
  },
});
//generated access token
const generateAccessToken = async (user) => {
  try {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

//generated refersh token
const generateRefreshToken = async (user) => {
  try {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh token"
    );
  }
};

//registring user
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    // Basic validation
    if (!name || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    // Transform role string to enum value
    let userRole = "user";

    // if (role && role.toLowerCase() === "admin") {
    //   // Check if the user has permission to be an admin
    //   // Implement your logic to decide who can be an admin (e.g., check a list of admin emails)
    //   const adminEmails = ["admin1@example.com", "admin2@example.com"]; // Example admin emails
    //   if (!adminEmails.includes(email)) {
    //     throw new ApiError(
    //       403,
    //       "You do not have permission to register as an admin"
    //     );
    //   }
    //   userRole = User.Roles.ADMIN; // Set role to admin
    // }
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      return res
        .status(201)
        .json(new ApiResponse(400, null, "User Already registered "));
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Make sure to hash the password

    const newUser = await User.create({
      name: name, // Assuming the User model has a 'username' field
      email: email,
      password: hashedPassword,
      role: userRole,
    });

    console.log("User created:", newUser);
    return res
      .status(201)
      .json(new ApiResponse(201, newUser, "User registered Successfully"));
  } catch (error) {
    console.log(error);
  }
});

// logging in the user with response as user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }
  const user = await User.findOne({ where: { email: email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  // Save the refresh token to the user record
  await user.update({ refreshToken });

  // Select the user fields you want to return
  const loggedInUser = await User.findOne({
    where: { id: user.id },
    attributes: ["id", "name", "email", "role", "createdAt"],
  });
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

//changing refresh access  token

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshtoken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshtoken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findByPk(decodedToken?.id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshtoken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const newAccessToken = await generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    // Corrected update syntax
    await User.update(
      { refreshToken: newRefreshToken },
      { where: { id: user.id } }
    );

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token");
  }
});

// log out functanality

const logoutUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  await User.update(
    { refreshToken: null }, // Update the refreshToken to null
    { where: { id: userId } } // Specify the user to update
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// forgot password

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const passwordResetToken = jwt.sign(
    { id: user.id },
    process.env.RESET_PASSWORD_SECRET,
    { expiresIn: "1h" }
  );

  // send email with reset link and token
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${passwordResetToken}`;
  // await transporter.sendMail({
  //   from: '"Your App Name" <noreply@yourapp.com>', // Adjust the 'from' address
  //   to: user.email, // Recipient
  //   subject: "Password Reset Request",
  //   text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
  //   html: `<p>You requested a password reset. Click the link below to reset your password:</p>
  //          <a href="${resetLink}">${resetLink}</a>`, // HTML version
  // });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset link sent to your email"));
});

// reset functanality

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required");
  }

  // Verify token
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid token");
  }

  // Fetch user from database
  const user = await User.findByPk(decodedToken.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the user's password
  await user.update({ password: hashedPassword });

  // Use ApiResponse for consistent response
  res
    .status(200)
    .json(new ApiResponse(200, null, "Password has been reset successfully"));
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
};
