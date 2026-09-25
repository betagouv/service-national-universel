const { v4: uuid } = require("uuid");

const getExtension = (fileName) => {
  return fileName.substring(fileName.lastIndexOf(".") + 1);
};

// Extension de l'objet stocké, tirée du type détecté par magic numbers quand l'appelant le connaît :
// le nom de fichier est fourni par le client ou l'expéditeur du mail (L50).
const EXTENSIONS_BY_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/vnd.oasis.opendocument.spreadsheet": "ods",
  "application/vnd.oasis.opendocument.presentation": "odp",
};

const getS3Path = (fileName, mime) => {
  const extension = (mime && EXTENSIONS_BY_MIME[mime]) || getExtension(fileName).replace(/[^0-9a-zA-Z]/g, "") || "bin";
  return `message/${uuid()}.${extension}`;
};

// Rognage linéaire des séparateurs en tête et en fin : `/[\s_-]+$/` est polynomial sur une longue
// suite de séparateurs suivie d'un autre caractère (nom de fichier contrôlé par le déposant).
const isNameSeparator = (char) => char === "_" || char === "-" || /\s/.test(char);
function trimNameSeparators(value) {
  let start = 0;
  let end = value.length;
  while (start < end && isNameSeparator(value[start])) start++;
  while (end > start && isNameSeparator(value[end - 1])) end--;
  return value.slice(start, end);
}

const MAX_ATTACHMENT_BASE_NAME_LENGTH = 150;

// Nom affiché et proposé au téléchargement : la base vient de l'expéditeur, l'extension du type
// détecté. Sans cela, un polyglotte accepté comme PDF et nommé `piece.hta` s'enregistrait avec
// cette extension chez l'agent (constat FL6).
const getAttachmentFileName = (fileName, mime) => {
  const rawName = String(fileName ?? "")
    .split(/[\\/]/)
    .pop()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  const lastDot = rawName.lastIndexOf(".");
  const rawBase = lastDot > 0 ? rawName.slice(0, lastDot) : rawName;
  const baseName = trimNameSeparators(rawBase.replace(/[<>:"|?*.]/g, "_").replace(/\s+/g, " ")).slice(0, MAX_ATTACHMENT_BASE_NAME_LENGTH) || "piece-jointe";
  const extension = (mime && EXTENSIONS_BY_MIME[mime]) || "bin";
  return `${baseName}.${extension}`;
};

module.exports = {
  getS3Path,
  getAttachmentFileName,
};
