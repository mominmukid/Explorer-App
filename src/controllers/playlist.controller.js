import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/palylist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name.trim() !== !description.trim()) {
    throw new ApiError(400, "Name and description is required");
  }
  const userId = req.user?._id;
  const playList = await Playlist.create({
    name,
    description,
    owner: userId,
  });
  if (!playList) {
    throw new ApiError(500, "Something went while create database ");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, playList, "PlayList create successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(400, "UserId Must be provieded");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const playList = await Playlist.find({ owner: userId });
  if (!playList) {
    throw new ApiError(400, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, playList, "Playlists feched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId || !playlistId.trim()) {
    throw new ApiError(400, "Provide the playlist id");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const palyList = await Playlist.findById(playlistId);
  if (!palyList) {
    throw new ApiError(400, "PlayList Not Found!!");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, palyList, "playList get succeessfully !!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "PlayList and video id Must be provided");
  }
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const playList = await Playlist.findById(playlistId);
  if (!playList) {
    throw new ApiError(404, "Playlist not found");
  }
  if (playList.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized to update this playlist");
  }
  const isIncludeVideo = playList.videos.some(
    (vid) => vid.toString() === videoId.toString()
  );

  if (isIncludeVideo) {
    throw new ApiError(400, "Video already in playlist");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to update playlist");
  }

  // (optional) check if video was already in playlist
  if (!updatedPlaylist.videos.includes(videoId)) {
    throw new ApiError(400, "Video was not added to playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updatedPlaylist,
        "Video Added in the play list successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "PlayList and video id Must be provided");
  }
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const playList = await Playlist.findById(playlistId);
  if (!playList) {
    throw new ApiError(404, "Playlist not found");
  }
  if (playList.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized to update this playlist");
  }
  const isIncludeVideo = playList.videos.some(
    (vid) => vid.toString() === videoId.toString()
  );

  if (!isIncludeVideo) {
    throw new ApiError(400, "Video Not in playlist");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to update playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updatedPlaylist,
        "Video Added in the play list successfully"
      )
    );
});
const updatePlayListDetails = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { playListId } = req.params;
  if (!name.trim() || !description.trim()) {
    throw new ApiError(400, "Name and description is required");
  }
  if (!playListId || !playListId.trim()) {
    throw new ApiError(400, "Provide the playlist id");
  }
  if (!isValidObjectId(playListId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const playlist = await Playlist.findById(playListId);
  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized to update this playlist");
  }
  if (!playlist) {
    throw new ApiError(400, "PlayList is not found");
  }
  playlist.name = name;
  playlist.description = description;
  await Playlist.save();

  return res
    .status(200)
    .json(new ApiResponce(200, playlist, "PlayList updated successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user?._id;
  if (!playlistId || !playlistId.trim()) {
    throw new ApiError(400, "Provide the playlist id");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const playlist = await Playlist.findById(playlistId);
  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized to update this playlist");
  }
  if (!playlist) {
    throw new ApiError(400, "PlayList is not found");
  }
  const result = await Playlist.deleteOne({
    _id: playlistId,
    owner: userId,
  });
  if (result.deletedCount === 0) {
    return res
      .status(404)
      .json({ message: "playlist not found or not authorized" });
  }
  return res
    .status(200)
    .json(new ApiResponce(200, "PlayList deleted successfully"));
});

export {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  addVideoToPlaylist,
  updatePlayListDetails,
  removeVideoFromPlaylist,
};
