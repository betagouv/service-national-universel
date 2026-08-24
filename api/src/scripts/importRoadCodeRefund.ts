/**
 * Import remboursement code de la route depuis une liste récap La Poste (xlsx).
 *
 * Matching : nom (collation FR) + prénom + date de naissance.
 * Attribution : statusPhase2 === VALIDATED, comme le bouton admin.
 * Dry-run par défaut. Les lignes non traitées sont exportées en CSV (0600, gitignoré).
 *
 * Usage (depuis api/) :
 *   INPUT_FILE=".../liste.xlsx" npx tsx src/scripts/importRoadCodeRefund.ts
 *   INPUT_FILE=... DRY_RUN=false ORGANIZATION="LA POSTE" npx tsx src/scripts/importRoadCodeRefund.ts
 */
import fs from "fs";
import path from "path";

import { Data, Effect, Ref } from "effect";
import * as XLSX from "xlsx";
import { YOUNG_STATUS } from "snu-lib";

import { YoungModel } from "../models";
import { initDB, closeDB } from "../mongo";
import { logger } from "../logger";
import {
  BeneficiaryRow,
  UNMATCHED_CSV_HEADER,
  UnmatchedReason,
  YoungMatchCandidate,
  decideMatch,
  parseBeneficiaryRows,
  unmatchedCsvLine,
} from "./importRoadCodeRefund.helpers";

const INPUT_FILE = process.env.INPUT_FILE;
const DRY_RUN_RAW = process.env.DRY_RUN;
const DRY_RUN = DRY_RUN_RAW !== "false";
const ORGANIZATION = process.env.ORGANIZATION || "LA POSTE";
const UNMATCHED_FILE = process.env.UNMATCHED_FILE || "./road-code-refund-unmatched.csv";

class ConfigError extends Data.TaggedError("ConfigError")<{ reason: string }> {}
class FileError extends Data.TaggedError("FileError")<{ reason: string; cause?: unknown }> {}
class DbError extends Data.TaggedError("DbError")<{ cause: unknown }> {}

type RowOutcome =
  | { _tag: "MATCH" }
  | { _tag: "ALREADY" }
  | { _tag: "REIMBURSED" }
  | { _tag: "UNMATCHED"; reason: UnmatchedReason; line: string };

type Stats = {
  total: number;
  match: number;
  already: number;
  reimbursed: number;
  notFound: number;
  ambiguous: number;
  phase2: number;
  errors: number;
};

const emptyStats = (total: number): Stats => ({
  total,
  match: 0,
  already: 0,
  reimbursed: 0,
  notFound: 0,
  ambiguous: 0,
  phase2: 0,
  errors: 0,
});

const accumulate = (stats: Stats, outcome: RowOutcome): Stats => {
  if (outcome._tag === "MATCH") {
    return { ...stats, match: stats.match + 1 };
  }
  if (outcome._tag === "ALREADY") {
    return { ...stats, already: stats.already + 1 };
  }
  if (outcome._tag === "REIMBURSED") {
    return { ...stats, match: stats.match + 1, reimbursed: stats.reimbursed + 1 };
  }
  if (outcome.reason === "NOT_FOUND") {
    return { ...stats, notFound: stats.notFound + 1 };
  }
  if (outcome.reason === "AMBIGUOUS") {
    return { ...stats, ambiguous: stats.ambiguous + 1 };
  }
  if (outcome.reason === "PHASE2_NOT_VALIDATED") {
    return { ...stats, phase2: stats.phase2 + 1 };
  }
  return { ...stats, errors: stats.errors + 1 };
};

const readSheets = (filePath: string) =>
  Effect.try({
    try: () => {
      const workbook = XLSX.readFile(filePath, { cellDates: true });
      return workbook.SheetNames.map((name) =>
        XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(workbook.Sheets[name], { header: 1, raw: true, defval: null }),
      );
    },
    catch: (cause) => new FileError({ reason: `Lecture xlsx impossible : ${filePath}`, cause }),
  });

const findCandidates = (row: BeneficiaryRow) =>
  Effect.tryPromise({
    try: async (): Promise<YoungMatchCandidate[]> => {
      const docs = await YoungModel.find({
        lastName: row.lastName,
        anonymized: { $ne: true },
        status: { $ne: YOUNG_STATUS.DELETED },
      })
        .collation({ locale: "fr", strength: 1 })
        .select({ firstName: 1, lastName: 1, birthdateAt: 1, statusPhase2: 1, roadCodeRefund: 1 })
        .lean();
      return docs.map((young) => ({ ...young, _id: String(young._id) }));
    },
    catch: (cause) => new DbError({ cause }),
  });

const reimburseYoung = (id: string) =>
  Effect.tryPromise({
    try: async () => {
      const young = await YoungModel.findById(id);
      if (!young) {
        throw new Error("jeune introuvable au moment du save");
      }
      young.set({
        roadCodeRefund: "true",
        roadCodeRefundDate: new Date(),
        roadCodeRefundOrganization: ORGANIZATION,
      });
      await young.save();
    },
    catch: (cause) => new DbError({ cause }),
  });

const unmatched = (row: BeneficiaryRow, reason: UnmatchedReason, young?: YoungMatchCandidate): RowOutcome => ({
  _tag: "UNMATCHED",
  reason,
  line: unmatchedCsvLine(row, reason, young),
});

const processRow = (row: BeneficiaryRow) =>
  Effect.gen(function* () {
    const candidates = yield* findCandidates(row);
    const decision = decideMatch(row, candidates);
    if (decision.status === "NOT_FOUND") {
      return unmatched(row, "NOT_FOUND");
    }
    if (decision.status === "AMBIGUOUS") {
      return unmatched(row, "AMBIGUOUS");
    }
    if (decision.status === "PHASE2_NOT_VALIDATED") {
      return unmatched(row, "PHASE2_NOT_VALIDATED", decision.youngs[0]);
    }
    if (decision.status === "ALREADY") {
      return { _tag: "ALREADY" } as const;
    }
    if (DRY_RUN) {
      return { _tag: "MATCH" } as const;
    }
    yield* reimburseYoung(decision.young._id);
    return { _tag: "REIMBURSED" } as const;
  }).pipe(Effect.catchAll(() => Effect.succeed(unmatched(row, "SAVE_ERROR"))));

const writeUnmatchedFile = (lines: string[]) =>
  Effect.try({
    try: () => {
      const unmatchedPath = path.resolve(UNMATCHED_FILE);
      if (lines.length > 0) {
        fs.writeFileSync(unmatchedPath, [UNMATCHED_CSV_HEADER, ...lines].join("\n") + "\n", { mode: 0o600 });
        return unmatchedPath;
      }
      if (fs.existsSync(unmatchedPath)) {
        fs.unlinkSync(unmatchedPath);
      }
      return null;
    },
    catch: (cause) => new FileError({ reason: "Écriture du CSV des non traités impossible", cause }),
  });

const loadRows = (inputPath: string) =>
  Effect.gen(function* () {
    const sheets = yield* readSheets(inputPath);
    const rows = parseBeneficiaryRows(sheets);
    if (rows.length === 0) {
      return yield* Effect.fail(new FileError({ reason: "Aucune ligne bénéficiaire (en-tête Nom/Prénoms des bénéficiaires introuvable)." }));
    }
    return rows;
  });

const processRows = (rows: BeneficiaryRow[]) =>
  Effect.gen(function* () {
    const showProgress = Boolean(process.stdout.isTTY);
    const processed = yield* Ref.make(0);
    const outcomes = yield* Effect.forEach(
      rows,
      (row) =>
        processRow(row).pipe(
          Effect.tap(() =>
            Ref.updateAndGet(processed, (n) => n + 1).pipe(
              Effect.flatMap((n) => (showProgress ? Effect.sync(() => process.stdout.write(`\r${n}/${rows.length}`)) : Effect.void)),
            ),
          ),
        ),
      { concurrency: 1 },
    );
    if (showProgress) {
      yield* Effect.sync(() => process.stdout.write("\n"));
    }
    return outcomes;
  });

const program = Effect.gen(function* () {
  if (DRY_RUN_RAW !== undefined && !["true", "false"].includes(DRY_RUN_RAW)) {
    return yield* Effect.fail(new ConfigError({ reason: `DRY_RUN="${DRY_RUN_RAW}" non reconnu — utiliser DRY_RUN=true ou DRY_RUN=false.` }));
  }
  if (!INPUT_FILE) {
    return yield* Effect.fail(
      new ConfigError({ reason: "INPUT_FILE manquant. Exemple : INPUT_FILE=/chemin/liste.xlsx npx tsx src/scripts/importRoadCodeRefund.ts" }),
    );
  }
  const inputPath = path.resolve(INPUT_FILE);
  if (!fs.existsSync(inputPath)) {
    return yield* Effect.fail(new FileError({ reason: `Fichier introuvable : ${inputPath}` }));
  }

  const rows = yield* loadRows(inputPath);
  const outcomes = yield* Effect.acquireUseRelease(
    Effect.tryPromise({
      try: () => initDB(),
      catch: (cause) => new DbError({ cause }),
    }),
    () => processRows(rows),
    () => Effect.tryPromise(() => closeDB()).pipe(Effect.ignore),
  );

  const stats = outcomes.reduce(accumulate, emptyStats(rows.length));
  const unmatchedLines = outcomes.flatMap((outcome) => (outcome._tag === "UNMATCHED" ? [outcome.line] : []));
  const unmatchedFile = yield* writeUnmatchedFile(unmatchedLines);

  logger.info(
    JSON.stringify({
      ok: stats.errors === 0,
      dryRun: DRY_RUN,
      organization: ORGANIZATION,
      input: inputPath,
      unmatchedFile,
      ...stats,
    }),
  );
});

if (require.main === module) {
  Effect.runPromise(program)
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
}

export { program };
