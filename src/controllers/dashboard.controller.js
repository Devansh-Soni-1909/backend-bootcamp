import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscriptions.model.js"
import { Like } from "../models/likes.model.js"
import { ApiError } from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import  asyncHandler  from "../utils/asyncHandler.js"

// GET /api/v1/dashboard/stats
const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Total Videos uploaded
    const totalVideos = await Video.countDocuments({ owner: userId });

    // Total Views across all videos
    const viewsAgg = await Video.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Total Likes across all videos
    const totalLikes = await Like.countDocuments({ video: { $ne: null } }).where("likedBy").equals(userId);

    // Total Subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    const stats = {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers
    };

    res.status(200).json(new ApiResponse(200, stats, "Channel statistics fetched"));
});

// GET /api/v1/dashboard/videos
const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched"));
});

export {
    getChannelStats,
    getChannelVideos
}
