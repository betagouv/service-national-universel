import { readAndCompressImage } from "browser-image-resizer";
import { apiv2URL, environment } from "../config";
import { download } from "snu-lib";
import { apiv2 } from "./apiv2";

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

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

export const downloadSecuredFile = async (url: string, { fileName }: { fileName?: string } = {}) => {
  const link = getSecuredFileUrl(url);
  const downloadFileName = fileName || url.replace(/^.*[\\/]/, "");
  const result = await apiv2.get<any>(link);
  const blob = new Blob([new Uint8Array(result.data.data)], { type: result.headers["content-type"] });
  download(blob, downloadFileName);
};

export const downloadFileFrombase64 = (base64: string, fileName: string, mimeType: string) => {
  const binaryData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([binaryData], { type: mimeType });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const getSecuredFileUrl = (key) => `${apiv2URL}/file?key=${encodeURIComponent(key)}`;
