const { hasAsfSignature } = require("snu-lib");

// file-type ≥ 17 est ESM-only et ce service est en CommonJS : seul un import() dynamique le charge.
// On ne descend pas sous 21.3.1, qui borne l'analyse d'un en-tête ASF forgé (GHSA-5v7r-6r5c-r473) :
// la 16.5.4, dernière version CommonJS, boucle sans fin dessus — y compris derrière un tag ID3.
const loadFileType = () => import("file-type");

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
  // PH24 : aucun format ASF n'est accepté ici, on le refuse par sa signature sans même lancer la
  // détection. Ce n'est qu'une défense en profondeur : elle n'écarte que la forme directe, et la
  // protection réelle contre le gel de la détection est la version de file-type (voir plus haut).
  if (hasAsfSignature(buffer)) return { mime: null, accepted: false };
  const { fileTypeFromBuffer } = await loadFileType();
  const detected = await fileTypeFromBuffer(buffer);
  const mime = detected?.mime ?? null;
  return { mime, accepted: mime !== null && ALLOWED_MIME_TYPES.includes(mime) };
}

module.exports = { inspectAttachment, ALLOWED_MIME_TYPES };
