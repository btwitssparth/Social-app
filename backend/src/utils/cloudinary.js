import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// Load .env variables (make sure .env is in your project root)
dotenv.config();

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("✅ Cloudinary configured:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

// Upload file to Cloudinary and then remove it locally
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // auto-detect image/video/other
    });

    // Delete the file only if it still exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result;
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err);

    // Clean up only if the file exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };