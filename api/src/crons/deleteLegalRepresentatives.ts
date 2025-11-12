import { YoungModel } from "../models";
import { deleteContact } from "../brevo";
import { capture } from "../sentry";
import { logger } from "../logger";
import { startSession, withTransaction, endSession } from "../mongo";

const isJPlus1Birthday = (birthdateAt: Date | undefined): boolean => {
  if (!birthdateAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birthday = new Date(birthdateAt);
  birthday.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
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
      `parent${i}AllowSNU`,
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
      capture(e, { extra: { email: parent2Email, youngId } });
      logger.warn(`Error deleting parent2Email ${parent2Email} from Brevo: ${e.message}`);
    }
  }
};

const addHistoricEntry = (young: any): void => {
  if (!young.historic) {
    young.historic = [];
  }
  young.historic.push({
    phase: young.phase || undefined,
    userName: "Système",
    userId: undefined,
    status: young.status || undefined,
    note: "Suppression automatique des données des représentants légaux (J+1 anniversaire)",
    createdAt: new Date(),
  });
};

const deleteRLFieldsFromYoung = (young: any): void => {
  const parentFields = getParentFields();
  const updateFields: Record<string, undefined> = {};
  parentFields.forEach((field) => {
    updateFields[field] = undefined;
  });
  young.set(updateFields);
};

const processYoung = async (young: any): Promise<boolean> => {
  try {
    if (!isJPlus1Birthday(young.birthdateAt)) {
      return false;
    }

    if (young.RL_deleted === true) {
      logger.debug(`Young ${young._id} already has RL_deleted = true, skipping`);
      return false;
    }

    const parent1Email = young.parent1Email;
    const parent2Email = young.parent2Email;

    const session = await startSession();

    try {
      await withTransaction(session, async () => {
        deleteRLFieldsFromYoung(young);
        await cleanPatches(young, session);
        addHistoricEntry(young);
        young.set({ RL_deleted: true });
        await young.save({ session });
      });

      await deleteParentEmailsFromBrevo(parent1Email, parent2Email, young._id.toString());

      logger.debug(`RL deleted for young ${young._id}`);
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

const buildQuery = (yesterdayStart: Date, yesterdayEnd: Date) => {
  const targetYears = ["2020", "2021", "2022", "2023"];
  const cohortRegex = new RegExp(`(${targetYears.join("|")})`);
  return {
    cohort: { $regex: cohortRegex },
    RL_deleted: { $ne: true },
    birthdateAt: {
      $gte: yesterdayStart,
      $lt: yesterdayEnd,
    },
  };
};

const processAllYoungs = async (youngs: any[]): Promise<{ processed: number; errors: number }> => {
  let processed = 0;
  let errors = 0;

  for (const young of youngs) {
    const success = await processYoung(young);
    if (success) {
      processed++;
    } else {
      errors++;
    }
  }

  return { processed, errors };
};

export const handler = async (): Promise<void> => {
  try {
    const { start: yesterdayStart, end: yesterdayEnd } = getYesterdayDateRange();
    const query = buildQuery(yesterdayStart, yesterdayEnd);
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

