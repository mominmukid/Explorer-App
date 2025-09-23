import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subcription } from "../models/subcription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!channelId || !channelId.trim()) {
    throw new ApiError(400, "Please provide the Channel Id");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id format");
  }

  // check if subscription doc exists for this channel
  let channelDoc = await Subcription.findOne({ channel: channelId });

  if (!channelDoc) {
    // if no doc, create new with this user as subscriber
    const newChannel = await Subcription.create({
      channel: channelId,
      subscriber: [userId],
    });
    return res
      .status(201)
      .json(
        new ApiResponce(201, newChannel, "Channel subscribed successfully")
      );
  }

  // check if user is already subscribed
  const isSubscribed = channelDoc.subscriber.includes(userId);

  if (isSubscribed) {
    // unsubscribe: pull userId from subscriber array
    const updated = await Subcription.findByIdAndUpdate(
      channelDoc._id,
      { $pull: { subscriber: userId } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponce(200, updated, "User unsubscribed successfully"));
  } else {
    // subscribe: add userId
    const updated = await Subcription.findByIdAndUpdate(
      channelDoc._id,
      { $addToSet: { subscriber: userId } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponce(200, updated, "User subscribed successfully"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId || !channelId.trim()) {
    throw new ApiError(400, "please provide the Chanal Id or userId");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const result = await Subcription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } }, // filter doc
    { $project: { subscribersCount: { $size: "$subscriber" } } },
  ]);
  return res
    .status(200)
    .json(new ApiResponce(200, result, "Subcriber feached successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId || !subscriberId.trim()) {
    throw new ApiError(400, "please provide the Chanal Id or userId");
  }
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const subscribeChannel = await Subcription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        subscribeChannel,
        "User subscription channel fached success fully"
      )
    );
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId || !channelId.trim()) {
    throw new ApiError(400, "please provide the Chanal Id or userId");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const subscribers = await Subcription.findOne({ channel: channelId }); // populate subscriber details from User model

  if (!subscribers) {
    return res
      .status(200)
      .json(new ApiResponce(200, [], "No subscribers found for this channel"));
  }
  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        subscribers.subscriber,
        "Subscribers fetched successfully"
      )
    );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  getChannelSubscribers,
};
