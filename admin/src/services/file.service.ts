import { readAndCompressImage } from "browser-image-resizer";
import { apiv2URL, environment } from "../config";
import { download } from "snu-lib";
import { apiv2 } from "./apiv2";

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

export const downloadSecuredFile = async (url) => {
  const link = getSecuredFileUrl(url);
  const fileName = url.replace(/^.*[\\/]/, "");
  const result = await apiv2.get<any>(link);
  const blob = new Blob([new Uint8Array(result.data.data)], { type: result.headers["content-type"] });
  download(blob, fileName);
};

export const getSecuredFileUrl = (key) => `${apiv2URL}/file?key=${encodeURIComponent(key)}`;
