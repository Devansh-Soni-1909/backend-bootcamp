import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.get("/stats",  getChannelStats);
router.get("/videos",  getChannelVideos);

export default router;