import { readAndCompressImage } from "browser-image-resizer";
import { environment } from "../config";

export async function resizeImage(file, config = {}) {
  const defaultConfig = {
    quality: 0.8,
    maxWidth: 1000,
    maxHeight: 1000,
    debug: environment !== "production" ? true : false,
  };
  config = { ...defaultConfig, ...config };

  let image = file;

  if (image.size > 1000000 && ["image/jpeg", "image/png"].includes(image.type)) {
    image = await readAndCompressImage(file, config);
    image.name = file.name;
  }

  if (image.size > 1000000) {
    image = await resizeImage(image);
  }

  return image;
}
