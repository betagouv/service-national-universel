import { YoungModel } from "../models";
import { deleteContact } from "../brevo";
import { capture } from "../sentry";
import { logger } from "../logger";
import { startSession, withTransaction, endSession, getDb, initDB } from "../mongo";

const LEGAL_REP_ARCHIVE_COLLECTION = "legalRepresentativeArchives";

const isJPlus1Birthday = (birthdateAt: Date | undefined): boolean => {
  if (!birthdateAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birthday = new Date(birthdateAt);
  birthday.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  birthday.setFullYear(birthday.getFullYear() + 18);
  return birthday.getTime() === yesterday.getTime();
};

const getParentFields = (): string[] => {
  const fields: string[] = [];
  for (let i = 1; i <= 2; i++) {
    fields.push(
      `parent${i}Status`,
      `parent${i}FirstName`,
      `parent${i}LastName`,
      `parent${i}Email`,
      `parent${i}Phone`,
      `parent${i}PhoneZone`,
      `parent${i}OwnAddress`,
      `parent${i}Address`,
      `parent${i}coordinatesAccuracyLevel`,
      `parent${i}ComplementAddress`,
      `parent${i}Zip`,
      `parent${i}City`,
      `parent${i}CityCode`,
      `parent${i}Department`,
      `parent${i}Region`,
      `parent${i}Country`,
      `parent${i}Location`,
      `parent${i}FromFranceConnect`,
      `parent${i}Inscription2023Token`,
      `parent${i}DataVerified`,
      `parent${i}AddressVerified`,
      `parent${i}AllowCovidAutotest`,
      `parent${i}AllowImageRights`,
      `parent${i}ContactPreference`,
      `parent${i}ValidationDate`,
      `parent${i}AllowSNU`,
      `rulesParent${i}`,
    );
  }
  return fields;
};

const cleanPatches = async (young: any, session: any): Promise<void> => {
  const patches = await young.patches.find({ ref: young._id });
  for (const patch of patches) {
    const updatedOps = patch.ops.filter((op: any) => {
      const fieldName = op.path.split("/")[1];
      return !fieldName || (!fieldName.startsWith("parent1") && !fieldName.startsWith("parent2"));
    });

    if (updatedOps.length === 0) {
      await patch.deleteOne({ session });
    } else {
      patch.set({ ops: updatedOps });
      await patch.save({ session });
    }
  }
};

const deleteParentEmailsFromBrevo = async (parent1Email: string | undefined, parent2Email: string | undefined, youngId: string): Promise<void> => {
  if (parent1Email) {
    try {
      await deleteContact(parent1Email);
    } catch (e: any) {
      capture(e, { extra: { email: parent1Email, youngId } });
      logger.warn(`Error deleting parent1Email ${parent1Email} from Brevo: ${e.message}`);
    }
  }

  if (parent2Email) {
    try {
      await deleteContact(parent2Email);
    } catch (e: any) {
      capture(e, { extra:
         { email: parent2Email, youngId } });
      logger.warn(`Error deleting parent2Email ${parent2Email} from Brevo: ${e.message}`);
    }
  }
};
async function deleteRLFieldsFromYoung(young: any, session: any): Promise<void> {
  const parentFields = getParentFields();
  const unsetFields: any = {};
  parentFields.forEach((field) => {
    unsetFields[field] = 1;
  });
  
  await YoungModel.updateOne(
    { _id: young._id },
    {
      $unset: unsetFields,
    },
    { session }
  );
}

const processYoung = async (young: any): Promise<boolean> => {
  try {
    if (!isJPlus1Birthday(young.birthdateAt)) { return false; }

    if (young.rlDeleted === true) {
      logger.debug(`Young ${young._id} already has rlDeleted = true, skipping`);
      return false;
    }

    const parent1Email = young.parent1Email;
    const parent2Email = young.parent2Email;

    const session = await startSession();

    try {
      const fromUser = { firstName: "Cron deleteLegalRepresentatives" };
      await withTransaction(session, async () => {
        await archiveLegalRepresentatives(young, session);
        await cleanPatches(young, session);
        await deleteRLFieldsFromYoung(young, session);
      });

      young.set({ rlDeleted: true });
      await young.save({ session, fromUser });
      await deleteParentEmailsFromBrevo(parent1Email, parent2Email, young._id.toString());
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

const getYesterdayDateRange = (): { start: Date; end: Date } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);
  return { start: yesterday, end: yesterdayEnd };
};

const buildQuery = (yesterdayEnd: Date) => {
  const targetYears = ["2020", "2021", "2022", "2023"];
  const cohortRegex = new RegExp(`(${targetYears.join("|")})`);
  const eighteenYearsAgoEnd = new Date(yesterdayEnd);
  eighteenYearsAgoEnd.setFullYear(eighteenYearsAgoEnd.getFullYear() - 18);
  return {
    cohort: { $regex: cohortRegex },
    rlDeleted: { $ne: true },
    birthdateAt: {
      $lte: eighteenYearsAgoEnd,
    },
  };
};

const processAllYoungs = async (youngs: any[]): Promise<{ processed: number; errors: number }> => {
  let totalProcessed = 0;
  let totalErrors = 0;

  for (const young of youngs) {
    const success = await processYoung(young);
    if (success) {
      totalProcessed++;
    } else {
      totalErrors++;
    }
  }

  return { processed: totalProcessed, errors: totalErrors };
};



const archiveLegalRepresentatives = async (young: any, session: any): Promise<void> => {
  const docs: any[] = [];
  for (let i = 1; i <= 2; i++) {
    const firstName = young[`parent${i}FirstName`];
    const lastName = young[`parent${i}LastName`];
    const allowImageRights = young[`parent${i}AllowImageRights`];
    const allowSNU = young[`parent${i}AllowSNU`];
    const validationDate = young[`parent${i}ValidationDate`];
    const rulesParent = young[`rulesParent${i}`];
    if (firstName !== undefined || lastName !== undefined) {
      docs.push({
        youngId: young._id,
        parentIndex: i,
        firstName,
        lastName,
        allowImageRights,
        allowSNU,
        validationDate,
        rulesParent,
        archivedAt: new Date(),
      });
    }
  }
  if (docs.length > 0) {
    const db = getDb();
    const collection = db.collection(LEGAL_REP_ARCHIVE_COLLECTION);
    await collection.insertMany(docs, { session });
  }
};

export const handler = async (): Promise<void> => {
  try {
    const { end: yesterdayEnd } = getYesterdayDateRange();
    const query = buildQuery(yesterdayEnd);
    const youngs = await YoungModel.find(query);
    logger.info(`Found ${youngs.length} youngs to process for RL deletion`);

    const { processed, errors } = await processAllYoungs(youngs);
    logger.info(`RL deletion cron completed: ${processed} processed, ${errors} errors`);
  } catch (e: any) {
    capture(e);
    logger.error(`Error in deleteLegalRepresentatives cron: ${e.message}`);
    throw e;
  }
};

// Initialiser MongoDB avant d'exécuter le handler si le fichier est exécuté directement
if (require.main === module) {
  (async () => {
    try {
      await initDB();
      await handler();
      process.exit(0);
    } catch (e: any) {
      console.error("Error:", e);
      process.exit(1);
    }
  })();
}

export default handler;