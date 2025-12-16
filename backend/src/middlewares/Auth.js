import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";

/**
 * @desc   Verify JWT from HTTP-only cookies
 * @usage  Protected routes middleware
 */
export const verifyJwt = asyncHandler(async (req, res, next) => {
  // 🔍 Debug (keep for now, remove later)
  // console.log("Incoming cookies:", req.cookies);

  try {
    // ✅ Read token ONLY from cookies (primary)
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // ✅ Verify token
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // ✅ Fetch user & attach to request
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Invalid or expired access token"
    );
  }
});
