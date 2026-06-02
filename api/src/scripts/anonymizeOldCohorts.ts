/**
 * Script one-shot — Anonymisation RGPD de cohortes anciennes
 *
 * PRÉREQUIS : effectuer un mongodump complet avant toute exécution sur la production.
 *   mongodump --uri="$MONGO_URL" --out=/backup/$(date +%Y%m%d_%H%M%S)
 *
 * Usage :
 *   DRY_RUN=true  node -r ts-node/register src/scripts/anonymizeOldCohorts.ts
 *   node -r ts-node/register src/scripts/anonymizeOldCohorts.ts
 */

import { ApplicationModel, ContractModel, YoungModel } from "../models";
import { deleteContact, getContact, BREVO_ERROR_TEMPLATE_NOT_FOUND } from "../brevo";
import { rateLimiterContactSIB, rateLimiterDeleteContactSIB } from "../rateLimiters";
import { config } from "../config";
import { capture } from "../sentry";
import { logger } from "../logger";
import { startSession, withTransaction, endSession, initDB, closeDB } from "../mongo";
import { listFiles, deleteFilesByList } from "../utils/index";
import slack from "../slack";
import { YOUNG_STATUS } from "snu-lib";

const anonymizeApplication = require("../anonymization/application");
const anonymizeContract = require("../anonymization/contract");

const DRY_RUN = process.env.DRY_RUN === "true" || process.argv.includes("--dry-run");
const BATCH_SIZE = 30;
// Liste explicite (vs $regex) : non ambiguë et robuste à de futures cohortes contenant
// "2022" en sous-chaîne. Issue de db.youngs.distinct("cohort") au 2026-06.
const DEFAULT_OLD_COHORTS = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022"];
// Override ponctuel pour un test ciblé (ex. staging) : COHORTS="2019".
const OLD_COHORTS = process.env.COHORTS ? process.env.COHORTS.split(",").map((c) => c.trim()).filter(Boolean) : DEFAULT_OLD_COHORTS;
if (OLD_COHORTS.length === 0) {
  throw new Error("COHORTS est défini mais vide après parsing — abandon (un $in:[] n'anonymiserait rien silencieusement).");
}

const buildQuery = () => ({
  cohort: { $in: OLD_COHORTS },
  anonymized: { $ne: true },
});

const deleteS3Files = async (youngId: string): Promise<void> => {
  try {
    const files = await listFiles(`app/young/${youngId}/`);
    if (files && files.length > 0) {
      const fileList = files.map((f: any) => ({ Key: f.Key }));
      await deleteFilesByList(fileList);
      logger.debug(`Deleted ${fileList.length} S3 files for young ${youngId}`);
    }
  } catch (e: any) {
    capture(e, { extra: { youngId } });
    logger.warn(`Failed to delete S3 files for young ${youngId}: ${e.message}`);
  }
};

const deleteAllPatches = async (young: any, session: any): Promise<void> => {
  const YoungPatch = young.patches;
  await YoungPatch.collection.deleteMany({ ref: young._id }, { session });
};

const anonymizeApplicationsForYoung = async (youngId: string, session: any): Promise<void> => {
  const applications = await ApplicationModel.find({ youngId }).session(session);
  for (const app of applications) {
    const anonymized = anonymizeApplication(app.toObject());
    app.set(anonymized);
    await app.save({ session, fromUser: { firstName: "Script anonymizeOldCohorts" } });
    // Supprimer les patches créés par le save (contiennent les PII originales via trackOriginalValue)
    await (app as any).patches.collection.deleteMany({ ref: app._id }, { session });
  }
};

const anonymizeContractsForYoung = async (youngId: string, session: any): Promise<void> => {
  const contracts = await ContractModel.find({ youngId }).session(session);
  for (const contract of contracts) {
    const anonymized = anonymizeContract(contract.toObject());
    contract.set(anonymized);
    await contract.save({ session, fromUser: { firstName: "Script anonymizeOldCohorts" } });
    await (contract as any).patches.collection.deleteMany({ ref: contract._id }, { session });
  }
};

// Supprime les contacts Brevo PUIS vérifie leur absence. api() avale les erreurs,
// on ne peut pas se fier à une exception : seule la vérification positive est fiable.
// throw si un contact subsiste => le jeune n'est pas marqué anonymized et sera rejoué.
const purgeBrevoContacts = async (emails: (string | undefined)[]): Promise<void> => {
  if (config.ENVIRONMENT !== "production") return; // miroir du garde-fou de unsync()
  for (const email of [...new Set(emails.filter((e): e is string => Boolean(e)))]) {
    await rateLimiterDeleteContactSIB.call(() => deleteContact(email));
    // On ne se fie pas au retour de deleteContact : api() renvoie `true` sur toute réponse
    // non-JSON (y compris 429/503). Seul un getContact => document_not_found confirme l'absence.
    const check: any = await rateLimiterContactSIB.call(() => getContact(email));
    if (check?.code !== BREVO_ERROR_TEMPLATE_NOT_FOUND) {
      throw new Error(`Brevo: contact ${email} toujours présent après suppression`);
    }
  }
};

const processYoung = async (young: any): Promise<boolean> => {
  try {
    if (DRY_RUN) {
      logger.info(`[DRY-RUN] Would anonymize young ${young._id} (cohort: ${young.cohort})`);
      return true;
    }

    // Brevo D'ABORD, avant toute mutation : si la purge échoue, on n'anonymise rien
    // et le jeune (anonymized != true) sera repris au prochain run. young.email est
    // encore le vrai email à ce stade (plus besoin de capturer realEmails).
    await purgeBrevoContacts([young.email, young.parent1Email, young.parent2Email]);

    await deleteS3Files(young._id.toString());

    const session = await startSession();
    try {
      await withTransaction(session, async () => {
        // On ne garde RIEN : replaceOne réduit le jeune au plancher (email requis/unique
        // + bookkeeping). `email` est un placeholder non personnel ; cohort = "-" marque
        // le compte comme anonymisé (la vraie cohorte n'est pas conservée).
        await YoungModel.collection.replaceOne(
          { _id: young._id },
          {
            cohort: "-",
            createdAt: young.createdAt,
            status: YOUNG_STATUS.DELETED,
            anonymized: true,
            email: `anonymized-${young._id}@deleted.snu`,
            updatedAt: new Date(),
          },
          { session },
        );
        await deleteAllPatches(young, session);
        await anonymizeApplicationsForYoung(young._id.toString(), session);
        await anonymizeContractsForYoung(young._id.toString(), session);
      });

      return true;
    } finally {
      await endSession(session);
    }
  } catch (e: any) {
    capture(e, { extra: { youngId: young._id } });
    logger.error(`Error processing young ${young._id}: ${e.message}`);
    return false;
  }
};

export const handler = async (): Promise<void> => {
  const mode = DRY_RUN ? "[DRY-RUN] " : "";
  try {
    const query = buildQuery();
    const total = await YoungModel.countDocuments(query);
    logger.info(`${mode}Found ${total} youngs to anonymize`);

    // Collect all IDs upfront to avoid pagination drift during processing
    const ids = await YoungModel.find(query).select("_id").lean();

    let processed = 0;
    let errors = 0;

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
      const youngs = await YoungModel.find({ _id: { $in: batch.map((d: any) => d._id) } }).select("+password +forgotPasswordResetExpires");

      logger.info(`${mode}Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(ids.length / BATCH_SIZE)} — processing ${youngs.length} youngs`);

      for (const young of youngs) {
        const success = await processYoung(young);
        if (success) processed++;
        else errors++;
      }
    }

    logger.info(`${mode}Anonymization complete: ${processed} processed, ${errors} errors, ${total} total`);

    await slack.success({
      title: "anonymizeOldCohorts",
      text: `${mode}${processed} jeunes anonymisés${errors > 0 ? `, ${errors} erreurs` : ""} sur ${total} trouvés`,
    });
  } catch (e: any) {
    capture(e);
    logger.error(`Error in anonymizeOldCohorts: ${e.message}`);
    await slack.error({
      title: "anonymizeOldCohorts",
      text: `${mode}Erreur lors de l'anonymisation: ${e.message}`,
    });
    throw e;
  }
};

if (require.main === module) {
  initDB()
    .then(() => handler())
    .then(() => closeDB())
    .then(() => process.exit(0))
    .catch((e) => {
      logger.error(e);
      closeDB().finally(() => process.exit(1));
    });
}
