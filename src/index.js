import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
// this is the standard middleware for CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://wideview.netlify.app",
      // "https://froentend-for-explorer-app.vercel.app"
    ],
    credentials: true,
  })
);

// this is the standard middleware for parsing JSON requests
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello this is the Backend of Explorer APP");
});
//routes  import
import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";
import playListRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import subscribRouter from "./routes/subcription.routes.js";

//routes decleration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/videos", videoRouter); 
app.use("/api/v1/playlist", playListRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/subscribe", subscribRouter);

export default app;
