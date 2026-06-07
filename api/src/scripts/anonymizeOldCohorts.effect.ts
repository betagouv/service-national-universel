/**
 * Script one-shot — Anonymisation RGPD de cohortes anciennes (version Effect TS)
 *
 * Différences avec la version mongoose :
 *  - Les écritures Mongo passent par le DRIVER BRUT (collection.updateOne), pas par
 *    mongoose.save(). On évite donc : la validation de schéma (plus de ValidationError
 *    sur enum vidé), le hook post-save Brevo (plus de re-sync parasite) et la création
 *    d'un patch par le save (rien à re-supprimer).
 *  - Le nettoyage Brevo est une PRÉCONDITION VÉRIFIÉE : on supprime le contact PUIS on
 *    confirme son absence. Au moindre doute on échoue → le jeune n'est pas marqué
 *    `anonymized` et sera rejoué au prochain run. (api() avale les erreurs, on ne peut
 *    pas se fier à une exception : la vérification positive est indispensable.)
 *
 * PRÉREQUIS :
 *   mongodump complet AVANT toute exécution sur la production :
 *     mongodump --uri="$MONGO_URL" --out=/backup/$(date +%Y%m%d_%H%M%S)
 *
 * NON COUVERT par ce script (à traiter séparément) :
 *   - Réindexation / purge de l'index Elasticsearch `young` (PII encore interrogeable
 *     tant que le pipeline de reindex n'a pas tourné).
 *
 * À VALIDER avant le run :
 *   - OLD_COHORTS vs db.youngs.distinct("cohort") (re-vérifier si la donnée a évolué depuis 2026-06).
 *   - DRY_RUN ne couvre PAS le chemin d'écriture (buildUpdate) : tester d'abord sur 1 jeune réel.
 *
 * Usage (depuis api/) :
 *   DRY_RUN=true npx tsx src/scripts/anonymizeOldCohorts.effect.ts          # aperçu (compte)
 *   YOUNG_ID=<objectId> npx tsx src/scripts/anonymizeOldCohorts.effect.ts   # test sur 1 jeune réel
 *   COHORTS="2019" npx tsx src/scripts/anonymizeOldCohorts.effect.ts        # run ciblé staging
 *   npx tsx src/scripts/anonymizeOldCohorts.effect.ts                       # run complet
 */

import { Cause, Data, Duration, Effect, Schedule } from "effect";
import mongoose from "mongoose";

import { YoungModel, ApplicationModel, ContractModel, MissionEquivalenceModel } from "../models";
import * as brevo from "../brevo";
import { rateLimiterContactSIB, rateLimiterDeleteContactSIB } from "../rateLimiters";
import { config } from "../config";
import { logger } from "../logger";
import { capture } from "../sentry";
import { initDB, closeDB } from "../mongo";
import { listFiles, deleteFilesByList } from "../utils/index";
import slack from "../slack";
import { YOUNG_STATUS } from "snu-lib";
import { buildUpdate } from "./anonymizeOldCohorts.helpers";

const anonymizeApplication = require("../anonymization/application");
const anonymizeContract = require("../anonymization/contract");

const DRY_RUN = process.env.DRY_RUN === "true" || process.argv.includes("--dry-run");
// Liste explicite (vs $regex) : non ambiguë, auto-documentée, robuste à de futures
// cohortes contenant "2022" en sous-chaîne (ex. un hypothétique "CLE 2022-2023").
// Issue de db.youngs.distinct("cohort") au 2026-06 — à re-valider si la donnée évolue.
const DEFAULT_OLD_COHORTS = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022"];
// Override ponctuel pour un test ciblé (ex. staging) : COHORTS="2019" ou COHORTS="2019,2020".
const OLD_COHORTS = process.env.COHORTS
  ? process.env.COHORTS.split(",").map((c) => c.trim()).filter(Boolean)
  : DEFAULT_OLD_COHORTS;
// Test ciblé : YOUNG_ID="<objectId>" anonymise EXACTEMENT ce jeune (ignore cohorte + flag
// anonymized) pour valider le chemin d'écriture sur un cas réel choisi. Irréversible.
const YOUNG_ID = process.env.YOUNG_ID?.trim();
// Concurrence volontairement basse : chaque jeune ouvre sa propre transaction Mongo.
const CONCURRENCY = 5;

const query = () => (YOUNG_ID ? { _id: YOUNG_ID } : { cohort: { $in: OLD_COHORTS }, anonymized: { $ne: true } });

// ──────────────────────────────────────────────────────────────────────────
// Erreurs typées (canal d'erreur Effect — interdit l'échec silencieux)
// ──────────────────────────────────────────────────────────────────────────
class ConfigError extends Data.TaggedError("ConfigError")<{ reason: string }> {}
class BrevoError extends Data.TaggedError("BrevoError")<{ email: string; reason: string; cause?: unknown }> {}
class S3Error extends Data.TaggedError("S3Error")<{ youngId: string; cause: unknown }> {}
class DbError extends Data.TaggedError("DbError")<{ youngId: string; cause: unknown }> {}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

// Retry court pour absorber les aléas réseau Brevo (3 tentatives espacées exponentiellement)
const brevoRetry = Schedule.exponential(Duration.millis(200)).pipe(Schedule.intersect(Schedule.recurs(3)));

/**
 * Supprime un contact Brevo PUIS confirme positivement son absence via getContact.
 * On NE se fie PAS au retour de deleteContact : api() (brevo.ts) ne teste pas le status
 * HTTP et renvoie `true` pour toute réponse non-JSON (y compris 429/503) — un échec
 * passerait alors pour un succès. La vérif getContact est fail-closed : seul un
 * `document_not_found` explicite valide ; tout le reste échoue → retry → jeune rejoué.
 */
const deleteAndVerifyContact = (email: string) =>
  Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () => rateLimiterDeleteContactSIB.call(() => brevo.deleteContact(email)),
      catch: (cause) => new BrevoError({ email, reason: "deleteContact a échoué", cause }),
    });
    const check: any = yield* Effect.tryPromise({
      try: () => rateLimiterContactSIB.call(() => brevo.getContact(email)),
      catch: (cause) => new BrevoError({ email, reason: "getContact a échoué", cause }),
    });
    if (check?.code !== brevo.BREVO_ERROR_TEMPLATE_NOT_FOUND) {
      return yield* Effect.fail(new BrevoError({ email, reason: "suppression Brevo non confirmée" }));
    }
  }).pipe(Effect.retry(brevoRetry));

/** Purge des contacts Brevo (jeune + parents). Échec ⇒ rien d'autre n'est anonymisé. */
const purgeBrevo = (emails: Array<string | undefined>) =>
  config.ENVIRONMENT !== "production"
    ? Effect.void // miroir du garde-fou de brevo.unsync()
    : Effect.forEach([...new Set(emails.filter((e): e is string => Boolean(e)))], deleteAndVerifyContact, { discard: true });

/**
 * Suppression des fichiers S3 du jeune (CNI, consentements…). Bloquant : un échec
 * fait échouer le jeune (non marqué anonymized → rejoué). On ne marque jamais
 * anonymized si des fichiers PII peuvent subsister sur S3.
 */
const deleteS3Files = (youngId: string) =>
  Effect.tryPromise({
    try: () => listFiles(`app/young/${youngId}/`),
    catch: (cause) => new S3Error({ youngId, cause }),
  }).pipe(
    Effect.flatMap((files: any) =>
      files && files.length > 0
        ? Effect.tryPromise({
            try: () => deleteFilesByList(files.map((f: any) => ({ Key: f.Key }))),
            catch: (cause) => new S3Error({ youngId, cause }),
          })
        : Effect.void,
    ),
  );

/**
 * Écrit l'anonymisation en base via le driver brut, dans une transaction couvrant
 * le jeune, ses candidatures, ses contrats et tous leurs patches (PII d'origine).
 */
const anonymizeDb = (young: any) =>
  Effect.tryPromise({
    try: async () => {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          // updatedAt bumpé manuellement (le driver brut ne déclenche pas le pre-save
          // mongoose) pour que tout reindex ES/Brevo incrémental sur updatedAt reprenne le doc.
          const now = new Date();

          // Jeune : on ne garde RIEN. replaceOne réduit le document au plancher
          // (email requis/unique + bookkeeping) ; tout le reste disparaît.
          // cohort = "-" : marqueur « anonymisé » (la vraie cohorte n'est pas conservée).
          await YoungModel.collection.replaceOne(
            { _id: young._id },
            {
              cohort: "-",
              createdAt: young.createdAt,
              status: YOUNG_STATUS.DELETED,
              anonymized: true,
              email: `anonymized-${young._id}@deleted.snu`,
              updatedAt: now,
            },
            { session },
          );
          await (young as any).patches.collection.deleteMany({ ref: young._id }, { session });

          // Candidatures
          const applications = await ApplicationModel.find({ youngId: young._id.toString() }).session(session);
          for (const app of applications) {
            const anonApp = anonymizeApplication(app.toObject({ virtuals: false }));
            anonApp.updatedAt = now;
            await ApplicationModel.collection.updateOne({ _id: app._id }, buildUpdate(anonApp), { session });
            await (app as any).patches.collection.deleteMany({ ref: app._id }, { session });
          }

          // Contrats
          const contracts = await ContractModel.find({ youngId: young._id.toString() }).session(session);
          for (const contract of contracts) {
            const anonContract = anonymizeContract(contract.toObject({ virtuals: false }));
            anonContract.updatedAt = now;
            await ContractModel.collection.updateOne({ _id: contract._id }, buildUpdate(anonContract), { session });
            await (contract as any).patches.collection.deleteMany({ ref: contract._id }, { session });
          }

          // Équivalences de mission : pas de PII directe (seulement le lien youngId).
          // On rompt le lien et on supprime les patches (qui contiennent l'ancien youngId).
          const equivalences = await MissionEquivalenceModel.find({ youngId: young._id.toString() }).session(session);
          for (const eq of equivalences) {
            await MissionEquivalenceModel.collection.updateOne({ _id: eq._id }, { $unset: { youngId: "" }, $set: { updatedAt: now } }, { session });
            await (eq as any).patches.collection.deleteMany({ ref: eq._id }, { session });
          }
        });
      } finally {
        await session.endSession();
      }
    },
    catch: (cause) => new DbError({ youngId: young._id.toString(), cause }),
  });

// ──────────────────────────────────────────────────────────────────────────
// Traitement d'un jeune : Brevo (gate) → S3 → base. Toute erreur remonte typée.
// ──────────────────────────────────────────────────────────────────────────
const processYoung = (young: any) =>
  Effect.gen(function* () {
    yield* purgeBrevo([young.email, young.parent1Email, young.parent2Email]);
    yield* deleteS3Files(young._id.toString());
    yield* anonymizeDb(young);
  });

// ──────────────────────────────────────────────────────────────────────────
// Programme principal
// ──────────────────────────────────────────────────────────────────────────
const program = Effect.gen(function* () {
  const mode = DRY_RUN ? "[DRY-RUN] " : "";

  // Garde-fou : COHORTS surchargé mais vide après parsing ⇒ un $in:[] n'anonymiserait rien.
  // (sans objet si on cible un YOUNG_ID précis.)
  if (!YOUNG_ID && OLD_COHORTS.length === 0) {
    return yield* Effect.fail(new ConfigError({ reason: "COHORTS défini mais vide après parsing — abandon (un $in:[] n'anonymiserait rien)." }));
  }

  // IDs collectés en amont : évite la dérive de pagination pendant le traitement.
  const ids: Array<{ _id: any }> = yield* Effect.tryPromise(() => YoungModel.find(query()).select("_id").lean());
  logger.info(`${mode}${ids.length} jeunes à anonymiser`);

  const results = yield* Effect.forEach(
    ids,
    (idDoc) =>
      // DRY-RUN : on ne charge pas le doc complet (avec +password) juste pour logguer.
      DRY_RUN
        ? Effect.sync(() => {
            logger.info(`[DRY-RUN] anonymiserait le jeune ${idDoc._id}`);
            return "processed" as const;
          })
        : // catchAllCause au niveau de l'élément : une erreur OU un défaut (die) — y compris
          // sur le findById — marque CE jeune en "error" sans interrompre les autres fibers.
          Effect.gen(function* () {
            const young = yield* Effect.tryPromise(() =>
              YoungModel.findById(idDoc._id).select("+password +forgotPasswordResetExpires"),
            );
            if (!young) return "skipped" as const;
            yield* processYoung(young);
            return "processed" as const;
          }).pipe(
            Effect.catchAllCause((cause) =>
              Effect.sync(() => {
                capture(Cause.squash(cause), { extra: { youngId: idDoc._id } });
                logger.error(`Erreur sur le jeune ${idDoc._id}: ${Cause.pretty(cause)}`);
                return "error" as const;
              }),
            ),
          ),
    { concurrency: CONCURRENCY },
  );

  const processed = results.filter((r) => r === "processed").length;
  const errors = results.filter((r) => r === "error").length;
  const skipped = results.filter((r) => r === "skipped").length;
  logger.info(`${mode}Anonymisation terminée : ${processed} traités, ${errors} erreurs, ${skipped} introuvables, ${ids.length} total`);

  yield* Effect.tryPromise(() =>
    slack.success({
      title: "anonymizeOldCohorts (effect)",
      text: `${mode}${processed} jeunes anonymisés${errors > 0 ? `, ${errors} erreurs` : ""}${skipped > 0 ? `, ${skipped} introuvables` : ""} sur ${ids.length} trouvés`,
    }),
  ).pipe(Effect.catchAll(() => Effect.void));
}).pipe(
  Effect.catchAll((cause) =>
    Effect.gen(function* () {
      capture(cause);
      logger.error(`Erreur fatale anonymizeOldCohorts: ${String(cause)}`);
      yield* Effect.tryPromise(() =>
        slack.error({ title: "anonymizeOldCohorts (effect)", text: `Erreur fatale: ${String(cause)}` }),
      ).pipe(Effect.catchAll(() => Effect.void));
      return yield* Effect.fail(cause);
    }),
  ),
);

// Connexion DB garantie ouverte/fermée autour du programme (acquire / release).
const main = Effect.acquireUseRelease(
  Effect.tryPromise(() => initDB()),
  () => program,
  () => Effect.tryPromise(() => closeDB()).pipe(Effect.ignore),
);

if (require.main === module) {
  Effect.runPromise(main)
    .then(() => process.exit(0))
    .catch((e) => {
      logger.error(e);
      process.exit(1);
    });
}

export { program, main };
