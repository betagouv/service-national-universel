/**
 * Collecte les chemins S3 des pièces jointes d'un message support.
 *
 * Utilisé par la purge RGPD (suppression de la trace support d'un jeune) : on
 * supprime ces fichiers du bucket AVANT de supprimer le message (sinon on perd
 * les `path` et les binaires — CNI, consentements… — restent orphelins sur S3).
 *
 * Pur / sans I/O → testable unitairement (le risque ici = oublier `files` ou
 * `attachments`, et laisser fuiter des binaires).
 */
function filePathsOf(message) {
  return [...(message.attachments || []), ...(message.files || [])]
    .map((f) => f && f.path)
    .filter(Boolean);
}

module.exports = { filePathsOf };
