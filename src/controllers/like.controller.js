import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!videoId?.trim()) {
    throw new ApiError(400, "Video id is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // find like doc for this user
  let likeDoc = await Like.findOne({ likeBy: userId });

  if (!likeDoc) {
    // if user has no like doc, create new with this video
    likeDoc = await Like.create({
      likeBy: userId,
      video: [videoId],
    });
    return res
      .status(201)
      .json(new ApiResponce(201, likeDoc, "Video liked successfully"));
  }

  // check if video is already liked
  const isLiked = likeDoc.video.includes(videoId);

  if (isLiked) {
    // remove video from liked list
    const updatedLike = await Like.findByIdAndUpdate(
      likeDoc._id,
      { $pull: { video: videoId } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponce(200, updatedLike, "Video unliked successfully"));
  } else {
    // add video to liked list
    const updatedLike = await Like.findByIdAndUpdate(
      likeDoc._id,
      { $addToSet: { video: videoId } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponce(200, updatedLike, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!commentId?.trim()) {
    throw new ApiError(400, "Comment id is required");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id format");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // find like doc for this user
  let commentLikeDoc = await Like.findOne({ likeBy: userId });

  if (!commentLikeDoc) {
    // if user has no like doc, create new with this comment
    commentLikeDoc = await Like.create({
      likeBy: userId,
      comment: [commentId],
    });
    return res
      .status(201)
      .json(new ApiResponce(201, commentLikeDoc, "Comment liked successfully"));
  }

  // check if comment is already liked
  const isLiked = commentLikeDoc.comment.includes(commentId);

  if (isLiked) {
    // remove comment from liked list
    const updatedLike = await Like.findByIdAndUpdate(
      commentLikeDoc._id,
      { $pull: { comment: commentId } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponce(200, updatedLike, "Comment unliked successfully"));
  } else {
    // add comment to liked list
    const updatedLike = await Like.findByIdAndUpdate(
      commentLikeDoc._id,
      { $addToSet: { comment: commentId } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponce(200, updatedLike, "Comment liked successfully"));
  }
});


const getCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId?.trim()) {
    throw new ApiError(400, "Comment id is required");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return ApiResponce(200, "Comment not found");
  }
  const isLiked = await Like.find({
    comment: { $in: [commentId] },
  });
  return res
    .status(200)
    .json(new ApiResponce(200, isLiked, "fetched Comment successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user?._id;

  if (!tweetId?.trim()) {
    throw new ApiError(400, "tweet id is required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  // find like doc for this user
  let TweetDoc = await Like.findOne({ likeBy: userId });

  if (!TweetDoc) {
    // if user has no like doc, create new
    TweetDoc = await Like.create({
      likeBy: userId,
      tweet: [tweetId],
    });
    return res
      .status(201)
      .json(new ApiResponce(201, TweetDoc, "Like added successfully"));
  }
  // if likeDoc already exists, check if video is included
  const isLiked = await Like.findOne({
    likeBy: userId,
    tweet: { $in: [tweetId] },
  });

  if (isLiked) {
    return res.status(200).json(new ApiResponce(200, "User likced already"));
  }

  const newTweetDoc = await Like.findByIdAndUpdate(
    TweetDoc._id,
    { $addToSet: { tweet: tweetId } }, // prevents duplicates
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponce(200, newTweetDoc, "Like added successfullyyyyy"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;
  const userLikedVideos = await Like.aggregate([
    {
      $match: {
        likeBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedvideos",
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
        userLikedVideos[0].likedvideos,
        "user Liked video feached successfully"
      )
    );
});

const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId?.trim()) {
    throw new ApiError(400, "Comment id is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const comment = await Video.findById(videoId);
  if (!comment) {
    throw new ApiError(404, "Video not found");
  }
  const isLiked = await Like.find({
    video: { $in: [videoId] },
  });
  return res
    .status(200)
    .json(new ApiResponce(200, isLiked, "fetched Comment successfully"));
});
export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getVideoLikes,
  getCommentLike,
};
