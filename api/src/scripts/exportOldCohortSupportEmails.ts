/**
 * Export des emails (jeune + parents) des cohortes à anonymiser, AVANT
 * l'anonymisation SNU (sinon les emails y sont déjà masqués).
 *
 * Sortie : un fichier JSON (tableau d'emails, minuscules + dédupliqués) consommé
 * par `snupport-api/src/scripts/anonymiseContacts.js` pour purger la trace support.
 *
 * Lecture seule côté SNU (n'écrit qu'un fichier local). Réutilise la liste de
 * cohortes partagée (anonymizeOldCohorts.helpers) — une seule source de vérité.
 *
 * Usage (depuis api/) :
 *   OUT_FILE=./emails.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 *   COHORTS="2019" OUT_FILE=./emails-2019.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 */
import fs from "fs";
import path from "path";

import { YoungModel } from "../models";
import { initDB, closeDB } from "../mongo";
import { logger } from "../logger";
import { resolveOldCohorts } from "./anonymizeOldCohorts.helpers";

const OUT_FILE = process.env.OUT_FILE || "./emails.json";

async function main() {
  await initDB();
  try {
    const cohorts = resolveOldCohorts();
    // anonymized != true : on ne veut que des emails réels. Un jeune déjà anonymisé
    // a un email placeholder, inutile (et inexploitable) côté support.
    const youngs = await YoungModel.find(
      { cohort: { $in: cohorts }, anonymized: { $ne: true } },
      { email: 1, parent1Email: 1, parent2Email: 1 },
    ).lean();

    const emails = [
      ...new Set(
        youngs
          .flatMap((y: any) => [y.email, y.parent1Email, y.parent2Email])
          .filter(Boolean)
          .map((e: string) => e.trim().toLowerCase())
          .filter((e: string) => !e.endsWith("@deleted.snu")), // exclut un placeholder déjà posé
      ),
    ];

    fs.writeFileSync(path.resolve(OUT_FILE), JSON.stringify(emails, null, 2));
    logger.info(
      `${youngs.length} jeunes (cohortes ${cohorts.join(", ")}) → ${emails.length} emails uniques écrits dans ${OUT_FILE}`,
    );
  } finally {
    await closeDB();
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  });
