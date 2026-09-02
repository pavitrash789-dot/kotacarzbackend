import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from the CLOUDINARY_URL environment variable
cloudinary.config({
  secure: true,
});

export default cloudinary;
