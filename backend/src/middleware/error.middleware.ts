import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // A streaming (SSE) response has already sent its headers; we can no
  // longer switch to a JSON error, so log it and close the stream.
  if (res.headersSent) {
    console.error("Error after response started:", err);
    return res.end();
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  // multer upload errors (file too large, too many files, ...)
  if (err?.name === "MulterError") {
    return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "That file is too large. Please upload a smaller PDF."
          : err.message,
    });
  }

  // Mongoose duplicate key error (e.g. email already registered)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || { field: 1 })[0];
    return res.status(409).json({
      success: false,
      message: `${field} is already in use`,
    });
  }

  // Mongoose validation error
  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e: any) => e.message)
        .join(", "),
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
}
