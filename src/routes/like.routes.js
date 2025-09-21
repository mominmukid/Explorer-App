import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedVideos,
  getVideoLikes,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/togglelike/:videoId").post(toggleVideoLike);
router.route("/togglecomment/:commentId").post(toggleCommentLike);
router.route("/toggletweet/:tweetId").post(toggleTweetLike);
router.route("/getlikedvideos").get(getLikedVideos);
router.route("/getvideolikes/:videoId").get(getVideoLikes);

export default router;
