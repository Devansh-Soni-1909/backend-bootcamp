import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlists.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    console.log("💡 createPlaylist controller called");

    console.log("🔍 req.body:", req.body);
    const { name, description } = req.body;

    if (!name) {
        console.error("❌ Playlist name is missing in request body");
        throw new ApiError(400, "Playlist name is required");
    }
    console.log(`✅ Playlist name received: ${name}`);
    console.log(`ℹ️ Playlist description received: ${description}`);

    console.log("🔍 Checking req.user:", req.user);
    if (!req.user || !req.user._id) {
        console.error("❌ req.user or req.user._id is missing - user not authenticated?");
        throw new ApiError(401, "User authentication required");
    }
    console.log(`✅ Owner user id: ${req.user._id}`);

    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    });
    console.log("💾 New playlist created in database:", newPlaylist);

    res.status(201).json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));
});



// ✅ Get all playlists of a user

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

    const userExists = await User.findById(userId);
    if (!userExists) throw new ApiError(404, "User not found");

    const playlists = await Playlist.find({ owner: userId });

    res.status(200).json(new ApiResponse(200, playlists, "User playlists fetched"));
});



// ✅ Get playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID");

    const playlist = await Playlist.findById(playlistId).populate("videos");

    if (!playlist) throw new ApiError(404, "Playlist not found");

    res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched"));
});

// ✅ Add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"));
});

// ✅ Remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    const initialLength = playlist.videos.length;
    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId);

    if (playlist.videos.length === initialLength) {
        throw new ApiError(400, "Video not found in playlist");
    }

    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

// ✅ Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID");

    const deleted = await Playlist.findByIdAndDelete(playlistId);
    if (!deleted) throw new ApiError(404, "Playlist not found");

    res.status(200).json(new ApiResponse(200, deleted, "Playlist deleted successfully"));
});

// ✅ Update a playlist (name, description)
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
