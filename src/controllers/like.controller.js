import mongoose from "mongoose"
import { Like } from "../models/likes.model.js"
import { ApiError } from "../utils/ApiError.js"
import  ApiResponse  from "../utils/ApiResponse.js"
import asyncHandler  from "../utils/asyncHandler.js"

const toggleLikeHelper = async ({ userId, fieldName, itemId }) => {
    const filter = {
        likedBy: userId,
        [fieldName]: itemId
    };

    const existingLike = await Like.findOne(filter);

    if (existingLike) {
        await existingLike.deleteOne();
        return { liked: false };
    } else {
        const likeData = {
            likedBy: userId,
            comment: undefined,
            video: undefined,
            tweet: undefined
        };
        likeData[fieldName] = itemId;

        await Like.create(likeData);
        return { liked: true };
    }
};

// Toggle Like on Video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const result = await toggleLikeHelper({
        userId: req.user._id,
        fieldName: "video",
        itemId: videoId
    });

    res.status(200).json(new ApiResponse(200, result, result.liked ? "Video liked" : "Video unliked"));
});

// Toggle Like on Comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const result = await toggleLikeHelper({
        userId: req.user._id,
        fieldName: "comment",
        itemId: commentId
    });

    res.status(200).json(new ApiResponse(200, result, result.liked ? "Comment liked" : "Comment unliked"));
});

// Toggle Like on Tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const result = await toggleLikeHelper({
        userId: req.user._id,
        fieldName: "tweet",
        itemId: tweetId
    });

    res.status(200).json(new ApiResponse(200, result, result.liked ? "Tweet liked" : "Tweet unliked"));
});

// Get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({ likedBy: req.user._id, video: { $ne: null } }).populate("video");

    const likedVideos = likes.map((like) => like.video);

    res.status(200).json(new ApiResponse(200, likedVideos, "Fetched liked videos"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
