import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file




// Get all comments for a video (public route or protected as needed)
router.get("/video/:videoId", getVideoComments);

// Create a new comment (requires authentication)
router.post("/video/:videoId", verifyJWT, addComment);

// Update a comment (requires authentication)
router.patch("/c/:commentId", verifyJWT, updateComment);

// Delete a comment (requires authentication)
router.delete("/c/:commentId", verifyJWT, deleteComment);

export default router;