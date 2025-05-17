import mongoose from "mongoose"
import { Tweet } from "../models/tweets.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import  ApiResponse  from "../utils/ApiResponse.js"
import  asyncHandler from "../utils/asyncHandler.js"

// 1. Create Tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    const newTweet = await Tweet.create({
        owner: req.user._id,
        content
    });

    res.status(201).json(new ApiResponse(201, newTweet, "Tweet created successfully"));
});

// 2. Get all Tweets by Logged-in User
const getUserTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.find({ owner: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, tweets, "Fetched user's tweets"));
});

// 3. Update Tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Updated tweet content is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (!tweet.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = content;
    await tweet.save();

    res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

// 4. Delete Tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (!tweet.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await tweet.deleteOne();

    res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
