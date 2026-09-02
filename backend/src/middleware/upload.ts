import multer from "multer";
import cloudinary from "../config/cloudinary";

// Use memory storage so we can upload buffers to Cloudinary
const storage = multer.memoryStorage();

// File filter - allow images and PDFs
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed"));
  }
};

// Configure upload with 10MB limit per file
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Helper: upload a buffer to Cloudinary
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string,
  folder: string = "kota-carz/agreements"
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
}

// Export middleware for multiple files
export const uploadAgreementFiles = upload.fields([
  { name: "aadhaar", maxCount: 1 },
  { name: "licenceFront", maxCount: 1 },
  { name: "licenceBack", maxCount: 1 },
]);

export default upload;
