const FileType = require("file-type");
const { hasAsfSignature } = require("snu-lib");

// Types réellement attendus dans un ticket support : justificatifs, captures d'écran,
// documents bureautiques. La liste est close et ne contient aucun format exécutable, ni
// aucun format que le navigateur rend au lieu de télécharger (HTML, SVG).
//
// Les formats OLE historiques (.doc, .xls) en sont volontairement absents : les magic
// numbers ne les distinguent pas d'un .msi (tous sont `application/x-cfb`), donc les
// accepter rouvrirait la porte aux exécutables.
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
];

// Le Content-Type et le nom de fichier d'un mail entrant sont choisis par l'expéditeur.
// L'ancien filtre les croyait sur parole : `contentType.includes("image")` acceptait
// image/svg+xml, et `filename.includes("doc")` acceptait « facture.doc.exe ». On ne décide
// donc que sur les magic numbers du contenu, et l'appelant stocke le type détecté plutôt
// que le type annoncé.
//
// Un contenu non identifiable renvoie `mime: null` et est refusé : c'est le cas de tous les
// formats texte (HTML, SVG, CSV…), qui n'ont pas de magic number et sont précisément ceux
// qu'un navigateur exécuterait.
async function inspectAttachment(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return { mime: null, accepted: false };
  // PH24 : un ASF_Header_Object dont le champ de taille est forgé fait boucler indéfiniment
  // FileType.fromBuffer (strtok3, file-type 16.5.4) — un timeout applicatif ne rendrait pas la
  // main. Aucun format ASF n'est de toute façon accepté ici : on le refuse par sa signature
  // avant tout appel à FileType.
  if (hasAsfSignature(buffer)) return { mime: null, accepted: false };
  const detected = await FileType.fromBuffer(buffer);
  const mime = detected?.mime ?? null;
  return { mime, accepted: mime !== null && ALLOWED_MIME_TYPES.includes(mime) };
}

module.exports = { inspectAttachment, ALLOWED_MIME_TYPES };
