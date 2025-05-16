import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { Video } from "../models/video.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const matchStage = {};

    // 🔍 Search by title or description
    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // 👤 Filter by owner
    if (userId) {
        matchStage.owner = userId;
    }

    // 🔀 Sorting
    const sortStage = {
        [sortBy]: sortType === "asc" ? 1 : -1
    };

    // 🧠 Aggregation pipeline
    const aggregateQuery = Video.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        { $sort: sortStage },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: "$ownerDetails.username" // or fullName/email/etc.
            }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await Video.aggregatePaginate(aggregateQuery, options);

    res.status(200).json(
        new ApiResponse(200, result, "Videos fetched successfully")
    );
});



const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required");
    }

    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Video and thumbnail files are required");
    }

    const videoLocalPath = req.files.videoFile[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;

    // Upload video to Cloudinary
    const videoUploadResult = await uploadOnCloudinary(videoLocalPath);
    if (!videoUploadResult || !videoUploadResult.url) {
        throw new ApiError(500, "Error uploading video to cloudinary");
    }

    // Upload thumbnail to Cloudinary
    const thumbnailUploadResult = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnailUploadResult || !thumbnailUploadResult.url) {
        throw new ApiError(500, "Error uploading thumbnail to cloudinary");
    }

    // Create a video record in database
    const newVideo = await Video.create({
        title,
        description,
        videoFile: videoUploadResult.url,
        thumbnail: thumbnailUploadResult.url,
        duration: Math.floor(videoUploadResult.duration || 0),
        owner: req.user._id,
        isPublished: true
    });

    res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});



const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // ✅ Check if videoId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // 📥 Fetch video with owner details
    const video = await Video.findById(videoId).populate({
        path: "owner",
        select: "username email" // You can include more fields if needed
    });

    // ❌ Not found
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // ✅ Success
    res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnail = req.file;

    // 🧾 Debug logs
    console.log("🔧 updateVideo triggered");
    console.log("videoId:", videoId);
    console.log("📝 title:", title, "| description:", description);
    console.log("📂 Thumbnail received:", thumbnail);

    // ✅ Validate videoId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // 🔍 Find the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    console.log("🎥 Found video:", video);

    // ✅ Update fields if provided
    if (title) {
        video.title = title;
        console.log("✅ Updated title");
    }

    if (description) {
        video.description = description;
        console.log("✅ Updated description");
    }

    // ☁️ Upload new thumbnail if provided
    if (thumbnail) {
        console.log("📤 Uploading new thumbnail to Cloudinary...");
        const thumbnailUpload = await uploadOnCloudinary(thumbnail.path);
        if (!thumbnailUpload?.url) {
            throw new ApiError(500, "Thumbnail upload failed");
        }
        video.thumbnail = thumbnailUpload.url;
        console.log("✅ Thumbnail updated to:", video.thumbnail);
    } else {
        console.log("ℹ️ No new thumbnail provided");
    }

    // 💾 Save updated video
    await video.save();
    console.log("💾 Video saved to database");

    res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // ✅ Validate video ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // 🔍 Find the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Optional: Check if current user is the owner
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // 🧹 Extract Cloudinary public IDs from URLs
    const getPublicId = (url) => {
        const parts = url.split("/");
        const fileName = parts[parts.length - 1];
        return fileName.split(".")[0]; // Remove extension
    };

    const videoPublicId = getPublicId(video.videoFile);
    const thumbnailPublicId = getPublicId(video.thumbnail);

    // ☁️ Delete video and thumbnail from Cloudinary
    await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
    await cloudinary.uploader.destroy(thumbnailPublicId, { resource_type: "image" });

    // 🗑️ Delete from DB
    await video.deleteOne();

    res.status(200).json(
        new ApiResponse(200, {}, "Video and related Cloudinary files deleted successfully")
    );
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // 🔍 Find the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 🔁 Toggle publish status
    video.isPublished = !video.isPublished;

    // 💾 Save updated video
    await video.save();

    res.status(200).json(
        new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`)
    );
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};





