import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscriptions.model.js";
import { ApiError } from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import asyncHandler  from "../utils/asyncHandler.js";

// 🔄 Toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const channelUser = await User.findById(channelId);
    if (!channelUser) {
        throw new ApiError(404, "Channel user not found");
    }

    const existingSub = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId
    });

    let message;
    if (existingSub) {
        await existingSub.deleteOne();
        message = "Unsubscribed successfully";
    } else {
        await Subscription.create({
            channel: channelId,
            subscriber: subscriberId
        });
        message = "Subscribed successfully";
    }

    return res.status(200).json(new ApiResponse(200, null, message));
});


// 👥 Get subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username email avatar");

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscriber list fetched successfully")
    );
});


// 📺 Get channels user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscribedChannels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username email avatar");

    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
