/**
 * Invalide les secrets de compte exposés avant les correctifs #5293, #5310, #5336 et #5422
 * (index ES young/referent, documents référents bruts, documents jeunes bruts, logs).
 *
 * Étapes, dans l'ordre d'exécution :
 *   invitations  jetons d'invitation (jeunes et référents) émis avant TOKEN_EXPOSURE_CLOSED_AT et
 *                encore valables : réémis et renvoyés au titulaire ; si le compte ne doit plus être
 *                activé (désactivé, supprimé, rôle décommissionné…), l'invitation expire sans renvoi.
 *   phase3       phase3Token (sans expiration) : effacé, sans email. La phase 3 n'existe plus ; le
 *                statut de phase 3 du volontaire n'est pas touché.
 *   passwords    empreintes bcrypt présentes dans l'index ES jusqu'au 22/09 : réinitialisation imposée
 *                (passwordResetRequired, lu à la connexion par auth.ts) et sessions coupées
 *                (passwordChangedAt). Nécessite que le code qui lit le drapeau soit déployé.
 *   purge        jetons 2FA, de validation d'email et de réinitialisation expirés (inutilisables, mais
 *                encore sensibles dans une sauvegarde), jetons des représentants légaux (plus aucune
 *                route ne les lit depuis #5357).
 *
 * Les écritures passent par la collection native : ni hooks mongoose (synchro Brevo, calcul d'état
 * des classes) ni patch-history, qui charge chaque document et a déjà fait tomber TASKS en mémoire.
 *
 * Idempotence : aucune étape ne reprend ce qu'elle a déjà traité.
 *
 * Usage (depuis api/) :
 *   npx tsx src/scripts/invalidateExposedTokens.effect.ts                              # dry-run, toutes les étapes
 *   npx tsx src/scripts/invalidateExposedTokens.effect.ts --step invitations --apply
 */

import crypto from "crypto";
import { Data, Effect } from "effect";
import { ReferentStatus, SENDINBLUE_TEMPLATES, YOUNG_STATUS, isDecommissionedRole } from "snu-lib";

import { ReferentModel, StructureModel, YoungModel } from "../models";
import { sendTemplate } from "../brevo";
import { config } from "../config";
import { logger } from "../logger";
import { initDB, closeDB } from "../mongo";

/** #5310 en production (_source.excludes + sérialiseur) : plus d'empreinte servie par l'API. Marge d'une heure. */
export const HASH_EXPOSURE_CLOSED_AT = new Date("2026-09-22T10:00:00Z");
/** #5422 en production (dernier canal de documents bruts, PH16) : 26/09 15:39 (+0200). Marge d'une heure. */
export const TOKEN_EXPOSURE_CLOSED_AT = new Date("2026-09-26T14:40:00Z");

const INVITATION_VALIDITY_MS = 7 * 86400000;
const EMAIL_CONCURRENCY = 5;

export const STEPS = ["invitations", "phase3", "passwords", "purge"] as const;
export type Step = (typeof STEPS)[number];

export type Report = {
  invitations?: { reissued: number; expired: number; failed: string[] };
  phase3?: { cleared: number };
  passwords?: { young: number; referent: number };
  purge?: { young: number; referent: number };
};

type Options = { steps: readonly Step[]; apply: boolean; now: Date };

export class UsageError extends Data.TaggedError("UsageError")<{ message: string }> {}

export const parseArgs = (argv: string[]): { apply: boolean; steps: Step[] } => {
  const steps: Step[] = [];
  argv.forEach((arg, i) => {
    if (arg !== "--step") return;
    const step = argv[i + 1] as Step;
    if (!STEPS.includes(step)) throw new UsageError({ message: `Étape inconnue : « ${argv[i + 1]} » (attendu : ${STEPS.join(", ")})` });
    steps.push(step);
  });
  return { apply: argv.includes("--apply"), steps: steps.length ? STEPS.filter((s) => steps.includes(s)) : [...STEPS] };
};

/**
 * `sendTemplate` ne lève jamais et ne fait rien hors transport Brevo actif : lancé ainsi, le script
 * réémettrait les jetons sans prévenir personne. De même avec des URL de fronts locales. Vérifié
 * avant toute écriture.
 */
export const mailDeliveryProblem = (
  cfg: { MAIL_TRANSPORT?: string | null; ENABLE_SENDINBLUE?: boolean; SENDINBLUEKEY?: string | null; APP_URL?: string | null; ADMIN_URL?: string | null },
  steps: readonly Step[],
): string | null => {
  if (!steps.includes("invitations")) return null;
  if (cfg.MAIL_TRANSPORT !== "BREVO") return `MAIL_TRANSPORT=${cfg.MAIL_TRANSPORT} : aucun email ne partirait (BREVO attendu)`;
  if (!cfg.ENABLE_SENDINBLUE) return "ENABLE_SENDINBLUE est faux : aucun email ne partirait";
  if (!cfg.SENDINBLUEKEY) return "SENDINBLUEKEY absente : aucun email ne partirait";
  // Les liens envoyés sont construits sur ces URL : des valeurs locales enverraient des liens morts.
  for (const name of ["APP_URL", "ADMIN_URL"] as const) {
    if (!cfg[name]?.startsWith("https://") || /localhost|127\.0\.0\.1/.test(cfg[name]!)) return `${name}=${cfg[name]} : les liens envoyés seraient inutilisables`;
  }
  return null;
};

const newToken = () => crypto.randomBytes(20).toString("hex");
const nonEmpty = { $exists: true, $nin: [null, ""] };
const unsetOrBefore = (field: string, date: Date) => ({ $or: [{ [field]: { $exists: false } }, { [field]: null }, { [field]: { $lt: date } }] });

/**
 * Envoie les emails (concurrence bornée) ; un échec est journalisé et n'arrête pas le lot. Une réponse
 * vide de `sendTemplate` est un échec : il capture l'erreur Brevo et renvoie undefined au lieu de lever.
 */
const sendAll = <A>(items: A[], send: (item: A) => Promise<unknown>, idOf: (item: A) => string) =>
  Effect.forEach(
    items,
    (item) =>
      Effect.tryPromise(() => send(item)).pipe(
        Effect.flatMap((sent) => (sent ? Effect.succeed(null) : Effect.fail("réponse vide de Brevo"))),
        Effect.catchAll((error) => Effect.sync(() => (logger.error(`Email non envoyé pour ${idOf(item)} : ${error}`), idOf(item)))),
      ),
    { concurrency: EMAIL_CONCURRENCY },
  ).pipe(Effect.map((results) => results.filter((id): id is string => id !== null)));

// ---------------------------------------------------------------------------------------------
// invitations

const exposedInvitation = (now: Date) => ({
  invitationToken: nonEmpty,
  invitationExpires: { $gt: now, $lte: new Date(TOKEN_EXPOSURE_CLOSED_AT.getTime() + INVITATION_VALIDITY_MS) },
});

/** Même règle que `shouldResendInvitation` (referentController) : sinon, l'invitation expire sans renvoi. */
const canReinviteReferent = (referent) =>
  !referent.registredAt &&
  referent.status !== ReferentStatus.INACTIVE &&
  !referent.deletedAt &&
  !isDecommissionedRole(referent) &&
  Boolean(SENDINBLUE_TEMPLATES.invitationReferent[referent.role]);

const canReinviteYoung = (young) => !young.registredAt && !young.deletedAt && young.status !== YOUNG_STATUS.DELETED && !young.anonymized && Boolean(young.email);

/** Paramètres repris de `sendNewInvitation` (referentController). */
const sendReferentInvitation = async (referent, token: string) => {
  const structureName = referent.structureId ? (await StructureModel.findById(referent.structureId))?.name : "";
  const toName = `${referent.firstName} ${referent.lastName}`;
  return sendTemplate(SENDINBLUE_TEMPLATES.invitationReferent[referent.role], {
    emailTo: [{ name: toName, email: referent.email }],
    params: {
      cta: `${config.ADMIN_URL}/auth/signup/invite?token=${token}`,
      cohesionCenterName: referent.cohesionCenterName,
      structureName,
      region: referent.region,
      department: referent.department,
      fromName: "L'équipe SNU",
      toName,
    },
  });
};

/** Paramètres repris de POST /young/invite. */
const sendYoungInvitation = (young, token: string) => {
  const toName = `${young.firstName} ${young.lastName}`;
  return sendTemplate(SENDINBLUE_TEMPLATES.INVITATION_YOUNG, {
    emailTo: [{ name: toName, email: young.email }],
    params: {
      toName,
      cta: `${config.APP_URL}/auth/signup/invite?token=${token}&utm_campaign=transactionnel+compte+cree&utm_source=notifauto&utm_medium=mail+166+activer`,
      fromName: "L'équipe SNU",
    },
  });
};

const reissueInvitations = (model: any, label: string, canReinvite: (doc) => boolean, send: (doc, token: string) => Promise<unknown>, { apply, now }: Options) =>
  Effect.gen(function* () {
    const docs: any[] = yield* Effect.tryPromise(() => model.collection.find(exposedInvitation(now)).toArray() as Promise<any[]>);
    const toReissue = docs.filter(canReinvite);
    const toExpire = docs.filter((doc) => !canReinvite(doc));
    logger.info(`[invitations] ${label} : ${toReissue.length} à réémettre, ${toExpire.length} à faire expirer`);
    if (!apply) return { reissued: toReissue.length, expired: toExpire.length, failed: [] as string[] };

    if (toExpire.length) {
      yield* Effect.tryPromise(() => model.collection.updateMany({ _id: { $in: toExpire.map((d) => d._id) } }, { $set: { invitationExpires: now } }));
    }
    const reissued: { doc: any; token: string }[] = [];
    for (const doc of toReissue) {
      const token = newToken();
      yield* Effect.tryPromise(() =>
        model.collection.updateOne({ _id: doc._id }, { $set: { invitationToken: token, invitationExpires: new Date(now.getTime() + INVITATION_VALIDITY_MS) } }),
      );
      reissued.push({ doc, token });
    }
    const failed = yield* sendAll(
      reissued,
      ({ doc, token }) => send(doc, token),
      ({ doc }) => `${label}:${doc._id}`,
    );
    return { reissued: reissued.length, expired: toExpire.length, failed };
  });

const invitationsStep = (options: Options) =>
  Effect.gen(function* () {
    const referents = yield* reissueInvitations(ReferentModel, "referent", canReinviteReferent, sendReferentInvitation, options);
    const youngs = yield* reissueInvitations(YoungModel, "young", canReinviteYoung, sendYoungInvitation, options);
    return {
      reissued: referents.reissued + youngs.reissued,
      expired: referents.expired + youngs.expired,
      failed: [...referents.failed, ...youngs.failed],
    };
  });

// ---------------------------------------------------------------------------------------------
// phase3

/**
 * La phase 3 n'existe plus : aucun tuteur n'est relancé. Effacer le jeton rend le lien de validation
 * inutilisable ; le statut de phase 3 du volontaire n'est pas touché.
 */
const phase3Step = ({ apply }: Options) =>
  Effect.gen(function* () {
    const filter = { phase3Token: nonEmpty };
    const cleared: number = apply
      ? (yield* Effect.tryPromise(() => YoungModel.collection.updateMany(filter, { $set: { phase3Token: "" } }) as Promise<{ modifiedCount: number }>)).modifiedCount
      : yield* Effect.tryPromise(() => YoungModel.collection.countDocuments(filter) as Promise<number>);
    logger.info(`[phase3] ${cleared} jeton(s) tuteur ${apply ? "effacé(s)" : "à effacer"}`);
    return { cleared };
  });

// ---------------------------------------------------------------------------------------------
// passwords

const exposedHashFilter = {
  password: nonEmpty,
  passwordResetRequired: { $ne: true },
  deletedAt: { $exists: false },
  status: { $ne: YOUNG_STATUS.DELETED },
  anonymized: { $ne: true },
  $and: [unsetOrBefore("createdAt", HASH_EXPOSURE_CLOSED_AT), unsetOrBefore("passwordChangedAt", HASH_EXPOSURE_CLOSED_AT)],
};

const flagPasswords = (model: any, label: string, { apply, now }: Options) =>
  Effect.gen(function* () {
    const count: number = apply
      ? (yield* Effect.tryPromise(() => model.collection.updateMany(exposedHashFilter, { $set: { passwordResetRequired: true, passwordChangedAt: now } }) as Promise<{ modifiedCount: number }>)).modifiedCount
      : yield* Effect.tryPromise(() => model.collection.countDocuments(exposedHashFilter) as Promise<number>);
    logger.info(`[passwords] ${label} : ${count} compte(s) ${apply ? "soumis" : "à soumettre"} à réinitialisation`);
    return count;
  });

const passwordsStep = (options: Options) =>
  Effect.gen(function* () {
    const referent = yield* flagPasswords(ReferentModel, "referent", options);
    const young = yield* flagPasswords(YoungModel, "young", options);
    return { young, referent };
  });

// ---------------------------------------------------------------------------------------------
// purge

type ExpiringToken = { token: string; expires: string; cleared: null | "" };

const YOUNG_EXPIRING: ExpiringToken[] = [
  { token: "token2FA", expires: "token2FAExpires", cleared: null },
  { token: "tokenEmailValidation", expires: "tokenEmailValidationExpires", cleared: null },
  { token: "forgotPasswordResetToken", expires: "forgotPasswordResetExpires", cleared: "" },
];
const REFERENT_EXPIRING: ExpiringToken[] = [
  { token: "token2FA", expires: "token2FAExpires", cleared: null },
  { token: "forgotPasswordResetToken", expires: "forgotPasswordResetExpires", cleared: "" },
];
const LEGAL_REPRESENTATIVE_TOKENS = ["parent1Inscription2023Token", "parent1Inscription2023TokenExpiresAt", "parent2Inscription2023Token", "parent2Inscription2023TokenExpiresAt"];

const purgeCollection = (model: any, label: string, expiring: ExpiringToken[], unset: string[], { apply, now }: Options) =>
  Effect.gen(function* () {
    const filter = {
      $or: [
        ...expiring.map(({ token, expires }) => ({ [token]: nonEmpty, ...unsetOrBefore(expires, now) })),
        ...unset.map((field) => ({ [field]: { $exists: true } })),
      ],
    };
    const isExpired = (expires: string) => ({ $or: [{ $eq: [{ $ifNull: [`$${expires}`, null] }, null] }, { $lt: [`$${expires}`, now] }] });
    const set = Object.fromEntries(
      expiring.flatMap(({ token, expires, cleared }) => [
        [token, { $cond: [isExpired(expires), cleared, `$${token}`] }],
        [expires, { $cond: [isExpired(expires), null, `$${expires}`] }],
      ]),
    );
    const pipeline: object[] = [{ $set: set }, ...(unset.length ? [{ $unset: unset }] : [])];
    const count: number = apply
      ? (yield* Effect.tryPromise(() => model.collection.updateMany(filter, pipeline) as Promise<{ modifiedCount: number }>)).modifiedCount
      : yield* Effect.tryPromise(() => model.collection.countDocuments(filter) as Promise<number>);
    logger.info(`[purge] ${label} : ${count} document(s) ${apply ? "nettoyé(s)" : "à nettoyer"}`);
    return count;
  });

const purgeStep = (options: Options) =>
  Effect.gen(function* () {
    const referent = yield* purgeCollection(ReferentModel, "referent", REFERENT_EXPIRING, [], options);
    const young = yield* purgeCollection(YoungModel, "young", YOUNG_EXPIRING, LEGAL_REPRESENTATIVE_TOKENS, options);
    return { young, referent };
  });

// ---------------------------------------------------------------------------------------------

export const program = (options: Options) =>
  Effect.gen(function* () {
    logger.info(`${options.apply ? "" : "[DRY RUN] "}Étapes : ${options.steps.join(", ")} (référence : ${options.now.toISOString()})`);
    const report: Report = {};
    if (options.steps.includes("invitations")) report.invitations = yield* invitationsStep(options);
    if (options.steps.includes("phase3")) report.phase3 = yield* phase3Step(options);
    if (options.steps.includes("passwords")) report.passwords = yield* passwordsStep(options);
    if (options.steps.includes("purge")) report.purge = yield* purgeStep(options);
    logger.info(`${options.apply ? "" : "[DRY RUN] "}Bilan : ${JSON.stringify(report)}`);
    return report;
  });

const main = Effect.gen(function* () {
  const { apply, steps } = yield* Effect.try({
    try: () => parseArgs(process.argv.slice(2)),
    catch: (e) => (e instanceof UsageError ? e : new UsageError({ message: String(e) })),
  });
  const mailProblem = apply ? mailDeliveryProblem(config, steps) : null;
  if (mailProblem) return yield* Effect.fail(new UsageError({ message: `Rien n'a été écrit. ${mailProblem}` }));
  return yield* Effect.acquireUseRelease(
    Effect.tryPromise(() => initDB()),
    () => program({ steps, apply, now: new Date() }),
    () => Effect.tryPromise(() => closeDB()).pipe(Effect.ignore),
  );
});

if (require.main === module) {
  Effect.runPromise(main.pipe(Effect.catchTag("UsageError", (e) => Effect.fail(e.message))))
    .then((report) => {
      const failed = report.invitations?.failed || [];
      if (failed.length) logger.warn(`Emails à renvoyer à la main (jeton déjà réémis) : ${failed.join(", ")}`);
      process.exit(failed.length ? 2 : 0);
    })
    .catch((e) => {
      logger.error(e);
      process.exit(1);
    });
}
