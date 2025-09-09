import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId || !videoId.trim()) {
    throw new ApiError("Please provide the provide video id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Tweet id format");
  }
  if (limit <= 0) {
    throw new ApiError(400, "Page and limit must be positive numbers");
  }
  const skip = (page - 1) * limit;
  const comments = await Comment.find({ video: videoId })
    .limit(Number(limit))
    .skip(skip);

  return res
    .status(200)
    .json(new ApiResponce(200, comments, "All comment feached successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;
  if (!videoId || !videoId.trim() || !content || !content.trim()) {
    throw new ApiError(400, "Please provide the Video id");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Tweet id format");
  }
  const comment = await Comment.create({
    content,
    owner: userId,
    video: videoId,
  });
  if (!comment) {
    throw new ApiError(500, "Something went wrong when create comment!");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, comment, "Comment create successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;
  if (!commentId || !commentId.trim() || !content || !content.trim()) {
    throw new ApiError(400, "Please provide the Video id");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Tweet id format");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found releted id");
  }
  if (!comment.owner === userId) {
    throw new ApiError(400, "User not Athorise to update comment");
  }
  comment.content = content;
  await comment.save();
  return res
    .status(200)
    .json(new ApiResponce(200, comment, "Comment updeted successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  if (!commentId || !commentId.trim()) {
    throw new ApiError(400, "Please provide the Comment id");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Tweet id format");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment is not found");
  }
  if (!comment.owner === userId) {
    throw new ApiError(400, "User not Athorise to delete comment");
  }
  const result = await Comment.deleteOne({
    _id: commentId,
    owner: comment.owner,
  });
  if (result.deletedCount === 0) {
    return res
      .status(404)
      .json({ message: "Comment not found or not authorized" });
  }
  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Comment deleted successfully"));
});

export { addComment, updateComment, deleteComment, getVideoComments };
