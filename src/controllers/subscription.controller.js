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
    throw new ApiError(400, "please provide the Channal Id or userId");
  }
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid video id format");
  }
  const channal = await Subcription.find({ channel: channelId });
  console.log(channal);

  if (channal.length <= 0) {
    const newChannel = await Subcription.create({
      channel: channelId,
      subscriber: [userId],
    });
    return res
      .status(200)
      .json(
        new ApiResponce(200, newChannel, "Channel subscribed successfully ")
      );
  }

  const isSubcribed = await Subcription.findOne({
    channel: channelId,
    subscriber: { $in: [userId] },
  });

  if (isSubcribed) {
    return res.status(200).json(new ApiResponce(200, "User Subcribed already"));
  }

  const newSubcribed = await Subcription.findByIdAndUpdate(
    channal._id,
    { $addToSet: { subscriber: userId } }, // prevents duplicates
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponce(200, newSubcribed, "user Subcribed successfully"));
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
  const subscribeChannel= await Subcription.aggregate([
   {$match:{subscriber:new mongoose.Types.ObjectId(subscriberId)}}
  ]);

  return res.status(200).json(
   new ApiResponce(200,subscribeChannel,"User subscription channel fached success fully")
  )

});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
