import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async (publicId) => {
  try {
    // ✅ Config moved inside
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!publicId) throw new Error("No public_id provided for deletion");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    throw error;
  }
};

const deleteFromCloudinaryVideo = async (publicId) => {
  try {
    // ✅ Config moved inside
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!publicId) throw new Error("No public_id provided for deletion");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
      invalidate: true,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    throw error;
  }
};

export { deleteFromCloudinary, deleteFromCloudinaryVideo };