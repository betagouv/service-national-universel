/**
 * Suggestions de dossiers proches pour les NOT_FOUND d'un import code de la route.
 * Lecture seule : aucun remboursement n'est écrit.
 *
 * Usage (depuis api/) :
 *   npx tsx src/scripts/suggestRoadCodeRefundMatches.ts
 *   ERRORS_FILES=./road-code-refund-errors-mars26.csv,./road-code-refund-errors-mai26.csv npx tsx src/scripts/suggestRoadCodeRefundMatches.ts
 */
import fs from "fs";
import path from "path";

import { YOUNG_STATUS } from "snu-lib";

import { YoungModel } from "../models";
import { initDB, closeDB } from "../mongo";
import { logger } from "../logger";
import {
  BeneficiaryRow,
  YoungMatchCandidate,
  csvEscape,
  nameTokens,
  parseExcelDate,
  rankCloseCandidates,
  repairMojibake,
  toYmd,
} from "./importRoadCodeRefund.helpers";

const SUGGESTIONS_FILE = process.env.SUGGESTIONS_FILE || "./road-code-refund-suggestions.csv";
const DEFAULT_ERRORS_GLOB = "road-code-refund-errors-*.csv";

type ErrorRow = BeneficiaryRow & { source: string };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function defaultErrorFiles(): string[] {
  if (process.env.ERRORS_FILES) {
    return process.env.ERRORS_FILES.split(",").map((file) => path.resolve(file.trim()));
  }
  return fs
    .readdirSync(process.cwd())
    .filter((file) => file.startsWith("road-code-refund-errors-") && file.endsWith(".csv"))
    .map((file) => path.resolve(file));
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function loadNotFoundRows(filePath: string): ErrorRow[] {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) {
    return [];
  }
  const header = parseCsvLine(lines[0]);
  const index = Object.fromEntries(header.map((cell, i) => [cell, i]));
  const source = path.basename(filePath);
  return lines.slice(1).flatMap((line) => {
    const cells = parseCsvLine(line);
    if (cells[index.raison] !== "NOT_FOUND") {
      return [];
    }
    const lastName = repairMojibake(cells[index.nom] ?? "");
    const firstName = repairMojibake(cells[index.prenoms] ?? "");
    const birthdate = parseExcelDate(cells[index.dateNaissance] ?? "");
    return [
      {
        source,
        line: Number(cells[index.ligne] ?? 0),
        lastName,
        firstName,
        birthdate: birthdate ?? undefined,
      },
    ];
  });
}

function birthdateQueryRangeWide(excelBirthdate: Date): { $gte: Date; $lt: Date } {
  const year = excelBirthdate.getFullYear();
  const month = excelBirthdate.getMonth();
  const day = excelBirthdate.getDate();
  return {
    $gte: new Date(Date.UTC(year, month, day - 7)),
    $lt: new Date(Date.UTC(year, month, day + 8)),
  };
}

async function findCandidates(row: BeneficiaryRow): Promise<YoungMatchCandidate[]> {
  const lastTokens = nameTokens(row.lastName).filter((token) => token.length >= 3);
  const firstToken = nameTokens(row.firstName).find((token) => token.length >= 3);
  const clauses: Record<string, unknown>[] = lastTokens.map((token) => ({
    lastName: { $regex: `^${escapeRegex(token)}`, $options: "i" },
  }));
  if (firstToken && row.birthdate) {
    clauses.push({
      firstName: { $regex: `^${escapeRegex(firstToken)}`, $options: "i" },
      birthdateAt: birthdateQueryRangeWide(row.birthdate),
    });
  }
  if (clauses.length === 0) {
    return [];
  }
  const docs = await YoungModel.find({
    anonymized: { $ne: true },
    status: { $ne: YOUNG_STATUS.DELETED },
    $or: clauses,
  })
    .select({ firstName: 1, lastName: 1, birthdateAt: 1, statusPhase2: 1, roadCodeRefund: 1, status: 1, cohort: 1 })
    .limit(80)
    .lean();
  return docs.map((young) => ({ ...young, _id: String(young._id) }));
}

const SUGGESTIONS_HEADER = [
  "source",
  "ligne",
  "nom",
  "prenoms",
  "dateNaissance",
  "score",
  "raisons",
  "youngId",
  "youngNom",
  "youngPrenoms",
  "youngDateNaissance",
  "statusPhase2",
  "status",
  "cohort",
  "roadCodeRefund",
  "adminUrl",
].join(",");

function suggestionLine(row: ErrorRow, match: ReturnType<typeof rankCloseCandidates>[number]): string {
  const birthdate = match.young.birthdateAt ? new Date(match.young.birthdateAt) : undefined;
  return [
    csvEscape(row.source),
    csvEscape(row.line),
    csvEscape(row.lastName),
    csvEscape(row.firstName),
    csvEscape(row.birthdate ? toYmd(row.birthdate, false) : ""),
    csvEscape(match.score),
    csvEscape(match.reasons.join("|")),
    csvEscape(match.young._id),
    csvEscape(match.young.lastName),
    csvEscape(match.young.firstName),
    csvEscape(birthdate && !Number.isNaN(birthdate.getTime()) ? toYmd(birthdate, true) : ""),
    csvEscape(match.young.statusPhase2),
    csvEscape(match.young.status),
    csvEscape(match.young.cohort),
    csvEscape(match.young.roadCodeRefund),
    csvEscape(`https://admin.snu.gouv.fr/volontaire/${match.young._id}`),
  ].join(",");
}

async function main() {
  const files = defaultErrorFiles();
  if (files.length === 0) {
    throw new Error(`Aucun CSV d'erreurs (${DEFAULT_ERRORS_GLOB}).`);
  }
  const rows = files.flatMap(loadNotFoundRows);
  await initDB();
  const lines: string[] = [];
  let withSuggestion = 0;
  try {
    for (const row of rows) {
      const ranked = rankCloseCandidates(row, await findCandidates(row));
      if (ranked.length === 0) {
        continue;
      }
      withSuggestion += 1;
      for (const match of ranked) {
        lines.push(suggestionLine(row, match));
      }
    }
  } finally {
    await closeDB();
  }
  const outputPath = path.resolve(SUGGESTIONS_FILE);
  fs.writeFileSync(outputPath, [SUGGESTIONS_HEADER, ...lines].join("\n") + "\n", { mode: 0o600 });
  logger.info(JSON.stringify({ ok: true, notFound: rows.length, withSuggestion, suggestionRows: lines.length, output: outputPath, sources: files.map((file) => path.basename(file)) }));
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(error);
      process.exit(1);
    });
}
