import { readAndCompressImage } from "browser-image-resizer";
import convert from "heic-convert/browser";
import { environment } from "../config";

export async function resizeImage(file, config = {}) {
  if (!["image/jpeg", "image/png"].includes(file.type)) return file;

  const defaultConfig = {
    quality: 0.8,
    maxWidth: 1000,
    maxHeight: 1000,
    debug: environment !== "production" ? true : false,
  };
  config = { ...defaultConfig, ...config };

  let image = file;

  if (image.size > 1000000) {
    image = await readAndCompressImage(file, config);
    image.name = file.name;
  }

  if (image.size > 1000000) {
    image = await resizeImage(image);
  }

  return image;
}

export async function convertImage(file, format = "PNG") {
  const blob = new Blob([file], { type: "image/heif" });
  console.log("🚀 ~ file: file.service.js:32 ~ convertImage ~ blob:", blob)
  const buffer = await blob.arrayBuffer();
  console.log("🚀 ~ file: file.service.js:34 ~ convertImage ~ buffer:", buffer)
  const outputBuffer = await convert({ buffer: blob, format });
  console.log("🚀 ~ file: file.service.js:36 ~ convertImage ~ outputBuffer:", outputBuffer)
  const blob2 = new Blob([outputBuffer], { type: `image/${format.toLowerCase()}` });
  const image = new File([blob2], `${file.name}.${format.toLowerCase()}`, { type: blob.type });
  return image;
}
