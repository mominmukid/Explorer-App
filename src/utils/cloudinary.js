import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filepath) => {
  try {
    // ✅ Configure INSIDE the function so env vars are already loaded
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!filepath) return null;

    const result = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });

    // ✅ Safe delete after success
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    return result;

  } catch (error) {
    // ✅ Safe delete on failure
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary };