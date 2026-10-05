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
   * La tentative est refusée sans même comparer le mot de passe : soit le plafond haut est franchi
   * par cette tentative, soit un verrou (délai ou blocage) était déjà actif quand elle a été
   * présentée. Dans ce second cas rien n'est consommé et le verrou n'est pas prolongé. C'est ce qui
   * borne le nombre de hachages bcrypt qu'une rafale concurrente peut déclencher.
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
 *
 * Le verrou est décidé par cette même opération : si un délai ou un blocage est encore actif au
 * moment où l'update s'applique, le pipeline ne touche à rien (ni incrément, ni nouvelle échéance) et
 * la tentative est rendue `blocked`. Le contrôle ne repose donc pas sur un document lu plus tôt,
 * qu'une requête concurrente a pu verrouiller entre-temps.
 *
 * L'update rend le document tel qu'il était AVANT modification : c'est lui qui dit si le verrou était
 * actif. Les valeurs « après » en sont déduites par la même transition que le pipeline (une seule
 * lecture, donc exactes). Le filtre ne porte que sur l'identifiant : un filtre qui exclurait les
 * comptes verrouillés ne rendrait aucun document, et le hook post-update de mongoose-patch-history
 * échoue alors sur ce résultat vide.
 */
export async function consumeLoginAttempt(model: Model<any>, userId: any, now: Date = new Date()): Promise<ConsumedLoginAttempt> {
  const windowStart = new Date(now.getTime() - LOGIN_ATTEMPTS_WINDOW_MS);
  const delayedUntil = new Date(now.getTime() + LOGIN_ATTEMPT_DELAY_MS);
  const blockedUntil = new Date(now.getTime() + LOGIN_BLOCK_MS);
  const lockActive = { $gt: [{ $ifNull: ["$nextLoginAttemptIn", new Date(0)] }, now] };

  const before = await model.findOneAndUpdate(
    { _id: userId },
    [
      {
        $set: {
          loginAttempts: {
            $cond: [
              lockActive,
              // Verrou actif : rien n'est consommé.
              "$loginAttempts",
              {
                $cond: [
                  // Dernière tentative hors fenêtre (ou jamais) : le compteur repart à 1.
                  { $lt: [{ $ifNull: ["$nextLoginAttemptIn", new Date(0)] }, windowStart] },
                  1,
                  { $add: [{ $ifNull: ["$loginAttempts", 0] }, 1] },
                ],
              },
            ],
          },
        },
      },
      {
        $set: {
          nextLoginAttemptIn: {
            $cond: [
              // Verrou actif : l'échéance n'est pas prolongée.
              lockActive,
              "$nextLoginAttemptIn",
              {
                $switch: {
                  branches: [
                    { case: { $gt: ["$loginAttempts", MAX_LOGIN_ATTEMPTS_BEFORE_BLOCK] }, then: blockedUntil },
                    { case: { $gt: ["$loginAttempts", MAX_LOGIN_ATTEMPTS_BEFORE_DELAY] }, then: delayedUntil },
                  ],
                  default: now,
                },
              },
            ],
          },
        },
      },
    ],
    { new: false, projection: { loginAttempts: 1, nextLoginAttemptIn: 1 } },
  );

  const previousAttempts: number = before?.loginAttempts ?? 0;
  const previousNextAttemptIn: Date = before?.nextLoginAttemptIn ?? new Date(0);

  // Verrou déjà actif (ou compte disparu entre-temps) : rien n'a été consommé.
  if (!before || previousNextAttemptIn > now) {
    return { loginAttempts: previousAttempts, nextLoginAttemptIn: before?.nextLoginAttemptIn ?? now, blocked: true, delayed: true };
  }

  const loginAttempts = previousNextAttemptIn < windowStart ? 1 : previousAttempts + 1;
  const nextLoginAttemptIn = loginAttempts > MAX_LOGIN_ATTEMPTS_BEFORE_BLOCK ? blockedUntil : loginAttempts > MAX_LOGIN_ATTEMPTS_BEFORE_DELAY ? delayedUntil : now;

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
 * Consomme un essai de code dans une opération unique : le filtre `< plafond`, l'échéance et l'incrément
 * sont évalués ensemble, donc au-delà du plafond plus aucune requête ne peut matcher, quelle que soit
 * la concurrence.
 *
 * L'update passe par le driver natif : les hooks de mongoose-patch-history ne sont pas joués. Sur un
 * résultat vide (plafond atteint, code expiré, compte inconnu) ils lèvent (500 au lieu de 400, ce qui
 * distinguait ces cas), et sans `new` ils rattachent à un document quelconque un patch complet. Les
 * compteurs sont exclus de l'historique de patch, rien n'est perdu côté traçabilité. Les filtres ne
 * portent que des chaînes, nombres et dates : aucun cast mongoose n'est nécessaire. Le document est
 * relu après l'incrément pour que l'appelant travaille sur l'état courant.
 */
async function consumeCodeAttempt(model: Model<any>, filter: Record<string, any>, attemptsField: string, max: number, expiresField: string, now: Date) {
  const result = await model.collection.findOneAndUpdate(
    { ...filter, [attemptsField]: { $lt: max }, [expiresField]: { $gt: now } },
    { $inc: { [attemptsField]: 1 } },
    { projection: { _id: 1 }, includeResultMetadata: true },
  );
  const consumed = result.value;
  if (!consumed) return null;
  return model.findById(consumed._id);
}

/**
 * Consomme un essai de code 2FA.
 *
 * @returns le document si un essai a pu être consommé, `null` si le plafond est
 *          atteint, le code expiré ou le compte inconnu.
 */
export async function consume2FAAttempt(model: Model<any>, email: string, now: Date = new Date()) {
  return consumeCodeAttempt(model, { email }, "attempts2FA", MAX_2FA_ATTEMPTS, "token2FAExpires", now);
}

/** Consomme un essai de code de validation d'email. Même garantie que `consume2FAAttempt`. */
export async function consumeEmailValidationAttempt(model: Model<any>, filter: Record<string, any>, now: Date = new Date()) {
  return consumeCodeAttempt(model, filter, "attemptsEmailValidation", MAX_EMAIL_VALIDATION_ATTEMPTS, "tokenEmailValidationExpires", now);
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
