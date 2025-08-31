import { v2 as cloudinary } from "cloudinary";

// 🔹 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public_id (e.g., "avatars/xyz123")
 * @returns {Promise<object>} - { result: "ok" } if deleted successfully
 */
 const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new Error("No public_id provided for deletion");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", // force image delete
      invalidate: true,       // clear CDN cache
    });

    return result; // { result: "ok" } means success
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    throw error;
  }
};

 const deleteFromCloudinaryVideo = async (publicId) => {
  try {
    if (!publicId) throw new Error("No public_id provided for deletion");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video", // force image delete
      invalidate: true,       // clear CDN cache
    });

    return result; // { result: "ok" } means success
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    throw error;
  }
};

export{deleteFromCloudinary,deleteFromCloudinaryVideo}
