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

module.exports = {
  getS3Path,
};
