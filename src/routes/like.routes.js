import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCommentLike,
  getLikedVideos,
  getVideoLikes,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/togglelike/:videoId").post(verifyJWT,toggleVideoLike);
router.route("/togglecomment/:commentId").post(verifyJWT,toggleCommentLike);
router.route("/toggletweet/:tweetId").post(verifyJWT,toggleTweetLike);
router.route("/getuserlikedvideos").get(verifyJWT,getLikedVideos);
router.route("/getvideolikes/:videoId").get(getVideoLikes);
router.route("/getcommentlikes/:commentId").get(getCommentLike);

export default router;
