/**
 * Script one-shot — Rattrapage de la purge S3 des volontaires supprimés (constat M48)
 *
 * Jusqu'au correctif du lot T3, `PUT /young/:id/soft-delete` bouclait sur les caractères du nom
 * de chaque clé de `young.files` : aucun binaire n'était supprimé, puis le document était vidé.
 * Les pièces (CNI, consentements, justificatifs…) de ces volontaires sont donc restées dans le
 * bucket sous `app/young/<id>/`, sans plus aucune référence en base.
 *
 * Ce script parcourt les volontaires au statut DELETED et purge leur préfixe S3 (même helper que la
 * route corrigée). Les volontaires anonymisés par anonymizeOldCohorts ont déjà un préfixe vide :
 * ils sont listés et comptés à 0, sans effet.
 *
 * La suppression S3 est définitive (aucun mongodump ne la couvre). Lancer d'abord en DRY_RUN.
 *
 * Usage (depuis api/) :
 *   DRY_RUN=true npx tsx src/scripts/purgeSoftDeletedYoungFiles.effect.ts          # aperçu : compte les objets restants
 *   YOUNG_ID=<objectId> npx tsx src/scripts/purgeSoftDeletedYoungFiles.effect.ts   # un seul volontaire
 *   npx tsx src/scripts/purgeSoftDeletedYoungFiles.effect.ts                       # run complet
 */

import { Cause, Data, Effect } from "effect";
import { YOUNG_STATUS } from "snu-lib";

import { YoungModel } from "../models";
import { logger } from "../logger";
import { capture } from "../sentry";
import { initDB, closeDB } from "../mongo";
import { listFiles } from "../utils";
import { purgeYoungFiles } from "../young/youngFilesPurge";
import slack from "../slack";

const DRY_RUN = process.env.DRY_RUN === "true" || process.argv.includes("--dry-run");
const YOUNG_ID = process.env.YOUNG_ID;
const CONCURRENCY = 10;

class S3Error extends Data.TaggedError("S3Error")<{ youngId: string; cause: unknown }> {}

const countRemainingFiles = (youngId: string) =>
  Effect.tryPromise({
    try: async () => ((await listFiles(`app/young/${youngId}/`)) || []).length as number,
    catch: (cause) => new S3Error({ youngId, cause }),
  });

const purge = (youngId: string) =>
  Effect.tryPromise({
    try: () => purgeYoungFiles(youngId),
    catch: (cause) => new S3Error({ youngId, cause }),
  });

const program = Effect.gen(function* () {
  const mode = DRY_RUN ? "[DRY RUN] " : "";
  const filter = YOUNG_ID ? { _id: YOUNG_ID, status: YOUNG_STATUS.DELETED } : { status: YOUNG_STATUS.DELETED };
  const ids = yield* Effect.tryPromise(() => YoungModel.find(filter).select("_id").lean());
  logger.info(`${mode}${ids.length} volontaire(s) au statut DELETED à examiner`);

  const results = yield* Effect.forEach(
    ids,
    (doc) => {
      const youngId = doc._id.toString();
      return (DRY_RUN ? countRemainingFiles(youngId) : purge(youngId)).pipe(
        Effect.tap((files) => (files > 0 ? Effect.sync(() => logger.info(`${mode}${youngId} : ${files} fichier(s) ${DRY_RUN ? "restant(s)" : "supprimé(s)"}`)) : Effect.void)),
        Effect.map((files) => ({ files, error: false })),
        Effect.catchAllCause((cause) =>
          Effect.sync(() => {
            capture(Cause.squash(cause), { extra: { youngId } });
            logger.error(`Erreur sur le volontaire ${youngId}: ${Cause.pretty(cause)}`);
            return { files: 0, error: true };
          }),
        ),
      );
    },
    { concurrency: CONCURRENCY },
  );

  const files = results.reduce((total, r) => total + r.files, 0);
  const affected = results.filter((r) => r.files > 0).length;
  const errors = results.filter((r) => r.error).length;
  const summary = `${mode}${files} fichier(s) ${DRY_RUN ? "restant(s)" : "supprimé(s)"} pour ${affected} volontaire(s) sur ${ids.length}${
    errors > 0 ? `, ${errors} erreur(s)` : ""
  }`;
  logger.info(summary);

  yield* Effect.tryPromise(() => slack.success({ title: "purgeSoftDeletedYoungFiles", text: summary })).pipe(Effect.catchAll(() => Effect.void));
  if (errors > 0) return yield* Effect.fail(new Error(`${errors} volontaire(s) en erreur`));
});

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
