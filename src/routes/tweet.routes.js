const router=Router();
import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { createTweet,deleteTweet,getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

router.use(verifyJWT);
router.route("/").post(createTweet)
router.route("/getuser-tweet").get(getUserTweets)
router.route("/update-tweet/:tweetId").post(updateTweet)
router.route("/delete/:tweetId").delete(deleteTweet)

export default router