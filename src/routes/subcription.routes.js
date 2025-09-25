import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscribers, getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();
// router.use();

router.route("/subscribed/:channelId").post(verifyJWT ,toggleSubscription);
router.route("/usersubscribechannel/:subscriberId").get(getSubscribedChannels);
router.route("/usersubscribers/:channelId").get(getUserChannelSubscribers);
router.route("/channelsubscribers/:channelId").get(getChannelSubscribers);

export default router;
