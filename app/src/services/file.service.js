import { readAndCompressImage } from "browser-image-resizer";
import heic2any from "heic2any";
import { environment } from "../config";

export async function resizeImage(file, config = {}) {
  if (!["image/jpeg", "image/png"].includes(file.type)) return file;
  const defaultConfig = {
    quality: 0.8,
    maxWidth: 1000,
    maxHeight: 1000,
    mimeType: "image/png",
    debug: environment !== "production" ? true : false,
  };
  config = { ...defaultConfig, ...config };
  let image = file;
  console.log(image.size);
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
  format = format.toUpperCase();
  if (!["JPEG", "PNG"].includes(format)) {
    throw new Error("output format needs to be one of [JPEG, PNG]");
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
