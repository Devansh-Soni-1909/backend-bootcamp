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

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


// Create a new playlist
router.post("/", createPlaylist);

// Get all playlists of a user
router.get("/user/:userId", getUserPlaylists);

// Get a playlist by ID
router.get("/:playlistId", getPlaylistById);

// Update a playlist (name, description)
router.patch("/:playlistId", updatePlaylist);

// Delete a playlist
router.delete("/:playlistId", deletePlaylist);

// Add video to playlist
router.post("/:playlistId/video/:videoId", addVideoToPlaylist);

// Remove video from playlist
router.delete("/:playlistId/video/:videoId", removeVideoFromPlaylist);

export default router;