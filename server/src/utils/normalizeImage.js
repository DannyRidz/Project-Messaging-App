import sharp from "sharp";
import { AppError } from "./AppError.js";

export async function normalizeImage(buffer) {
  let data;

  try {
    const image = sharp(buffer, {
      limitInputPixels: 16000000,
      animated: false,
    });

    const metadata = await image.metadata();

    if (
      !["jpeg", "png", "webp"].includes(metadata.format) ||
      (metadata.pages ?? 1) > 1
    ) {
      throw new AppError(415, "Choose a non-animated JPEG, PNG, or WebP image");
    }

    data = await image
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      400,
      "Could not read this image. Use a valid image under 16 million pixels",
    );
  }

  if (data.length > 2 * 1024 * 1024) {
    throw new AppError(
      413,
      "The processed image is too large. Choose a smaller image",
    );
  }

  return {
    mimeType: "image/webp",
    data,
  };
}
