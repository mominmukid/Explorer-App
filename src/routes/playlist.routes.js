import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlayListDetails,
} from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// router.use(verifyJWT);
router
  .route("/crete-playlist")
  .post(verifyJWT, upload.single("Thumbnel"), createPlaylist);
router.route("/getpaly-listbyid/:playlistId").get(getPlaylistById);
router.route("/getuserplaylists").get(verifyJWT, getUserPlaylists);
router
  .route("/addvideo-playlist/:playlistId/:videoId")
  .post(verifyJWT, addVideoToPlaylist);
router
  .route("/remove-video/:playlistId/:videoId")
  .delete(verifyJWT, removeVideoFromPlaylist);
router
  .route("/updatedetails/:playListId")
  .post(verifyJWT, updatePlayListDetails);
router.route("/deleteplaylist/:playlistId").delete(verifyJWT, deletePlaylist);

export default router;
