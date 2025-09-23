import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

// this is the standard middleware for handling errors
dotenv.config();
 
connectDB()
  .then(
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server start on port ${process.env.PORT}`);
    })
  )
  .catch((error) => {
    console.log("MONGODB connection error !!!!");
  });
