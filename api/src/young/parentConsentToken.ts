import crypto from "crypto";

/**
 * Jetons de consentement des représentants légaux (`parentXInscription2023Token`).
 *
 * Ces jetons sont la SEULE authentification des routes `/representants-legaux/*` : porteur du jeton =
 * parent. Ils circulent en clair dans l'URL des mails de consentement, donc dans l'historique du
 * navigateur, le `Referer` et les boîtes partagées. Ils doivent donc :
 *   - expirer (`parentXInscription2023TokenExpiresAt`) ;
 *   - être réémis à chaque fois que l'adresse du parent change ou qu'un nouveau lien est envoyé,
 *     de sorte qu'un lien ne reste jamais valide pour une adresse qui n'est plus celle du parent.
 *
 * Les jetons historiques n'ont pas de date d'expiration : ils restent acceptés (cf.
 * `isParentInscriptionTokenExpired`) pour ne pas casser les consentements en cours. Leur fermeture
 * demande une campagne de réémission, hors périmètre de ce correctif.
 */
export const PARENT_INSCRIPTION_TOKEN_TTL_DAYS = 90;

export type ParentId = 1 | 2;

export type ParentInscriptionTokenFields = {
  [key: string]: string | Date;
};

/** Nouveau jeton parent + sa date d'expiration, sous forme de patch à appliquer au volontaire. */
export function issueParentInscriptionToken(parentId: ParentId): ParentInscriptionTokenFields {
  return {
    [`parent${parentId}Inscription2023Token`]: crypto.randomBytes(20).toString("hex"),
    [`parent${parentId}Inscription2023TokenExpiresAt`]: getParentInscriptionTokenExpiration(),
  };
}

export function getParentInscriptionTokenExpiration(from: Date = new Date()): Date {
  return new Date(from.getTime() + PARENT_INSCRIPTION_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Prolonge le jeton existant (ou en émet un s'il n'y en a pas) au moment où un nouveau lien est
 * envoyé au parent : le lien qui part dans le mail doit rester valide le temps du TTL.
 */
export function refreshParentInscriptionToken(young: any, parentId: ParentId): ParentInscriptionTokenFields {
  if (!young[`parent${parentId}Inscription2023Token`]) return issueParentInscriptionToken(parentId);
  return { [`parent${parentId}Inscription2023TokenExpiresAt`]: getParentInscriptionTokenExpiration() };
}

/** `true` si le jeton porte une date d'expiration dépassée. Un jeton sans date est accepté (héritage). */
export function isParentInscriptionTokenExpired(young: any, parentId: ParentId): boolean {
  const expiresAt = young[`parent${parentId}Inscription2023TokenExpiresAt`];
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}
