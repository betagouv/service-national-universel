// Extensions imposées par type MIME au téléchargement : la première est celle ajoutée, les autres
// sont des variantes acceptées si le nom d'origine les porte déjà.
const DOWNLOAD_EXTENSIONS_BY_MIME_TYPE: Record<string, string[]> = {
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

// Rognage linéaire des séparateurs en tête et en fin : `/[\s_-]+$/` est polynomial sur une longue
// suite de séparateurs suivie d'un autre caractère (nom de fichier contrôlé par le déposant).
const isNameSeparator = (char: string) => char === "_" || char === "-" || /\s/.test(char);
function trimNameSeparators(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && isNameSeparator(value[start])) start++;
  while (end > start && isNameSeparator(value[end - 1])) end--;
  return value.slice(start, end);
}

const MAX_DOWNLOAD_BASE_NAME_LENGTH = 150;

/**
 * Nom de fichier proposé au navigateur pour un contenu de type `mimeType`.
 *
 * Le nom d'origine vient du déposant : sans contrôle, un polyglotte `%PDF` (accepté comme PDF)
 * nommé `piece.hta` ou `piece.html` s'enregistrait avec cette extension et s'exécutait à
 * l'ouverture. On garde la base assainie et on impose l'extension du type détecté ; si le type est
 * inconnu ou générique (`image/*`, vide), seule une extension de la liste sûre est conservée, sinon
 * `.bin`.
 */
export function getSafeDownloadFileName(fileName?: string | null, mimeType?: string | null, fallbackBaseName = "document"): string {
  const rawName = String(fileName ?? "")
    .split(/[\\/]/)
    .pop()!
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  const lastDot = rawName.lastIndexOf(".");
  const currentExtension = lastDot > 0 ? rawName.slice(lastDot + 1).toLowerCase() : "";
  const rawBase = lastDot > 0 ? rawName.slice(0, lastDot) : rawName;

  const baseName = trimNameSeparators(rawBase.replace(/[<>:"|?*.]/g, "_").replace(/\s+/g, " ")).slice(0, MAX_DOWNLOAD_BASE_NAME_LENGTH) || fallbackBaseName;

  const normalizedMimeType = String(mimeType ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const extensionsForMimeType = DOWNLOAD_EXTENSIONS_BY_MIME_TYPE[normalizedMimeType];
  let extension: string;
  if (extensionsForMimeType) {
    extension = extensionsForMimeType.includes(currentExtension) ? currentExtension : extensionsForMimeType[0];
  } else {
    extension = SAFE_DOWNLOAD_EXTENSIONS.has(currentExtension) ? currentExtension : "bin";
  }
  return `${baseName}.${extension}`;
}

/**
 * Type MIME déduit des premiers octets, pour les fichiers dont le serveur ne renvoie pas le type
 * (pièces jointes du support servies en `image/*`). `undefined` si la signature est inconnue.
 */
export function detectMimeTypeFromBytes(bytes?: ArrayLike<number> | null): string | undefined {
  if (!bytes || bytes.length < 4) return undefined;
  const startsWith = (signature: number[], offset = 0) => signature.every((byte, index) => bytes[offset + index] === byte);
  if (startsWith([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf"; // %PDF-
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return "image/gif"; // GIF8
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp"; // RIFF....WEBP
  return undefined;
}

/**
 * SheetJS interprète certaines valeurs au lieu de les écrire : un tableau `[valeur, formule]` passé à
 * `aoa_to_sheet` devient une vraie formule, et un objet passé à `json_to_sheet` est recopié tel quel
 * comme cellule (`{ f: "..." }` compris). Une donnée saisie par un tiers (ex. `department` d'un
 * référent) produisait ainsi une formule dans l'export. Toute cellule est ramenée à un scalaire.
 */
export function toSheetCellValue(value: unknown): string | number | boolean | Date | null | undefined {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => (item !== null && typeof item === "object" ? JSON.stringify(item) : String(item ?? ""))).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

export function download(file, fileName) {
  // L'extension suit le type du contenu, jamais le seul nom fourni par le déposant.
  const safeFileName = getSafeDownloadFileName(fileName, file?.type);
  // @ts-expect-error msSaveOrOpenBlob exists
  if (window.navigator.msSaveOrOpenBlob) {
    // IE11 & Edge
    // @ts-expect-error msSaveOrOpenBlob exists
    window.navigator.msSaveOrOpenBlob(file, safeFileName);
  } else {
    //Other browsers
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = URL.createObjectURL(file);
    a.download = safeFileName;
    a.click();
  }
}

export const cleanFileNamePath = (path?: string) => {
  if (!path) return "";
  const cleanPath = path
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") //remove accents
    .replaceAll(" ", "_") // remove spaces
    .replace(/[^/a-zA-Z0-9._-]/g, ""); // remove special characters
  return cleanPath.length > 1024 ? cleanPath.slice(0, 1024) : cleanPath;
};

/**
 * Creates Formdata for file upload and sanitize file names to get past firewall strict validation rules e.g apostrophe
 * @param [File]
 * @returns FormData
 **/
export function createFormDataForFileUpload(arr: any[], properties) {
  let files: any[] = [];
  if (Array.isArray(arr)) files = arr.filter((e) => typeof e === "object");
  else files = [arr];
  const formData = new FormData();

  // File object name property is read-only, so we need to change it with Object.defineProperty
  for (const file of files) {
    // eslint-disable-next-line no-control-regex
    const name = encodeURIComponent(file.name.replace(/['/:*?"<>|\x00-\x1F\x80-\x9F]/g, "_").trim());
    try {
      Object.defineProperty(file, "name", { value: name, configurable: true });
    } catch (e) {
      console.log(e);
    }
    // We add each file under a different key in order to not squash them
    formData.append(file.name, file, name);
  }

  const names = files.map((e) => e.name || e);
  const allData = { names, ...(properties || {}) };
  formData.append("body", JSON.stringify(allData));
  return formData;
}
