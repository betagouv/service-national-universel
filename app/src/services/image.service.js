import { readAndCompressImage } from "browser-image-resizer";
import { environment } from "../config";

const config = {
  quality: 0.7,
  maxWidth: 800,
  maxHeight: 600,
  debug: environment !== "production" ? true : false,
};

export async function resizeImage(file) {
  let image = file;
  if (image.size > 1000000 && ["image/jpeg", "image/png"].includes(image.type)) {
    image = await readAndCompressImage(file, config);
    image.name = file.name;
  }
  return image;
}
