import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  getVideoById,
  isPublishVideo,
  publishVideo,
  updateThumbnel,
  updateVideo,
  updateVideoDetiles,
} from "../controllers/video.controller.js";
const router = Router();

router.route("/getall-videos").get(getAllVideos);
router.route("/getvideo/:videoId").get(getVideoById);
router.route("/update-deatils/:videoId").patch(verifyJWT, updateVideoDetiles);
router.route("/change-status/:videoId").post(verifyJWT, isPublishVideo);
router
  .route("/updatevideo/:videoId")
  .patch(verifyJWT, upload.single("video"), updateVideo);
router
  .route("/updade-thumnel/:videoId")
  .patch(verifyJWT, upload.single("Thumbnel"), updateThumbnel);

router.route("/publishvideo").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnel",
      maxCount: 1,
    },
  ]),
  publishVideo
);

export default router;
