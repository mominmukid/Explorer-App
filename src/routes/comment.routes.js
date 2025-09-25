import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/createcomnent/:videoId").post(verifyJWT, addComment);
router.route("/updatecomment/:commentId").patch(verifyJWT, updateComment);
router.route("/deletecomment/:commentId").delete(verifyJWT, deleteComment);
router.route("/getallvideocomment/:videoId").get(getVideoComments);

export default router;
