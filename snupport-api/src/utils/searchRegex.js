// Construction de motifs `$regex` sûrs pour les recherches d'auto-complétion. Isolé dans son propre
// module, sans dépendance lourde (contrairement à utils/index.js), pour être importable par les
// contrôleurs et testable en isolation.
const escapeStringRegexp = require("escape-string-regexp");

// Rend un motif tolérant aux diacritiques (a ≈ á/à/ä/â, etc.). Identique à `diacriticSensitiveRegex`
// de utils/index.js.
function diacriticSensitiveRegex(string = "") {
  return string
    .replace(/a/g, "[a,á,à,ä,â]")
    .replace(/e/g, "[e,é,ë,è]")
    .replace(/i/g, "[i,í,ï,ì]")
    .replace(/o/g, "[o,ó,ö,ò]")
    .replace(/u/g, "[u,ü,ú,ù]");
}

// Motif `$regex` d'auto-complétion sûr à partir d'une saisie utilisateur : la saisie est d'abord
// échappée (escapeStringRegexp) — aucun métacaractère n'est interprété, ce qui neutralise l'injection
// NoSQL et les ReDoS via `$regex` (L51) —, puis rendue tolérante aux diacritiques et ancrée en tête.
// Même traitement que `autocomplete_regex` dans contact.ts et ticket.ts.
function autocompleteRegex(string = "") {
  return `^${diacriticSensitiveRegex(escapeStringRegexp(string))}.*$`;
}

module.exports = { autocompleteRegex, diacriticSensitiveRegex };
