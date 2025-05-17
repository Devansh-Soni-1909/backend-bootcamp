import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// ✅ Toggle subscription (subscriber = logged-in user, channelId = whom they want to subscribe)
router
    .route("/toggle/:channelId")
    .post(toggleSubscription);

// ✅ Get list of subscribers for a given channel
router
    .route("/subscribers/:channelId")
    .get(getUserChannelSubscribers);

// ✅ Get list of channels the user has subscribed to
router
    .route("/subscriptions/:subscriberId")
    .get(getSubscribedChannels);


export default router;