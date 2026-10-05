import Joi from "joi";

/**
 * Un chemin d'objet (S3) est assemblé à partir de segments fournis par la requête : une clé de pièce,
 * un nom de fichier. Chacun doit désigner UN niveau de l'arborescence.
 *
 * Express décode `%2F` en `/` dans `req.params` : `Joi.string()` seul laisse donc passer une valeur
 * qui désigne un sous-arbre (ou qui en remonte), et les contrôles par clé qui suivent comparent
 * alors une chaîne qu'ils ne reconnaissent pas. La validation doit porter sur la valeur décodée,
 * avant tout accès au volontaire et avant le contrôle de périmètre.
 *
 * Sont refusés : la chaîne vide, les segments `.` et `..`, tout `/` ou `\`, et tout caractère de
 * contrôle (C0, DEL, C1, donc l'octet nul). Une suite de points à l'intérieur d'un nom (`a..b.pdf`)
 * reste valide : seuls les segments `.` et `..` ont un sens pour le stockage.
 */
export function isSafePathSegment(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value === "." || value === "..") return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const isSeparator = code === 0x2f || code === 0x5c;
    const isControl = code <= 0x1f || (code >= 0x7f && code <= 0x9f);
    if (isSeparator || isControl) return false;
  }
  return true;
}

/** Schéma Joi d'un segment de chemin sûr, à utiliser à la place de `Joi.string()` pour une clé ou un nom de fichier. */
export function safePathSegment(): Joi.StringSchema {
  return Joi.string().custom((value, helpers) => (isSafePathSegment(value) ? value : helpers.error("any.invalid")));
}
