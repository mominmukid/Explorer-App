import mongoose from "mongoose";
import mongooseAggregatePaginate  from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    title:{
      type:String,
      required:true
    },
    videoFile: {
      type: String, //coudynary url
      required: true,
    },
    videoPublicId:{
      type:String
    },
    thumbnail: {
      type: String, //coudynary url
      required: true,
    },
   thumbnailPublicId:{
      type:String
    },
    description: {
      type: String, 
      required: true,
    },
    duration: {
      type: Number, //coudynary url
      required: true,
    },
    views: {
      type: Number, //coudynary url
      default: 0,
    },
    isPublished: {
      type: Boolean, 
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

//this code for the use aggregation pipline
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);
