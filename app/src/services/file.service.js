//
import { readAndCompressImage } from "browser-image-resizer";
import heic2any from "heic2any";
import { environment } from "../config";

export async function resizeImage(file, config = {}) {
  if (!["image/jpeg", "image/png"].includes(file.type)) return file;

  let quality = 0.8;
  let maxWidth = 1000;
  let maxHeight = 1000;

  const defaultConfig = {
    mimeType: "image/png",
    debug: environment !== "production" ? true : false,
  };
  config = { ...defaultConfig, ...config };

  let image = file;
  console.log("Original size:", image.size);

  while (image.size > 100000 && quality > 0) {
    try {
      config = {
        ...config,
        quality,
        maxWidth,
        maxHeight,
      };
      image = await readAndCompressImage(file, config);
      console.log(`Compressed size at quality ${quality}:`, image.size);
      quality -= 0.1;
      maxWidth -= 100;
      maxHeight -= 100;
    } catch (error) {
      console.error("Error during compression:", error);
      throw new Error("Failed to compress image");
    }

    if (image.size <= 100000) break;
  }

  if (image.size > 100000) {
    console.warn("Image size is still larger than 100KB after maximum compression attempts.");
  }

  image.name = file.name;
  return image;
}

export async function convertImage(file, format = "PNG") {
  format = format.toUpperCase();
  if (!["JPEG", "PNG"].includes(format)) {
    throw new Error("Output format needs to be one of [JPEG, PNG]");
  }

  if (["image/heif", "image/heic"].includes(file.type)) {
    try {
      console.log("Starting conversion of HEIC to PNG");
      const arrayBuffer = await file.arrayBuffer();
      console.log("ArrayBuffer obtained:", arrayBuffer);

      const outputBlob = await heic2any({
        blob: new Blob([arrayBuffer], { type: file.type }),
        toType: `image/${format.toLowerCase()}`,
      });
      console.log("Conversion successful:", outputBlob);

      const image = new File([outputBlob], `${file.name.split(".")[0]}.${format.toLowerCase()}`, { type: outputBlob.type });
      return image;
    } catch (error) {
      console.error("Error converting HEIC to PNG:", error);
      throw new Error("Failed to convert HEIC to PNG");
    }
  }

  return file;
}
