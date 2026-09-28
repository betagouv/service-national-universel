/**
 * Compteurs de tentatives atomiques (lot C de l'audit du 21/09/2026).
 *
 * Le motif « lire le compteur, l'incrémenter en mémoire, sauver le document »
 * est vulnérable au TOCTOU : N requêtes concurrentes lisent toutes la même
 * valeur et la dernière écriture écrase les autres. Le plafond annoncé
 * (5 mots de passe, 3 codes 2FA, 3 codes de validation d'email) devient alors
 * un plafond par *vague* de requêtes, pas par tentative.
 *
 * Chaque fonction ci-dessous consomme la tentative en un seul `findOneAndUpdate`
 * conditionnel : MongoDB sérialise les écritures sur un même document, donc N
 * requêtes concurrentes obtiennent N valeurs distinctes et le plafond tient.
 *
 * Pour la connexion, la tentative est consommée AVANT la comparaison bcrypt :
 * sans cela, N requêtes concurrentes franchiraient toutes le contrôle de
 * plafond pendant les ~100 ms du hachage.
 *
 * Les champs touchés (`loginAttempts`, `nextLoginAttemptIn`, `attempts2FA`,
 * `attemptsEmailValidation`) sont exclus de l'historique de patch, un
 * `findOneAndUpdate` ne perd donc aucune traçabilité.
 */
import { Model } from "mongoose";
import bcrypt from "bcryptjs";

/** Au-delà de ce nombre d'échecs, chaque tentative est différée. */
export const MAX_LOGIN_ATTEMPTS_BEFORE_DELAY = 5;
/** Au-delà de ce nombre d'échecs, le compte est bloqué pour LOGIN_BLOCK_MS. */
export const MAX_LOGIN_ATTEMPTS_BEFORE_BLOCK = 12;
/** Délai imposé entre deux tentatives une fois MAX_LOGIN_ATTEMPTS_BEFORE_DELAY franchi. */
export const LOGIN_ATTEMPT_DELAY_MS = 60 * 1000;
/** Durée du blocage une fois MAX_LOGIN_ATTEMPTS_BEFORE_BLOCK franchi. */
export const LOGIN_BLOCK_MS = 60 * 60 * 1000;
/**
 * Fenêtre glissante : passé ce délai sans nouvelle tentative, le compteur
 * repart de zéro. C'est ce qui remplace la remise à zéro quotidienne par cron
 * (L27) — l'expiration est portée par chaque compte, pas par une horloge
 * commune que l'attaquant peut attendre.
 */
export const LOGIN_ATTEMPTS_WINDOW_MS = 2 * 60 * 60 * 1000;

export const MAX_2FA_ATTEMPTS = 3;
export const MAX_EMAIL_VALIDATION_ATTEMPTS = 3;

export type ConsumedLoginAttempt = {
  /** Valeur du compteur APRÈS incrément — c'est elle qui fait foi. */
  loginAttempts: number;
  nextLoginAttemptIn: Date;
  /**
   * Verrou dur : le plafond haut est franchi, la tentative est refusée sans
   * même comparer le mot de passe. C'est ce qui borne le nombre de hachages
   * bcrypt qu'une rafale concurrente peut déclencher.
   */
  blocked: boolean;
  /**
   * Un délai vient d'être posé pour la tentative SUIVANTE. La tentative en
   * cours reste évaluée : un utilisateur qui finit par taper le bon mot de
   * passe à son 6e essai se connecte, comme avant le correctif.
   */
  delayed: boolean;
};

/**
 * Vrai si le compte est sous le coup d'un délai ou d'un blocage encore actif.
 * Contrôle de pré-filtrage, fait sur le document déjà lu : il évite qu'un
 * attaquant qui persiste ne repousse indéfiniment sa propre date de déblocage.
 * La garantie de plafond, elle, vient de `consumeLoginAttempt`.
 */
export function isLoginLocked(user: { nextLoginAttemptIn?: Date | null }, now: Date = new Date()): boolean {
  return Boolean(user.nextLoginAttemptIn && user.nextLoginAttemptIn > now);
}

/**
 * Consomme une tentative de connexion, avant toute comparaison de mot de passe.
 * L'incrément, la remise à zéro de fenêtre et le calcul du prochain créneau
 * autorisé sont faits dans un unique update à pipeline, donc atomiques
 * vis-à-vis des autres requêtes portant sur le même document.
 */
export async function consumeLoginAttempt(model: Model<any>, userId: any, now: Date = new Date()): Promise<ConsumedLoginAttempt> {
  const windowStart = new Date(now.getTime() - LOGIN_ATTEMPTS_WINDOW_MS);
  const delayedUntil = new Date(now.getTime() + LOGIN_ATTEMPT_DELAY_MS);
  const blockedUntil = new Date(now.getTime() + LOGIN_BLOCK_MS);

  const updated = await model.findOneAndUpdate(
    { _id: userId },
    [
      {
        $set: {
          loginAttempts: {
            $cond: [
              // Dernière tentative hors fenêtre (ou jamais) : le compteur repart à 1.
              { $lt: [{ $ifNull: ["$nextLoginAttemptIn", new Date(0)] }, windowStart] },
              1,
              { $add: [{ $ifNull: ["$loginAttempts", 0] }, 1] },
            ],
          },
        },
      },
      {
        $set: {
          nextLoginAttemptIn: {
            $switch: {
              branches: [
                { case: { $gt: ["$loginAttempts", MAX_LOGIN_ATTEMPTS_BEFORE_BLOCK] }, then: blockedUntil },
                { case: { $gt: ["$loginAttempts", MAX_LOGIN_ATTEMPTS_BEFORE_DELAY] }, then: delayedUntil },
              ],
              default: now,
            },
          },
        },
      },
    ],
    { new: true, projection: { loginAttempts: 1, nextLoginAttemptIn: 1 } },
  );

  const loginAttempts = updated?.loginAttempts ?? 0;
  const nextLoginAttemptIn = updated?.nextLoginAttemptIn ?? now;

  return {
    loginAttempts,
    nextLoginAttemptIn,
    blocked: loginAttempts > MAX_LOGIN_ATTEMPTS_BEFORE_BLOCK,
    delayed: nextLoginAttemptIn > now,
  };
}

/** Remet le compteur de connexion à zéro après une authentification réussie. */
export async function resetLoginAttempts(model: Model<any>, userId: any): Promise<void> {
  await model.updateOne({ _id: userId }, { $set: { loginAttempts: 0, nextLoginAttemptIn: null } });
}

/**
 * Consomme un essai de code 2FA. Le filtre `attempts2FA < MAX` et l'incrément
 * sont dans la même opération : au-delà du plafond, plus aucune requête ne peut
 * matcher, quelle que soit la concurrence.
 *
 * @returns le document si un essai a pu être consommé, `null` si le plafond est
 *          atteint, le code expiré ou le compte inconnu.
 */
export async function consume2FAAttempt(model: Model<any>, email: string, now: Date = new Date()) {
  return model.findOneAndUpdate({ email, attempts2FA: { $lt: MAX_2FA_ATTEMPTS }, token2FAExpires: { $gt: now } }, { $inc: { attempts2FA: 1 } }, { new: true });
}

/** Consomme un essai de code de validation d'email. Même garantie que `consume2FAAttempt`. */
export async function consumeEmailValidationAttempt(model: Model<any>, filter: Record<string, any>, now: Date = new Date()) {
  return model.findOneAndUpdate(
    { ...filter, attemptsEmailValidation: { $lt: MAX_EMAIL_VALIDATION_ATTEMPTS }, tokenEmailValidationExpires: { $gt: now } },
    { $inc: { attemptsEmailValidation: 1 } },
    { new: true },
  );
}

/**
 * Hash bcrypt (coût 10, identique à celui des mots de passe réels) d'une valeur constante qui n'est
 * le mot de passe d'aucun compte. Comparer un mot de passe soumis contre ce hash, pour un email
 * inconnu, coûte le même temps qu'une vraie comparaison — sans ce leurre, l'absence de compte se lit
 * dans le temps de réponse de `POST /young|referent/signin` (PM5, audit du 25/09/2026).
 */
export const DUMMY_PASSWORD_HASH = "$2a$10$sTqDdPot0MHAYbrd3HYf4eGxYW4bE2V30W8ZWibJbykl7Ma6uzuY6";

/** Compare un mot de passe soumis au hash factice ci-dessus. Le résultat est toujours faux. */
export async function compareAgainstDummyHash(password: string): Promise<boolean> {
  return bcrypt.compare(password, DUMMY_PASSWORD_HASH);
}
