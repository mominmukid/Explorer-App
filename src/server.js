import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./index.js";

dotenv.config(); 

const PORT = process.env.PORT || 8000;

let isconected = false;
 async function connectMongoDB() {
  try {
    await connectDB();
    isconected = true;
    console.log("✅ MONGODB connected successfully");
  } catch (error) {
    console.error("❌ MONGODB connection error:", error.message);
    isconected = false;
  }
 }
app.use(async (req, res, next) => {
  if (!isconected) {
    await connectMongoDB();
    next();
  }});
  module.exports = app;
// connectDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("❌ MONGODB connection error:", error.message);
//     process.exit(1); // crash the process in production if DB fails
//   });
