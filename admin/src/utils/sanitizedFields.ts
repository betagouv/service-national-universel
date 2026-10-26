import { toastr } from "react-redux-toastr";

/**
 * Champs que l'API assainit à l'écriture (`sanitizeStoredHtml`, api/src/utils/validator.ts). Une saisie
 * qui contient une balise non autorisée en sort modifiée : la balise est retirée et les « & » deviennent
 * des entités (GOO-44).
 */
export const MISSION_HTML_FIELDS = {
  description: "Objectifs de la mission",
  actions: "Actions concrètes",
  justifications: "Justifications",
  contraintes: "Contraintes",
  frequence: "Fréquence estimée",
};

export const STRUCTURE_HTML_FIELDS = {
  description: "Présentation de la structure",
};

/**
 * Prévient l'utilisateur quand l'API a retiré du balisage d'un champ, plutôt que de le laisser
 * découvrir après coup qu'une partie de sa saisie a disparu.
 */
export const warnIfHtmlSanitized = (sent: Record<string, unknown>, stored: Record<string, unknown> | undefined, fields: Record<string, string>) => {
  if (!stored) return;
  const altered = Object.entries(fields)
    .filter(([field]) => typeof sent[field] === "string" && sent[field] !== (stored[field] ?? ""))
    .map(([, label]) => label);
  if (!altered.length) return;
  toastr.warning(
    "Une partie du texte a été retirée",
    `Les balises HTML non autorisées (texte entre chevrons « < … > ») ont été supprimées : ${altered.join(", ")}. Vérifiez le contenu enregistré.`,
    { timeOut: 15000 },
  );
};
