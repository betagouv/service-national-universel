/**
 * Pilotage du verrouillage temporaire de l'accès référent (feature flag ADMIN_ACCESS_RESTRICTED).
 *
 * Tant que le verrouillage est actif, seuls les référents de la liste gardent une session : admin,
 * apiv2 et SSO support compris. Les sessions déjà ouvertes des autres sont coupées à leur requête
 * suivante. Pendant une impersonation, c'est l'administrateur réel qui est contrôlé.
 * Règle partagée : packages/lib/src/adminAccessRestriction.ts.
 *
 * La liste est stockée en identifiants de référents (stables) ; le script les résout depuis les emails.
 *
 * Usage (depuis api/) :
 *   npx tsx src/scripts/adminAccessRestriction.effect.ts status
 *   npx tsx src/scripts/adminAccessRestriction.effect.ts allow a@x.fr b@y.fr
 *   npx tsx src/scripts/adminAccessRestriction.effect.ts allow --file emails.txt     # un email par ligne
 *   npx tsx src/scripts/adminAccessRestriction.effect.ts revoke a@x.fr
 *   npx tsx src/scripts/adminAccessRestriction.effect.ts enable                      # refusé si la liste est vide
 *   npx tsx src/scripts/adminAccessRestriction.effect.ts disable                     # lève le verrouillage, garde la liste
 *
 * `--dry-run` affiche le résultat sans rien écrire.
 */

import fs from "fs";
import { Data, Effect } from "effect";
import { FeatureFlagName } from "snu-lib";

import { FeatureFlagModel, ReferentModel } from "../models";
import { logger } from "../logger";
import { initDB, closeDB } from "../mongo";

const FLAG_NAME = FeatureFlagName.ADMIN_ACCESS_RESTRICTED;
const FLAG_DESCRIPTION = "Verrouillage temporaire : seuls les référents de allowedReferentIds gardent l'accès (admin, apiv2, support)";

export type Command = { action: "status" } | { action: "enable" } | { action: "disable" } | { action: "allow" | "revoke"; emails: string[] };

export class UsageError extends Data.TaggedError("UsageError")<{ message: string }> {}
export class UnknownReferentsError extends Data.TaggedError("UnknownReferentsError")<{ emails: string[] }> {}
export class EmptyAllowlistError extends Data.TaggedError("EmptyAllowlistError")<{}> {}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const parseCommand = (argv: string[]): Effect.Effect<Command, UsageError> =>
  Effect.gen(function* () {
    const args = argv.filter((a) => a !== "--dry-run");
    const [action, ...rest] = args;
    if (action === "status" || action === "enable" || action === "disable") return { action };
    if (action === "allow" || action === "revoke") {
      const fileIndex = rest.indexOf("--file");
      const raw =
        fileIndex >= 0
          ? yield* Effect.try({
              try: () => fs.readFileSync(rest[fileIndex + 1], "utf8").split(/\r?\n/),
              catch: () => new UsageError({ message: `Fichier illisible : ${rest[fileIndex + 1]}` }),
            })
          : rest;
      const emails = [...new Set(raw.map(normalizeEmail).filter((e) => e && !e.startsWith("#")))];
      if (!emails.length) return yield* Effect.fail(new UsageError({ message: `Aucun email fourni pour « ${action} »` }));
      return { action, emails };
    }
    return yield* Effect.fail(new UsageError({ message: "Commande attendue : status | allow | revoke | enable | disable" }));
  });

const loadFlag = Effect.tryPromise(() => FeatureFlagModel.findOne({ name: FLAG_NAME }).lean());

const resolveReferentIds = (emails: string[]) =>
  Effect.gen(function* () {
    const referents = yield* Effect.tryPromise(() =>
      ReferentModel.find({ email: { $in: emails }, deletedAt: { $exists: false } })
        .select("_id email")
        .lean(),
    );
    const found = new Set(referents.map((r) => r.email));
    const unknown = emails.filter((e) => !found.has(e));
    if (unknown.length) return yield* Effect.fail(new UnknownReferentsError({ emails: unknown }));
    return referents.map((r) => r._id.toString());
  });

const describeAllowlist = (ids: string[]) =>
  Effect.gen(function* () {
    if (!ids.length) return "  (liste vide)";
    const referents = yield* Effect.tryPromise(() =>
      ReferentModel.find({ _id: { $in: ids } })
        .select("_id email firstName lastName role status")
        .lean(),
    );
    const byId = new Map(referents.map((r) => [r._id.toString(), r]));
    return ids
      .map((id) => {
        const r = byId.get(id);
        return r ? `  - ${r.email} (${r.firstName} ${r.lastName}, ${r.role}, ${r.status}) [${id}]` : `  - ${id} (référent introuvable)`;
      })
      .join("\n");
  });

const save = (update: { enabled?: boolean; allowedReferentIds?: string[] }, dryRun: boolean) =>
  dryRun
    ? Effect.void
    : Effect.tryPromise(() =>
        FeatureFlagModel.updateOne(
          { name: FLAG_NAME },
          { $set: { ...update, updatedAt: new Date() }, $setOnInsert: { name: FLAG_NAME, description: FLAG_DESCRIPTION, createdAt: new Date() } },
          { upsert: true },
        ),
      );

export const program = (command: Command, dryRun = false) =>
  Effect.gen(function* () {
    const mode = dryRun ? "[DRY RUN] " : "";
    const flag = yield* loadFlag;
    const current: string[] = (flag?.allowedReferentIds || []).map(String);

    switch (command.action) {
      case "allow": {
        const ids = yield* resolveReferentIds(command.emails);
        const next = [...new Set([...current, ...ids])];
        yield* save({ allowedReferentIds: next }, dryRun);
        logger.info(`${mode}${next.length - current.length} référent(s) ajouté(s), ${next.length} dans la liste`);
        break;
      }
      case "revoke": {
        const ids = new Set(yield* resolveReferentIds(command.emails));
        const next = current.filter((id) => !ids.has(id));
        yield* save({ allowedReferentIds: next }, dryRun);
        logger.info(`${mode}${current.length - next.length} référent(s) retiré(s), ${next.length} dans la liste`);
        if (flag?.enabled && !next.length) logger.warn(`${mode}Verrouillage actif avec une liste vide : plus aucun référent n'a accès.`);
        break;
      }
      case "enable": {
        // Garde-fou : activer sur une liste vide couperait l'accès à tout le monde, équipe comprise.
        if (!current.length) return yield* Effect.fail(new EmptyAllowlistError());
        yield* save({ enabled: true }, dryRun);
        logger.info(`${mode}Verrouillage ACTIVÉ : ${current.length} référent(s) gardent l'accès`);
        break;
      }
      case "disable": {
        yield* save({ enabled: false }, dryRun);
        logger.info(`${mode}Verrouillage LEVÉ : tous les référents retrouvent l'accès (liste conservée)`);
        break;
      }
      case "status":
        break;
    }

    const after = dryRun ? flag : yield* loadFlag;
    const state = after?.enabled ? "ACTIF" : "inactif";
    const window = after?.date?.from && after?.date?.to ? ` (fenêtre ${after.date.from.toISOString()} → ${after.date.to.toISOString()})` : "";
    logger.info(`Verrouillage ${state}${window}\n${yield* describeAllowlist((after?.allowedReferentIds || []).map(String))}`);
  });

const main = Effect.gen(function* () {
  const argv = process.argv.slice(2);
  const command = yield* parseCommand(argv);
  yield* Effect.acquireUseRelease(
    Effect.tryPromise(() => initDB()),
    () => program(command, argv.includes("--dry-run")),
    () => Effect.tryPromise(() => closeDB()).pipe(Effect.ignore),
  );
});

if (require.main === module) {
  Effect.runPromise(
    main.pipe(
      Effect.catchTags({
        UsageError: (e) => Effect.fail(e.message),
        UnknownReferentsError: (e) => Effect.fail(`Référent(s) introuvable(s), rien n'a été écrit : ${e.emails.join(", ")}`),
        EmptyAllowlistError: () => Effect.fail("Liste vide : ajouter des référents (allow) avant d'activer le verrouillage."),
      }),
    ),
  )
    .then(() => process.exit(0))
    .catch((e) => {
      logger.error(e);
      process.exit(1);
    });
}
