import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"; 

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Get token from cookie or header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();
      
      
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify token
    const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
console.log(decodedInfo);
    // Find user without password & refreshToken
    const user = await User.findById(decodedInfo?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid Access Token");
  }
});

export { verifyJWT };
