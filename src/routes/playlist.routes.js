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

const router = Router();

router.use(verifyJWT);
router.route("/crete-playlist").post(createPlaylist);
router.route("/getpaly-listbyid/:playlistId").get(getPlaylistById);
router.route("/get-user-playlists/:userId").get(getUserPlaylists);
router
  .route("/addvideo-playlist/:playlistId/:videoId")
  .post(addVideoToPlaylist);
router
  .route("/remove-video/:playlistId/:videoId")
  .delete(removeVideoFromPlaylist);
router.route("/updatedetails/:playListId").post(updatePlayListDetails);
router.route("/deleteplaylist/:playlistId").delete(deletePlaylist);

export default router;
