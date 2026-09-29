import multer from "multer";
import { AppError } from "../utils/AppError.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const receiveImage = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 1,
    fieldSize: 16000,
    parts: 3,
  },

  fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new AppError(415, "Choose a JPEG, PNG, or WebP image"));
    }

    callback(null, true);
  },
}).single("image");

export function uploadImage(req, res, next) {
  receiveImage(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof AppError) {
      return next(error);
    }

    if (error instanceof multer.MulterError) {
      return next(
        new AppError(
          error.code === "LIMIT_FILE_SIZE" ? 413 : 400,
          error.code === "LIMIT_FILE_SIZE"
            ? "Image must be no larger than 5 MiB"
            : "Invalid image upload",
        ),
      );
    }

    next(new AppError(400, "Invalid image upload"));
  });
}
