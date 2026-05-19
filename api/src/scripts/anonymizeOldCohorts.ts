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
import { unsync } from "../brevo";
import { capture } from "../sentry";
import { logger } from "../logger";
import { startSession, withTransaction, endSession, initDB, closeDB } from "../mongo";
import { listFiles, deleteFilesByList } from "../utils/index";
import slack from "../slack";
import { YOUNG_STATUS } from "snu-lib";

const anonymizeYoung = require("../anonymization/young");
const anonymizeApplication = require("../anonymization/application");
const anonymizeContract = require("../anonymization/contract");

const DRY_RUN = process.env.DRY_RUN === "true" || process.argv.includes("--dry-run");
const BATCH_SIZE = 30;
const COHORT_REGEX = /2019|2020|2021|2022/;

const buildQuery = () => ({
  cohort: { $regex: COHORT_REGEX },
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
  }
};

const anonymizeContractsForYoung = async (youngId: string, session: any): Promise<void> => {
  const contracts = await ContractModel.find({ youngId }).session(session);
  for (const contract of contracts) {
    const anonymized = anonymizeContract(contract.toObject());
    contract.set(anonymized);
    await contract.save({ session, fromUser: { firstName: "Script anonymizeOldCohorts" } });
  }
};

const processYoung = async (young: any): Promise<boolean> => {
  try {
    if (DRY_RUN) {
      logger.info(`[DRY-RUN] Would anonymize young ${young._id} (cohort: ${young.cohort})`);
      return true;
    }

    await deleteS3Files(young._id.toString());

    const session = await startSession();
    try {
      const anonymizedData = anonymizeYoung(young.toObject());
      const fromUser = { firstName: "Script anonymizeOldCohorts" };

      await withTransaction(session, async () => {
        young.set({ ...anonymizedData, status: YOUNG_STATUS.DELETED, anonymized: true });
        await young.save({ session, fromUser });
        await deleteAllPatches(young, session);
        await anonymizeApplicationsForYoung(young._id.toString(), session);
        await anonymizeContractsForYoung(young._id.toString(), session);
      });

      try {
        await unsync(young);
      } catch (e: any) {
        capture(e, { extra: { youngId: young._id } });
        logger.warn(`Failed to unsync young ${young._id} from Brevo: ${e.message}`);
      }

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
      const youngs = await YoungModel.find({ _id: { $in: batch.map((d: any) => d._id) } });

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
