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
  const inputBuffer = await getFileBuffer(file);
  const outputBuffer = await convert({
    buffer: inputBuffer,
    format,
  });
  return outputBuffer;
}

function getFileBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target.result);
    };
    reader.readAsArrayBuffer(file);
  });
}
