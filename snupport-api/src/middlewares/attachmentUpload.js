const fileUpload = require("express-fileupload");

// Le parseur multipart n'est monté que sur les routes qui reçoivent des fichiers (L50) : monté
// globalement, il acceptait des fichiers sur toutes les routes, sans limite de nombre.
const MAX_ATTACHMENTS_PER_MESSAGE = 10;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 Mo

// busboy ignore en silence les fichiers au-delà de `files` : on en laisse passer un de plus pour que la
// route refuse explicitement la requête au lieu d'envoyer un email amputé d'une pièce jointe.
const attachmentUpload = fileUpload({
  limits: { fileSize: MAX_ATTACHMENT_SIZE, files: MAX_ATTACHMENTS_PER_MESSAGE + 1 },
  abortOnLimit: true,
  responseOnLimit: JSON.stringify({ ok: false, code: "FILE_TOO_LARGE" }),
});

const pictureUpload = fileUpload({
  limits: { fileSize: MAX_ATTACHMENT_SIZE, files: 1 },
  abortOnLimit: true,
  responseOnLimit: JSON.stringify({ ok: false, code: "FILE_TOO_LARGE" }),
});

module.exports = { attachmentUpload, pictureUpload, MAX_ATTACHMENTS_PER_MESSAGE, MAX_ATTACHMENT_SIZE };
