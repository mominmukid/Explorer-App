import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import {
  deleteFromCloudinary,
  deleteFromCloudinaryVideo,
} from "../utils/deleteImageCloudinary.js";
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, query, sortBy, sortType, userId } = req.query;

  //TODO: get all videos based on query, sort, pagination

  if (limit <= 0) {
    throw new ApiError(400, "Page and limit must be positive numbers");
  }

  const skip = (page - 1) * limit;

  // fiter
  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }
  if (userId) {
    filter.owner = userId;
  }

  //sort
  const sort = {};
  sort[sortBy] = sortType === "asc" ? 1 : -1;

  //get videos
  const videos = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  if (!videos || videos.length === 0) {
    return res.status(404).json({ message: "No videos found" });
  }
  return res
    .status(200)
    .json(new ApiResponce(200, videos, "Videos featched successfully"));
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if ((!title.trim() && !description.trim()) || !category.trim()) {
    throw new ApiError(400, "Title, description and category must be required");
  }
  const userId = req.user?._id;
  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnelLocalPath = req.files?.thumbnel?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file must be required");
  }
  if (!thumbnelLocalPath) {
    throw new ApiError(400, "Thumbnel file must be required");
  }
  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnel = await uploadOnCloudinary(thumbnelLocalPath);
  if (!video) {
    throw new ApiError(400, "Video file must be required");
  }
  if (!thumbnel) {
    throw new ApiError(400, "Thumbnel file must be required");
  }

  //create new video document
  const userVideo = await Video.create({
    title,
    category,
    description,
    owner: userId,
    videoFile: video?.url || "",
    thumbnail: thumbnel?.url || "",
    duration: video.duration || 0,
    thumbnailPublicId: thumbnel?.public_id || "",
    videoPublicId: video?.public_id || "",
  });
  const finalvideo = await Video.findById(userVideo._id).select(
    "-password -refreshTokan"
  );
  if (!userVideo) {
    throw new ApiError(
      500,
      "Something went wrong while video document creation"
    );
  }

  return res
    .status(200)
    .json(new ApiResponce(200, finalvideo, "Video uploaded successfully!!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId.trim()) {
    throw new ApiError(400, "please give video id");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Not found this id releted video");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video feached Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id; // from auth middleware

  if (!videoId || !videoId.trim()) {
    throw new ApiError(400, "Video Id is not provided");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!userId || video.owner.toString() !== userId.toString()) {
    throw new ApiError(400, "Not authorized to update this video");
  }

  if (!req.file?.path) {
    throw new ApiError(400, "New video file is required for update");
  }

  const uploaded = await uploadOnCloudinary(req.file.path);
  if (!uploaded) {
    throw new ApiError(500, "Failed to upload new video to Cloudinary");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        videoFile: uploaded.secure_url || uploaded.url,
        videoPublicId: uploaded.public_id,
        duration: uploaded.duration ?? video.duration,
      },
    },
    { new: true } // return updated doc
  );

  // Delete old file from Cloudinary (fire and forget)
  if (video.videoPublicId) {
    await deleteFromCloudinaryVideo(video.videoPublicId);
  }

  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!videoId || !videoId.trim()) {
    throw new ApiError(400, "Provide the Video ID");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Video ID is syntax is not valid");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not found");
  }
  if (video.owner.toString() !== userId.toString()) {
    throw new ApiError(400, "Not authorized to update this video");
  }
  await deleteFromCloudinary(video.thumbnailPublicId);
  await deleteFromCloudinaryVideo(video.videoPublicId);
  const result = await Video.deleteOne({ _id: videoId });
  if (result.deletedCount <= 0) {
    throw new ApiError(500, "something went deleting video on database");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Video deleted successfully"));
});

const updateThumbnel = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id || req.user?.id; // from auth middleware

  if (!videoId || !videoId.trim()) {
    throw new ApiError(400, "Video Id is not provided");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!userId || video.owner.toString() !== userId.toString()) {
    throw new ApiError(400, "Not authorized to update this video");
  }

  if (!req.file?.path) {
    throw new ApiError(400, "New video file is required for update");
  }

  const uploaded = await uploadOnCloudinary(req.file.path);
  if (!uploaded) {
    throw new ApiError(500, "Failed to upload new video to Cloudinary");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: uploaded.secure_url || uploaded.url,
        thumbnailPublicId: uploaded.public_id || "",
      },
    },
    { new: true } // return updated doc
  );

  // Delete old file from Cloudinary (fire and forget)
  if (video.thumbnailPublicId) {
    await deleteFromCloudinary(video.thumbnailPublicId);
  }

  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video updated successfully"));
});

const updateVideoDetiles = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id must Be provided");
  }
  if (!title.trim() || !description.trim()) {
    throw new ApiError(400, "title and description both are required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video is not Found ");
  }
  video.title = title;
  video.description = description;
  await video.save();
  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video details updated successfully"));
});

const isPublishVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !videoId.trim()) {
    throw new ApiError(400, "Please Provide the video ID");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  const publishSate = video.isPublished;
  video.isPublished = !publishSate;
  await video.save();
  return res
    .status(200)
    .json(
      new ApiResponce(200, video, "Video published state changed successfully")
    );
});

const setViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const deviceId = req.deviceId;
  if (!videoId || !videoId.trim()) {
    throw new ApiError(400, "Please Provide the video ID");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  if (video.views.includes(deviceId)) {
    return res
      .status(200)
      .json(new ApiResponce(200, {}, "Video view count not changed"));
  }
  video.views.push(deviceId);
  video.views = video.views.length;
  await video.save();
  const view = video.views+1;
  return res
    .status(200)
    .json(new ApiResponce(200, view , "Video view count updated successfully"));
});

const getVideoUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get video by id 
  if (!userId.trim()) {
    throw new ApiError(400, "please give video id");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const video = await Video.find({owner:userId});

  if (!video) {
    throw new ApiError(404, "Not found this id releted video");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video feached Successfully"));
});

export {
  deleteVideo,
  updateVideo,
  publishVideo,
  getVideoById,
  getAllVideos,
  updateThumbnel,
  isPublishVideo,
  updateVideoDetiles,
  setViews,
  getVideoUserById
};
