import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary } from "../utils/deleteImageCloudinary.js";
import mongoose from "mongoose";

//this is use to genrate the access and refrash tokan
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // call instance methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// ***********************************************************************
//this method handles user registration

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  // this is check any one field is empty if true throw error
  if (
    [fullname, username, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fiels are requird");
  }

  // check if user already exists
  const existedUseremail = await User.findOne({
    $or: [{ email }],
  });
  if (existedUseremail) {
    throw new ApiError(409, "Email already existed");
  }
  const existedUserName = await User.findOne({
    $or: [{ username }],
  });
  if (existedUserName) {
    throw new ApiError(409, "Username already existed");
  }

  // get avatar and cover image paths from request using multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // check if avatar file is provided
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  // upload avatar and cover image to Cloudinary
  const avatars = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatars) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create user
  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatars.url,
    avatarPublicId: avatars?.public_id || "",
    coverImagePublicId: coverImage?.public_id || "",
    coverImage: coverImage?.url || "",
  });

  // remove sensitive information
  const userCreated = await User.findById(user._id).select(
    "-password -refreshTokan"
  );
  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while user register");
  }

  // user created successfully
  // set cookoies
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only true in prod
    sameSite: "none", // for cross-site (frontend & backend different domains)
    path: "/",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponce(200, userCreated, "User Created successfully"));
});

// ***************************************************************

//this method handles user login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User Email not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshTokan"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only true in prod
    sameSite: "none", // for cross-site (frontend & backend different domains)
    path: "/",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("isLoggedin", true, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .json(
      new ApiResponce(
        200,
        { user: loggedInUser },
        "User logged in successfully!"
      )
    );
});

//************************************************************* */
// this is  for the logout user
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .clearCookie("isLoggedin", options)
    .json(new ApiResponce(200, user, "Logout successfully "));
});

// ************************************************

const refreshAccessTokan = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponce(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "User not Found");
  }
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordCorrect) {
    return new ApiError(400, "Invalid Old Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Password cahange successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select(
    "-password -refreshTokan -fullname -avatarPublicId -coverImagePublicId -videos -watchHistory -createdAt -updatedAt -__v -email -_id -coverImage -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, user, "User fetched successfully"));
  //  return user;
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname } = req.body;
  if (!fullname) {
    throw new ApiError(400, " Fullname both are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
      },
    },
    { new: true }
  ).select("-password -refreshTokan");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "Account details updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please provide the avatar image");
  }

  const avatars = await uploadOnCloudinary(avatarLocalPath);
  if (!avatars) {
    throw new ApiError(400, "Error while uploading the file ");
  }
  const olduser = await User.findById(req.user?._id);
  deleteFromCloudinary(olduser.avatarPublicId || "");
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatars.url,
        avatarPublicId: avatars.public_id || " ",
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalpath = req.file?.path;
  if (!coverImageLocalpath) {
    throw new ApiError(400, "please selete image");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  if (!coverImage) {
    throw new ApiError(400, "Error while uploading coverImage");
  }
  const olduser = await User.findById(req.user?._id);
  deleteFromCloudinary(olduser.coverImagePublicId || "");
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
        coverImagePublicId: coverImage.public_id,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponce(200, user, "CoverImage Updated successfully"));
});

const getUserChanelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subcriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subcriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubcribedToCount: {
          $size: "$subscribedTo",
        },
        isSubcribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        channelSubcribedToCount: 1,
        isSubcribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "This account is not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        channel[0],
        "User channal information get successfully "
      )
    );
});

const setWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new ApiError(400, "videoId is required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const videoIdObject = new mongoose.Types.ObjectId(videoId);
  const isVideoAlreadyInWatchHistory = user.watchHistory.some((id) =>
    id.equals(videoIdObject)
  );
  if (isVideoAlreadyInWatchHistory) {
    user.watchHistory = user.watchHistory.filter(
      (id) => !id.equals(videoIdObject)
    );
  }
  user.watchHistory.unshift(videoIdObject);
  if (user.watchHistory.length > 100) {
    user.watchHistory.pop();
  }
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        user.watchHistory,
        "Watch history updated successfully"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    //next piplene
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        user[0].watchHistory,
        "User watchhistory fatched Successfully"
      )
    );
});

const forExporingAggrigation = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },

    //new pipline
  ]);
  return res
    .status(200)
    .json(
      new ApiResponce(200, user[0].owner, "User fatched succeessFully !!!")
    );
});
const deleteUserHistory = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { watchHistory: [] } },
    { new: true }
  ).select("-password -refreshTokan");
  return res
    .status(200)
    .json(
      new ApiResponce(200, user, "User watch history deleted successfully")
    );
});

const getUserVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: {
        password: 0, // hide password
        refreshToken: 0, // hide refresh token
        __v: 0, // optional: hide mongoose version key
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "userVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponce(200, user, "User videos fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessTokan,
  changeCurrentPassword,
  getUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChanelProfile,
  getWatchHistory,
  forExporingAggrigation,
  setWatchHistory,
  deleteUserHistory,
  getUserVideos,
};
