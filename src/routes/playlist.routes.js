
import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addVideoToPlaylist, createPlaylist, getPlaylistById, getUserPlaylists } from "../controllers/playlist.controller.js";

const router=Router();

router.use(verifyJWT);
router.route("/crete-playlist").post(createPlaylist);
router.route("/getpaly-listbyid/:playlistId").get(getPlaylistById)
router.route("/get-user-playlists/:userId").get(getUserPlaylists)
router.route("/addvideo-playlist/:playlistId/:videoId").post(addVideoToPlaylist)

export default router