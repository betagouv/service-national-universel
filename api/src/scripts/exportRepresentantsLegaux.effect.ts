/**
 * Export (lecture seule) des représentants légaux : pour une liste d'emails RL,
 * produit un fichier Excel à 2 colonnes (email, prénom). Le prénom est retrouvé
 * en base via les champs parent1/parent2 des documents `young` (pas de collection
 * RL dédiée). Une ligne par email de la liste ; prénom vide si introuvable.
 *
 * Lecture seule : n'écrit qu'un fichier Excel local. Ne JAMAIS modifier Mongo.
 * ⚠ PII en clair dans le .xlsx de sortie : fichier créé en 0600, à transférer par
 *   canal chiffré et à SUPPRIMER après usage.
 *
 * Usage (depuis api/) :
 *   EMAILS_FILE=./Optout-2024-2025-RLs.xlsx OUT_FILE=./export-rl.xlsx \
 *     npx tsx src/scripts/exportRepresentantsLegaux.effect.ts
 *   LIMIT=100 DRY_RUN=true EMAILS_FILE=... npx tsx src/scripts/exportRepresentantsLegaux.effect.ts
 */
import fs from "fs";
import path from "path";

import * as XLSX from "xlsx";
import { Effect } from "effect";

import { initDB, closeDB } from "../mongo";
import { logger } from "../logger";
import { normalizeEmail } from "./exportOptoutVolontaires.helpers";
import { createExportWorkbook } from "./exportOptoutVolontaires.workbook";
import { findRepresentantFirstNames } from "./exportRepresentantsLegaux.queries";

const EMAILS_FILE = process.env.EMAILS_FILE || "./Optout-2024-2025-RLs.xlsx";
const OUT_FILE = process.env.OUT_FILE || "./export-representants-legaux.xlsx";
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;
const DRY_RUN = process.env.DRY_RUN === "true";

const SHEET_RL = "RepresentantsLegaux";

function readEmails(file: string): string[] {
  const wb = XLSX.readFile(path.resolve(file));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  const emails = [...new Set(rows.map((r) => normalizeEmail(r.EMAIL)).filter(Boolean))];
  return LIMIT ? emails.slice(0, LIMIT) : emails;
}

async function run(): Promise<void> {
  const emails = readEmails(EMAILS_FILE);
  if (emails.length === 0) {
    throw new Error("Aucun email lu — vérifier EMAILS_FILE et l'en-tête de colonne 'EMAIL'.");
  }
  logger.info(`RL à traiter: ${emails.length}. Recherche des prénoms en base (1 passe ; parent1Email/parent2Email non indexés, peut prendre un moment)…`);
  const firstNames = await findRepresentantFirstNames(emails);
  logger.info(`Prénoms trouvés: ${firstNames.size}/${emails.length}`);

  // Écriture sur un fichier temporaire : un run qui échoue ne doit pas laisser
  // à OUT_FILE un fichier partiel pris pour un export complet.
  const tmpOut = OUT_FILE + ".tmp";
  const wb = createExportWorkbook(tmpOut);
  try {
    wb.openSheet(SHEET_RL, ["email", "prenom"]);
    let withName = 0;
    for (const email of emails) {
      const prenom = firstNames.get(email) || "";
      wb.writeRow(SHEET_RL, { email, prenom });
      if (prenom) withName++;
    }
    await wb.commitSheet(SHEET_RL);
    await wb.commit();
    fs.renameSync(path.resolve(tmpOut), path.resolve(OUT_FILE));
    try { fs.chmodSync(path.resolve(OUT_FILE), 0o600); } catch { /* best-effort */ }
    logger.info(`Export terminé -> ${OUT_FILE} (${emails.length} lignes, ${withName} avec prénom, ${emails.length - withName} sans)`);
  } catch (e) {
    try {
      if (fs.existsSync(path.resolve(tmpOut))) fs.unlinkSync(path.resolve(tmpOut));
    } catch {
      /* best-effort : ne pas masquer l'erreur d'origine */
    }
    throw e;
  }
}

const main = Effect.acquireUseRelease(
  Effect.tryPromise(() => initDB()),
  () => (DRY_RUN
    ? Effect.tryPromise(async () => {
        const emails = readEmails(EMAILS_FILE);
        logger.info(`[DRY_RUN] ${emails.length} emails RL lus depuis ${EMAILS_FILE}. Aucune requête base ni fichier écrit.`);
      })
    : Effect.tryPromise(() => run())),
  () => Effect.tryPromise(() => closeDB()).pipe(Effect.ignore),
);

if (require.main === module) {
  Effect.runPromise(main)
    .then(() => process.exit(0))
    .catch((e) => {
      logger.error("Export RL échoué — détail ci-dessous :");
      console.error(e);
      process.exit(1);
    });
}

export { main, run, readEmails };
