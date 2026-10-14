/**
 * Contrôle post-déploiement GOO-40 / GOO-5 — LECTURE SEULE.
 *
 * Avant #5360 (23/09/2026, 12 h 33 UTC), `PUT /referent/:id` et le rattachement à une structure
 * laissaient un non-admin modifier le département, la région, le statut, l'e-mail ou le rôle d'un
 * compte référent — le sien compris. Le correctif ferme la faille pour l'avenir mais ne dit pas si
 * elle a servi. Ce script parcourt `referent_patches` jusqu'au merge et remonte chaque écriture que
 * #5360 aurait refusée (règles : `auditReferentSelfUpdates.helpers.ts`).
 *
 * Un résultat n'est pas une preuve d'abus : un référent départemental a pu corriger de bonne foi le
 * département d'un pair. Il faut relire chaque cas, en commençant par les auto-modifications.
 *
 * Sorties :
 *   - sortie standard : compteurs seulement (aucun e-mail) ;
 *   - REPORT_FILE (JSONL, mode 0600) : un cas par ligne, avec les valeurs avant/après et l'auteur.
 *     Il contient des adresses e-mail : ne pas le partager ni le commiter.
 * Code de sortie 2 s'il reste des cas à relire.
 *
 * Usage (depuis api/) :
 *   REPORT_FILE=./audit-referent-self-updates.jsonl npx tsx src/scripts/auditReferentSelfUpdates.effect.ts
 *   UNTIL=2026-09-24T00:00:00Z SINCE=2025-01-01T00:00:00Z …   # fenêtre (défaut : tout jusqu'au merge de #5360)
 */
import fs from "fs";

import { Effect } from "effect";
import mongoose from "mongoose";

import { ReferentModel } from "../models";
import { logger } from "../logger";
import { initDB, closeDB } from "../mongo";
import { classifyReferentPatch, GOO5_FIX_MERGED_AT, ReferentPatch } from "./auditReferentSelfUpdates.helpers";

const REPORT_FILE = process.env.REPORT_FILE || "./audit-referent-self-updates.jsonl";
const UNTIL = process.env.UNTIL ? new Date(process.env.UNTIL) : GOO5_FIX_MERGED_AT;
const SINCE = process.env.SINCE ? new Date(process.env.SINCE) : undefined;
const WATCHED_PATHS = /^\/(status|email|role|subRole|region|department)(\/|$)/;

const program = Effect.gen(function* () {
  if (Number.isNaN(UNTIL.getTime()) || (SINCE && Number.isNaN(SINCE.getTime()))) {
    return yield* Effect.fail(new Error("SINCE/UNTIL : date ISO invalide"));
  }
  // Collection nommée par mongoose-patch-history (`referentPatches` décamélisé).
  const patches = mongoose.connection.db!.collection("referent_patches");
  const filter = {
    date: { $lt: UNTIL, ...(SINCE ? { $gte: SINCE } : {}) },
    "ops.path": WATCHED_PATHS,
  };

  const report = fs.openSync(REPORT_FILE, "w", 0o600);
  fs.fchmodSync(report, 0o600); // Le mode d'`openSync` ne vaut qu'à la création : un ancien rapport garderait le sien.
  const counters = { examines: 0, admin: 0, sans_auteur: 0, dans_le_perimetre: 0, hors_champs_surveilles: 0, suspects: 0, auto: 0 };
  const reasons: Record<string, number> = {};
  const accounts = new Set<string>();

  yield* Effect.tryPromise(async () => {
    const cursor = patches.find(filter).sort({ date: 1 });
    for await (const patch of cursor) {
      counters.examines++;
      const result = classifyReferentPatch(patch as unknown as ReferentPatch);
      if (result.kind === "ignore") {
        counters[result.why]++;
        continue;
      }
      counters.suspects++;
      if (result.self) counters.auto++;
      accounts.add(String(patch.ref));
      result.findings.forEach((f) => (reasons[f.reason] = (reasons[f.reason] || 0) + 1));
      const { _id, role, department, region, email, impersonatedBy } = patch.user || {};
      const line = {
        patchId: String(patch._id),
        referentId: String(patch.ref),
        date: patch.date,
        auteur: { _id: String(_id), role, department, region, email, impersonatedBy: impersonatedBy ? { _id: String(impersonatedBy._id), role: impersonatedBy.role } : undefined },
        auto: result.self,
        constats: result.findings,
      };
      fs.writeSync(report, JSON.stringify(line) + "\n");
    }
  }).pipe(Effect.ensuring(Effect.sync(() => fs.closeSync(report))));

  // Statut et rôle actuels des comptes touchés, pour prioriser la relecture (sans e-mail sur la sortie standard).
  const current = yield* Effect.tryPromise(() =>
    ReferentModel.find({ _id: { $in: [...accounts] } })
      .select("role status")
      .lean(),
  );
  const byRoleStatus = current.reduce<Record<string, number>>((acc, r) => {
    const key = `${r.role}/${r.status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  logger.info(
    `[GOO-40/GOO-5] patches référents avant ${UNTIL.toISOString()}${SINCE ? ` depuis ${SINCE.toISOString()}` : ""} : ${JSON.stringify(counters)} ; ` +
      `motifs ${JSON.stringify(reasons)} ; ${accounts.size} compte(s) touché(s), aujourd'hui ${JSON.stringify(byRoleStatus)} ; détail : ${REPORT_FILE}`,
  );
  return counters.suspects;
});

// Connexion DB garantie ouverte/fermée autour du programme (acquire / release).
const main = Effect.acquireUseRelease(
  Effect.tryPromise(() => initDB()),
  () => program,
  () => Effect.tryPromise(() => closeDB()).pipe(Effect.ignore),
);

if (require.main === module) {
  Effect.runPromise(main)
    .then((suspects) => process.exit(suspects > 0 ? 2 : 0))
    .catch((e) => {
      logger.error(e);
      process.exit(1);
    });
}

export { program, main };
