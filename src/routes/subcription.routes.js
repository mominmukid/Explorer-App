import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/subscribed/:channelId").post(toggleSubscription);
router.route("/usersubscribechannel/:subscriberId").get(getSubscribedChannels);
router.route("/usersubscribers/:channelId").get(getUserChannelSubscribers);

export default router;
