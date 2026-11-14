import multer from "multer";
import path from "path";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError";

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 10);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    // Random server-side name: never trust or reuse the client's filename
    // on disk (the original name is kept separately as chunk metadata).
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.pdf`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter: (_, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf";

    if (!isPdf) {
      return cb(new ApiError(400, "Only PDF files are supported"));
    }

    cb(null, true);
  },
});
