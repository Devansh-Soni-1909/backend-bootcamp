import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ✅ Get all comments for a video (with pagination)
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username email") // optional: populate user info
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const totalComments = await Comment.countDocuments({ video: videoId });

    res.status(200).json(
        new ApiResponse(200, {
            comments,
            totalPages: Math.ceil(totalComments / limit),
            currentPage: Number(page),
        }, "Comments fetched successfully")
    );
});

// ✅ Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const newComment = await Comment.create({
        video: videoId,
        owner: req.user._id,
        content
    });

    res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"));
});

// ✅ Update a comment
const updateComment = asyncHandler(async (req, res) => {
    console.log("📥 Received request to update comment");

    const { commentId } = req.params;
    const { content } = req.body;

    console.log("🆔 Comment ID:", commentId);
    console.log("📝 New content:", content);
    console.log("👤 Logged-in user:", req.user);

    if (!content) {
        throw new ApiError(400, "Updated content is required");
    }

    const comment = await Comment.findById(commentId).select("owner content"); // Explicit select

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    console.log("🗃️ Fetched comment from DB:", comment);
    console.log("👤 Comment owner:", comment.owner);
    console.log("👤 Request user ID:", req.user._id);

    // Safe ownership check
    if (!comment.owner || !comment.owner.equals(req.user._id)) {
        console.log("❌ Unauthorized update attempt");
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    comment.content = content;
    await comment.save();

    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});



// ✅ Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Optional: Only allow the comment owner to delete
    if (!comment.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await comment.deleteOne();

    res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
