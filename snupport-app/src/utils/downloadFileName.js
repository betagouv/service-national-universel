// Copie locale de `getSafeDownloadFileName` / `detectMimeTypeFromBytes` (snu-lib), que snupport-app
// n'importe pas. À remplacer par le socle partagé de GOO-19.

// Extensions imposées par type MIME : la première est celle ajoutée, les autres sont des variantes
// acceptées si le nom d'origine les porte déjà.
const DOWNLOAD_EXTENSIONS_BY_MIME_TYPE = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "text/csv": ["csv"],
  "text/plain": ["txt"],
  "application/zip": ["zip"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "application/vnd.ms-excel": ["xls"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "application/msword": ["doc"],
  "application/vnd.oasis.opendocument.text": ["odt"],
  "application/vnd.oasis.opendocument.spreadsheet": ["ods"],
  "application/octet-stream": ["bin"],
};

const SAFE_DOWNLOAD_EXTENSIONS = new Set(Object.values(DOWNLOAD_EXTENSIONS_BY_MIME_TYPE).flat());

const MAX_DOWNLOAD_BASE_NAME_LENGTH = 150;

/**
 * Nom de fichier proposé au navigateur : le nom d'origine vient de l'expéditeur, et une pièce jointe
 * `piece.hta` ou `piece.html` s'enregistrait avec cette extension. L'extension suit le type du
 * contenu ; si le type est inconnu, seule une extension de la liste sûre est conservée, sinon `.bin`.
 */
export function getSafeDownloadFileName(fileName, mimeType, fallbackBaseName = "document") {
  const rawName = String(fileName ?? "")
    .split(/[\\/]/)
    .pop()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  const lastDot = rawName.lastIndexOf(".");
  const currentExtension = lastDot > 0 ? rawName.slice(lastDot + 1).toLowerCase() : "";
  const rawBase = lastDot > 0 ? rawName.slice(0, lastDot) : rawName;

  const baseName =
    rawBase
      .replace(/[<>:"|?*.]/g, "_")
      .replace(/\s+/g, " ")
      .replace(/^[\s_-]+|[\s_-]+$/g, "")
      .slice(0, MAX_DOWNLOAD_BASE_NAME_LENGTH) || fallbackBaseName;

  const normalizedMimeType = String(mimeType ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const extensionsForMimeType = DOWNLOAD_EXTENSIONS_BY_MIME_TYPE[normalizedMimeType];
  let extension;
  if (extensionsForMimeType) {
    extension = extensionsForMimeType.includes(currentExtension) ? currentExtension : extensionsForMimeType[0];
  } else {
    extension = SAFE_DOWNLOAD_EXTENSIONS.has(currentExtension) ? currentExtension : "bin";
  }
  return `${baseName}.${extension}`;
}

/** Type MIME déduit des premiers octets ; `undefined` si la signature est inconnue. */
export function detectMimeTypeFromBytes(bytes) {
  if (!bytes || bytes.length < 4) return undefined;
  const startsWith = (signature, offset = 0) => signature.every((byte, index) => bytes[offset + index] === byte);
  if (startsWith([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf"; // %PDF-
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return "image/gif"; // GIF8
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp"; // RIFF....WEBP
  return undefined;
}
