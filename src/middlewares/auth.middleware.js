import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    
     
    
    const tokan =
      (await req.cookies?.accessToken) ||
      req.header("Authorization")?.replace("Bearer", "");
    if (!tokan) {
      new ApiError(401, "Unauthorise request");
    }
    
    const decodedInfo = jwt.verify(tokan, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedInfo?._id).select(
      "-password -refreshTokan"
    );
    
    if (!user) {
      new ApiError(401, "Invalid AccessTokan");
    }
    
    ((req.user = user), next());
    
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid AccessTokan");
    
  }
});

export { verifyJWT };
