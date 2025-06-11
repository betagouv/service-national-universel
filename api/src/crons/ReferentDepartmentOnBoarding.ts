import { logger } from "../logger";
import { capture } from "../sentry";
import slack from "../slack";
import { ReferentModel, ReferentDocument } from "../models";
import { sendTemplate } from "../brevo";
import { SENDINBLUE_TEMPLATES } from "snu-lib";

interface ReminderData {
  sevenDaysReferents: ReferentDocument[];
  twentyOneDaysReferents: ReferentDocument[];
}

async function getReferentsForReminder(): Promise<ReminderData> {
  const now = new Date();

  // Calculate dates for 7 days ago and 21 days ago
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const sevenDaysAgoEnd = new Date(sevenDaysAgo);
  sevenDaysAgoEnd.setHours(23, 59, 59, 999);

  const twentyOneDaysAgo = new Date(now);
  twentyOneDaysAgo.setDate(now.getDate() - 21);
  twentyOneDaysAgo.setHours(0, 0, 0, 0);

  const twentyOneDaysAgoEnd = new Date(twentyOneDaysAgo);
  twentyOneDaysAgoEnd.setHours(23, 59, 59, 999);

  try {
    const sevenDaysReferents = await ReferentModel.find({
      registredAt: {
        $gte: sevenDaysAgo,
        $lte: sevenDaysAgoEnd,
      },
    });

    const twentyOneDaysReferents = await ReferentModel.find({
      registredAt: {
        $gte: twentyOneDaysAgo,
        $lte: twentyOneDaysAgoEnd,
      },
    });

    logger.info(`Found ${sevenDaysReferents.length} referents registered 7 days ago`);
    logger.info(`Found ${twentyOneDaysReferents.length} referents registered 21 days ago`);

    return {
      sevenDaysReferents,
      twentyOneDaysReferents,
    };
  } catch (error) {
    capture(error);
    logger.error("Error fetching referents for reminder:", error);
    throw error;
  }
}

async function processReminderEmails(reminderData: ReminderData) {
  const { sevenDaysReferents, twentyOneDaysReferents } = reminderData;

  // Process 7-day reminders
  for (const referent of sevenDaysReferents) {
    await sendTemplate(SENDINBLUE_TEMPLATES.referent.ON_BOARDING_REF_DEP_J7, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
      params: {
        toName: `${referent.firstName} ${referent.lastName}`,
      },
    });
  }

  // Process 21-day reminders
  for (const referent of twentyOneDaysReferents) {
    await sendTemplate(SENDINBLUE_TEMPLATES.referent.ON_BOARDING_REF_DEP_J21, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
      params: {
        toName: `${referent.firstName} ${referent.lastName}`,
      },
    });
  }
}

export const handler = async () => {
  try {
    const reminderData = await getReferentsForReminder();
    await processReminderEmails(reminderData);
    logger.info("ReferentDepartmentOnBoarding cron completed successfully");
    slack.success({
      title: `Referent Departmentaux onBoarding`,
      text: `${reminderData.sevenDaysReferents.length + reminderData.twentyOneDaysReferents.length} referents has been notified !`,
    });
  } catch (error) {
    capture(error);
    logger.error("ReferentDepartmentOnBoarding cron failed:", error);
    await slack.error({ title: "ReferentDepartmentOnBoarding", text: JSON.stringify(error) });
  }
};
