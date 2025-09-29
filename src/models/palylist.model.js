import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    thumbnail: {
      type: String, //coudynary url
      // required: true,
    },
    thumbnailPublicId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
