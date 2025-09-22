import { Router } from "express";
import {
  changeCurrentPassword,
  getUserChanelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  forExporingAggrigation,
  refreshAccessTokan,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  setWatchHistory,
  deleteUserHistory,
  getUserVideos,
  getUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-refreshTokan").post(refreshAccessTokan);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/get-User/:id").get( getUser);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(upload.single("avatar"), verifyJWT, updateAvatar);
router
  .route("/update-coverimage")
  .patch(upload.single("coverImage"), verifyJWT, updateCoverImage);
router.route("/channel-details/:username").get(verifyJWT, getUserChanelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);
router.route("/set-watch-history/:videoId").post(verifyJWT, setWatchHistory);
router.route("/delete-watch-history").delete(verifyJWT, deleteUserHistory);
router.route("/user-videos").get(verifyJWT, getUserVideos);
router
  .route("/for-Exporing-Aggrigation")
  .post(verifyJWT, forExporingAggrigation);
export default router;
