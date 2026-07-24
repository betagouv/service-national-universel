/**
 * Export (lecture seule) des volontaires opt-out 2024-2025 et de leurs modèles liés,
 * un onglet Excel par modèle + représentants légaux (email + prénom) sur l'onglet Young.
 *
 * Lecture seule : n'écrit qu'un fichier Excel local. Ne JAMAIS modifier Mongo.
 * ⚠ PII en clair dans le .xlsx de sortie : fichier créé en 0600, à transférer par
 *   canal chiffré et à SUPPRIMER après usage.
 *
 * Usage (depuis api/) :
 *   EMAILS_FILE=./Optout-2024-2025-Volontaires.xlsx OUT_FILE=./export-optout.xlsx \
 *     npx tsx src/scripts/exportOptoutVolontaires.effect.ts
 *   LIMIT=100 DRY_RUN=true EMAILS_FILE=... npx tsx src/scripts/exportOptoutVolontaires.effect.ts
 */
import fs from "fs";
import path from "path";

import * as XLSX from "xlsx";
import { Effect } from "effect";

import { initDB, closeDB } from "../mongo";
import { logger } from "../logger";
import { EXPORT_MODELS } from "./exportOptoutVolontaires.fields";
import { normalizeEmail, youngColumns, modelColumns, buildRow, isObjectIdString } from "./exportOptoutVolontaires.helpers";
import { createExportWorkbook } from "./exportOptoutVolontaires.workbook";
import {
  findYoungsByEmails, findApplicationsByYoungIds, findEquivalencesByYoungIds,
  findMissionsByIds, findEtablissementsByIds, findClassesByIds, findMissionAPIByIds,
} from "./exportOptoutVolontaires.queries";

const EMAILS_FILE = process.env.EMAILS_FILE || "./Optout-2024-2025-Volontaires.xlsx";
const OUT_FILE = process.env.OUT_FILE || "./export-optout-volontaires.xlsx";
const CHUNK = Number(process.env.CHUNK || 1000);
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;
const DRY_RUN = process.env.DRY_RUN === "true";

// Nom d'onglet par modèle (libellés lisibles).
const SHEET: Record<(typeof EXPORT_MODELS)[number], string> = {
  young: "Young", application: "Application", missionEquivalence: "MissionEquivalence",
  mission: "Mission", etablissement: "Etablissement", classe: "Classe", missionAPI: "MissionAPI",
};

function readEmails(file: string): string[] {
  const wb = XLSX.readFile(path.resolve(file));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  const emails = [...new Set(rows.map((r) => normalizeEmail(r.EMAIL)).filter(Boolean))];
  return LIMIT ? emails.slice(0, LIMIT) : emails;
}

const addTo = (map: Map<string, Set<string>>, key: unknown, email: string) => {
  if (!key) return;
  const k = String(key);
  (map.get(k) ?? map.set(k, new Set()).get(k)!).add(email);
};

// Ne conserve que les références au format ObjectId et logue celles écartées (non-ObjectId :
// legacy/JVA/autre format). Les requêtes `_id: { $in }` de la phase B lèveraient sinon une
// CastError qui rejette toute la requête. Une référence non-ObjectId ne peut de toute façon
// correspondre à aucun `_id` : la journaliser (pas de silence) et l'ignorer est correct.
const validRefs = (label: string, ids: string[]): string[] => {
  const valid = ids.filter(isObjectIdString);
  if (valid.length < ids.length) {
    logger.info(`${label}: ${ids.length - valid.length} référence(s) non-ObjectId ignorée(s) sur ${ids.length}`);
  }
  return valid;
};

async function run(): Promise<void> {
  if (!Number.isInteger(CHUNK) || CHUNK <= 0) {
    throw new Error(`CHUNK invalide: "${process.env.CHUNK}" — attendu un entier > 0.`);
  }
  const emails = readEmails(EMAILS_FILE);
  if (emails.length === 0) {
    throw new Error("Aucun email lu — vérifier EMAILS_FILE et l'en-tête de colonne 'EMAIL'.");
  }
  logger.info(`Emails à traiter: ${emails.length} (fichier ${EMAILS_FILE}${LIMIT ? `, LIMIT=${LIMIT}` : ""})`);

  const counts: Record<string, number> = { Young: 0, Application: 0, MissionEquivalence: 0, Mission: 0, Etablissement: 0, Classe: 0, MissionAPI: 0 };
  const foundEmails = new Set<string>();
  const missionEmails = new Map<string, Set<string>>();
  const classeEmails = new Map<string, Set<string>>();
  const etabEmails = new Map<string, Set<string>>();

  // Écriture sur un fichier temporaire : un run qui échoue/est interrompu ne doit
  // jamais laisser à OUT_FILE un fichier partiel qui ressemblerait à un export complet.
  const tmpOut = OUT_FILE + ".tmp";
  const wb = createExportWorkbook(tmpOut);
  try {
    wb.openSheet(SHEET.young, youngColumns());
    wb.openSheet(SHEET.application, modelColumns("application"));
    wb.openSheet(SHEET.missionEquivalence, modelColumns("missionEquivalence"));
    wb.openSheet(SHEET.mission, modelColumns("mission"));
    wb.openSheet(SHEET.etablissement, modelColumns("etablissement"));
    wb.openSheet(SHEET.classe, modelColumns("classe"));
    wb.openSheet(SHEET.missionAPI, modelColumns("missionAPI"));

    // --- Phase A : onglets rattachés au young, par paquets d'emails ---
    for (let i = 0; i < emails.length; i += CHUNK) {
      const part = emails.slice(i, i + CHUNK);
      const youngs = await findYoungsByEmails(part, CHUNK);
      const emailById = new Map<string, string>();
      for (const y of youngs) {
        const email = normalizeEmail(y.email);
        foundEmails.add(email);
        emailById.set(String(y._id), email);
        wb.writeRow(SHEET.young, buildRow(y, youngColumns()));
        counts.Young++;
        addTo(classeEmails, y.classeId, email);
        addTo(etabEmails, y.etablissementId, email);
      }
      const youngIds = youngs.map((y) => String(y._id));

      for (const a of await findApplicationsByYoungIds(youngIds, CHUNK)) {
        const email = normalizeEmail(a.youngEmail) || emailById.get(String(a.youngId)) || "";
        wb.writeRow(SHEET.application, buildRow({ ...a, youngEmail: email }, modelColumns("application")));
        counts.Application++;
        addTo(missionEmails, a.missionId, email);
      }
      for (const e of await findEquivalencesByYoungIds(youngIds, CHUNK)) {
        const email = emailById.get(String(e.youngId)) || "";
        wb.writeRow(SHEET.missionEquivalence, buildRow({ ...e, youngEmail: email }, modelColumns("missionEquivalence")));
        counts.MissionEquivalence++;
      }
      logger.info(`Phase A: ${Math.min(i + CHUNK, emails.length)}/${emails.length} emails traités`);
    }

    // --- Phase B : onglets référentiels dédupliqués ---
    const apiEmails = new Map<string, Set<string>>();
    for (const m of await findMissionsByIds(validRefs("Mission", [...missionEmails.keys()]), CHUNK)) {
      const emailsForMission = [...(missionEmails.get(String(m._id)) ?? new Set())];
      wb.writeRow(SHEET.mission, buildRow({ ...m, youngEmail: emailsForMission.join("; ") }, modelColumns("mission")));
      counts.Mission++;
      if (m.apiEngagementId) for (const em of emailsForMission) addTo(apiEmails, m.apiEngagementId, em);
    }
    for (const c of await findClassesByIds(validRefs("Classe", [...classeEmails.keys()]), CHUNK)) {
      wb.writeRow(SHEET.classe, buildRow({ ...c, youngEmail: [...(classeEmails.get(String(c._id)) ?? [])].join("; ") }, modelColumns("classe")));
      counts.Classe++;
    }
    for (const et of await findEtablissementsByIds(validRefs("Etablissement", [...etabEmails.keys()]), CHUNK)) {
      wb.writeRow(SHEET.etablissement, buildRow({ ...et, youngEmail: [...(etabEmails.get(String(et._id)) ?? [])].join("; ") }, modelColumns("etablissement")));
      counts.Etablissement++;
    }
    for (const ma of await findMissionAPIByIds(validRefs("MissionAPI", [...apiEmails.keys()]), CHUNK)) {
      wb.writeRow(SHEET.missionAPI, buildRow({ ...ma, youngEmail: [...(apiEmails.get(String(ma._id)) ?? [])].join("; ") }, modelColumns("missionAPI")));
      counts.MissionAPI++;
    }

    for (const model of EXPORT_MODELS) await wb.commitSheet(SHEET[model]);
    await wb.commit();
    // Succès uniquement à partir d'ici : bascule atomique du temporaire vers OUT_FILE.
    fs.renameSync(path.resolve(tmpOut), path.resolve(OUT_FILE));
    try { fs.chmodSync(path.resolve(OUT_FILE), 0o600); } catch { /* best-effort */ }
  } catch (e) {
    // Échec/interruption : jamais de fichier partiel visible sous OUT_FILE ni sous le temporaire.
    try {
      if (fs.existsSync(path.resolve(tmpOut))) fs.unlinkSync(path.resolve(tmpOut));
    } catch {
      /* best-effort : ne pas masquer l'erreur d'origine */
    }
    throw e;
  }

  const notFound = emails.filter((e) => !foundEmails.has(e));
  logger.info(`Export terminé -> ${OUT_FILE}`);
  logger.info(`Lignes par onglet: ${JSON.stringify(counts)}`);
  logger.info(`Emails non trouvés: ${notFound.length}/${emails.length}`);
  if (notFound.length) {
    const nfFile = OUT_FILE.replace(/\.xlsx$/, "") + ".emails-non-trouves.txt";
    fs.writeFileSync(path.resolve(nfFile), notFound.join("\n"), { mode: 0o600 });
    logger.info(`Liste des non trouvés: ${nfFile}`);
  }
}

const main = Effect.acquireUseRelease(
  Effect.tryPromise(() => initDB()),
  () => (DRY_RUN
    ? Effect.tryPromise(async () => {
        const emails = readEmails(EMAILS_FILE);
        const sample = emails.slice(0, Math.min(CHUNK, emails.length));
        const youngs = await findYoungsByEmails(sample, CHUNK);
        logger.info(`[DRY_RUN] ${emails.length} emails ; échantillon ${sample.length} -> ${youngs.length} youngs matchés. Aucun fichier écrit.`);
      })
    : Effect.tryPromise(() => run())),
  () => Effect.tryPromise(() => closeDB()).pipe(Effect.ignore),
);

if (require.main === module) {
  Effect.runPromise(main)
    .then(() => process.exit(0))
    .catch((e) => {
      // `logger.error(e)` sérialise le FiberFailure Effect en `{"name":"UnknownException"}`
      // et masque la cause. `console.error(e)` en rend l'arbre complet (erreur réelle + stack).
      logger.error("Export échoué — détail ci-dessous :");
      console.error(e);
      process.exit(1);
    });
}

export { main, run, readEmails };
