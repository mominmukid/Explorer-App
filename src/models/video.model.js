import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Education",
        "Sports",
        "Comedy",
        "Lifestyle",
        "Movies",
        "Others",
        "Music",
        "News",
        "Vlogs",
        "Gaming",
        "Entertainment",
        "Science & Technology",
        "Travel",
        "Food",
        "Health & Fitness",
        "Fashion & Beauty",
        "DIY & Crafts",
        "Automotive",
        "Animals & Pets",
        "Business & Finance",
        "History",
        "Art & Culture",
        "Politics",
        "Environment",
        "Religion & Spirituality",
        "Parenting",
        "Real Estate",
        "Photography",
        "Books & Literature",
        "Theater",
        "Animation",
        "Documentary",
        "Short Films",
      ],
    },
    videoFile: {
      type: String, //coudynary url
      required: true,
    },
    videoPublicId: {
      type: String,
    },
    thumbnail: {
      type: String, //coudynary url
      required: true,
    },
    thumbnailPublicId: {
      type: String,
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
      type: String,
      default: "0",
    },
    viewsCount:{
      type:Number,
      default:0,
    } ,//array of deviceId
    isPublished: {
      type: Boolean,
      default: true, 
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//this code for the use aggregation pipline
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
