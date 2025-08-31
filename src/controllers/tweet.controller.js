import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const owner = req.user._id;
  if (!content) {
    throw new ApiError(
      400,
      "User is not Authenticate Please Login or register "
    );
  }
  const tweet = await Tweet.create({
    content,
    owner,
  });

  if (!tweet) {
    throw new ApiError(500, "Intarnal server Error");
  }

  return res
    .status(200)
    .json(new ApiResponce(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const user = req.user?._id;
  const userTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user),
      },
    },
  ]);
  if (!userTweets) {
    throw new ApiError(500, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, userTweets, "Tweet fetched successfully!!"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;
  if (!content?.trim()) {
    throw new ApiError(400, "Tweet contnt must be required!!");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid Tweet id format");
  }
  const tweet = await Tweet.findById(tweetId);
  if (userId.toString() !== tweet.owner.toString()) {
    throw new ApiError(404, "Not Authorize for the update tweet");
  }
  tweet.content = content || tweet.content;
  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponce(200, tweet, "Tweet feached successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const tweet = await Tweet.findById(tweetId);
  const userId = req.user?._id;
  if (userId.toString() !== tweet.owner.toString()) {
    throw new ApiError(400, "Not Authorize for the update tweet");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid Tweet id format");
  }
  const result = await Tweet.deleteOne({ _id: tweetId, owner: tweet.owner });
  if (result.deletedCount === 0) {
    return res
      .status(404)
      .json({ message: "Tweet not found or not authorized" });
  }
  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Tweet deleted successfully"));
});
export { createTweet, getUserTweets, updateTweet, deleteTweet };
