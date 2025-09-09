import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export {};
