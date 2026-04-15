import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export function isAllowedBillMimeType(mimeType: string) {
  return allowedMimeTypes.includes(mimeType);
}

function sanitizeFilename(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${sanitizeFilename(base)}${ext}`);
  },
});

export const billUpload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedBillMimeType(file.mimetype)) {
      cb(new AppError("Invalid file type. Only PDF/JPG/JPEG/PNG are allowed.", 400));
      return;
    }
    cb(null, true);
  },
});

export function removeUploadedFile(filePath?: string | null) {
  if (!filePath) {
    return;
  }

  const absolutePath = path.resolve(process.cwd(), filePath.replace(/^\/+/, ""));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}
