import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const agreementNo = req.body.agreementNo || "unknown";
    const fieldname = file.fieldname;
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `${agreementNo}_${fieldname}_${safeName}`);
  },
});

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

// Export middleware for multiple files
export const uploadAgreementFiles = upload.fields([
  { name: "aadhaar", maxCount: 1 },
  { name: "licenceFront", maxCount: 1 },
  { name: "licenceBack", maxCount: 1 },
]);

export default upload;
