/**
 * Champs des référents CLE (référent de classe, chef d'établissement, coordinateur) exposés au front.
 *
 * Projection explicite : un document référent brut contient `invitationToken`,
 * `forgotPasswordResetToken` et `token2FA`, c'est-à-dire de quoi prendre le contrôle du compte, et
 * seul `password` est `select: false` dans le schéma. Toute sortie de référent du dossier CLE passe
 * par cette projection — pas par une liste de suppressions, qui laisse passer chaque champ ajouté
 * plus tard au schéma.
 *
 * `subRole` distingue chef d'établissement et coordinateur : le front s'en sert
 * (`isChefEtablissement` / `isCoordinateurEtablissement`) pour trier les destinataires.
 */
export const REFERENT_CLE_PUBLIC_FIELDS = "_id firstName lastName email phone role subRole status";
