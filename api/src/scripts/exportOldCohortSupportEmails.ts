/**
 * Export des emails (jeune + parents) des cohortes à anonymiser, AVANT
 * l'anonymisation SNU (sinon les emails y sont déjà masqués — ordre impératif,
 * cf. snupport-api/docs/purge-contacts-support.md).
 *
 * Sortie : un fichier JSON (tableau d'emails, minuscules + dédupliqués) consommé
 * par `snupport-api/src/scripts/purgeContacts.js` pour purger la trace support.
 * ⚠ PII en clair : fichier créé en 0600 et gitignoré (`emails*.json`) — à transférer
 * par canal chiffré et à SUPPRIMER des deux machines après la purge.
 *
 * Garde-fou « email partagé » (fratries/référents) : un email encore rattaché à un
 * dossier actif hors périmètre est EXCLU — la purge support hard-delete TOUS les
 * tickets du contact, y compris ceux d'un enfant actif ou d'un compte référent.
 *
 * Lecture seule côté SNU (n'écrit qu'un fichier local). Réutilise la liste de
 * cohortes partagée (anonymizeOldCohorts.helpers) — une seule source de vérité.
 *
 * Usage (depuis api/) :
 *   OUT_FILE=./emails.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 *   COHORTS="2019" OUT_FILE=./emails-2019.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 *   POPULATION=attente-affectation OUT_FILE=./emails-attente.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
 *   # Même sélecteur que anonymizeOldCohorts (POPULATION et COHORTS exclusifs).
 */
import fs from "fs";
import path from "path";

import { YoungModel } from "../models";
import { initDB, closeDB } from "../mongo";
import { logger } from "../logger";
import { getProtectedEmails } from "../services/rgpdEmailGuard";
import { resolveSelection } from "./anonymizeOldCohorts.helpers";

const OUT_FILE = process.env.OUT_FILE || "./emails.json";

async function main() {
  await initDB();
  try {
    // Même sélection que l'anonymisation (source unique) : population nommée ou cohortes.
    // resolveSelection lève sur sélecteur invalide/vide → remonte au catch (log + exit 1).
    const selection = resolveSelection();

    // matchFilter porte déjà anonymized != true : on ne veut que des emails réels
    // (un jeune déjà anonymisé a un email placeholder, inutile côté support).
    const youngs = await YoungModel.find(selection.matchFilter, { email: 1, parent1Email: 1, parent2Email: 1 }).lean();

    const candidates = [
      ...new Set(
        youngs
          .flatMap((y: any) => [y.email, y.parent1Email, y.parent2Email])
          .filter(Boolean)
          .map((e: string) => e.trim().toLowerCase())
          // Exclut les deux générations de placeholders de soft-delete (l'actuelle
          // @deleted.snu et l'historique <id>@delete.com) : du bruit qui gonflerait
          // `skipped` côté purge et masquerait les vrais ratés.
          .filter((e: string) => !e.endsWith("@deleted.snu") && !e.endsWith("@delete.com")),
      ),
    ];

    // Garde-fou « email partagé » : ne jamais cibler un email encore rattaché à un
    // dossier actif hors périmètre (fratrie avec un enfant d'une cohorte récente,
    // jeune devenu référent). cf. services/rgpdEmailGuard.
    const protectedEmails = await getProtectedEmails(selection.guardComplement);
    const emails = candidates.filter((e) => !protectedEmails.has(e));
    const excluded = candidates.length - emails.length;

    // 0600 : PII en clair — lisible par l'opérateur seul.
    fs.writeFileSync(path.resolve(OUT_FILE), JSON.stringify(emails, null, 2), { mode: 0o600 });
    logger.info(
      `${youngs.length} jeunes (${selection.label}) → ${emails.length} emails uniques écrits dans ${OUT_FILE}` +
        ` (${excluded} exclus car partagés avec un dossier actif hors périmètre ou un référent)`,
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
