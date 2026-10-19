import { FilterQuery } from "mongoose";
import { APPLICATION_STATUS, COHORT_TYPE, PHASE2_EXCEPTIONAL_VALIDATION, YOUNG_STATUS, YOUNG_STATUS_PHASE2 } from "snu-lib";

import { ApplicationDocument, ApplicationModel, CohortGroupModel, CohortModel, YoungDocument, YoungModel } from "../models";
import { config } from "../config";
import { sendTemplate } from "../brevo";
import { logger } from "../logger";
import { startSession, withTransaction, endSession } from "../mongo";
import { capture } from "../sentry";
import { getCcOfYoung, sendNotificationApplicationClosedBecausePhase2Validated, validateYoungPhase2 } from "../utils";

const FROM_USER = { firstName: "Cron autoValidatePhase2" };
const NOTIFICATION_LEASE_MS = 15 * 60 * 1000;
const ACTIVE_YOUNG_FILTER = { status: { $nin: [YOUNG_STATUS.WITHDRAWN, YOUNG_STATUS.DELETED] }, anonymized: { $ne: true } };

async function getEligibleYoungFilter(): Promise<FilterQuery<YoungDocument>> {
  const groups = await CohortGroupModel.find({
    year: PHASE2_EXCEPTIONAL_VALIDATION.COHORT_YEAR,
    type: { $in: [COHORT_TYPE.CLE, COHORT_TYPE.VOLONTAIRE] },
  }).select("_id");
  if (!groups.length) throw new Error("Groupes de cohortes CLE/HTS 2025 introuvables");

  const cohorts = await CohortModel.find({ cohortGroupId: { $in: groups.map((group) => group._id.toString()) } }).select("_id name");
  if (!cohorts.length) throw new Error("Cohortes CLE/HTS 2025 introuvables");

  return {
    ...ACTIVE_YOUNG_FILTER,
    statusPhase2: { $in: [YOUNG_STATUS_PHASE2.WAITING_REALISATION, YOUNG_STATUS_PHASE2.IN_PROGRESS] },
    "phase2ExceptionalValidation.validatedAt": { $exists: false },
    $or: [
      { cohortId: { $in: cohorts.map((cohort) => cohort._id.toString()) } },
      // Compatibilité avec les anciens dossiers sans cohortId, sans inclure un autre millésime.
      { cohortId: { $in: [null, ""] }, cohort: { $in: cohorts.map((cohort) => cohort.name) } },
    ],
    $expr: {
      $gte: [{ $convert: { input: "$phase2NumberHoursDone", to: "double", onError: 0, onNull: 0 } }, PHASE2_EXCEPTIONAL_VALIDATION.MIN_HOURS],
    },
  };
}

async function validateYoung(youngId: string, eligibleFilter: FilterQuery<YoungDocument>): Promise<boolean> {
  const session = await startSession();
  let validated = false;
  let cancelledApplications: ApplicationDocument[] = [];
  try {
    await withTransaction(session, async () => {
      // La transaction peut être rejouée en cas de conflit avec une autre validation.
      validated = false;
      cancelledApplications = [];
      const young = await YoungModel.findOne({ ...eligibleFilter, _id: youngId }).session(session);
      if (!young) return;
      const hoursDone = Number(young.phase2NumberHoursDone);
      if (!Number.isFinite(hoursDone) || hoursDone < PHASE2_EXCEPTIONAL_VALIDATION.MIN_HOURS) return;

      const applications = await ApplicationModel.find({ youngId: young._id.toString() }).session(session);
      cancelledApplications = applications.filter(
        (application) => application.status === APPLICATION_STATUS.WAITING_VALIDATION || application.status === APPLICATION_STATUS.WAITING_VERIFICATION,
      );
      const validatedAt = new Date();
      await validateYoungPhase2(young, cancelledApplications, FROM_USER, { validatedAt, session, notify: false });
      young.set({
        phase2ExceptionalValidation: {
          reason: PHASE2_EXCEPTIONAL_VALIDATION.REASON,
          validatedAt,
          hoursDone,
          cohortId: young.cohortId,
          cohort: young.cohort,
        },
        phase2ApplicationStatus: applications.map((application) => application.status),
      });
      await young.save({ session, fromUser: FROM_USER });
      validated = true;
    });
  } finally {
    await endSession(session);
  }

  // Aucun email n'est envoyé pendant une transaction susceptible d'être annulée/rejouée.
  for (const application of cancelledApplications) {
    await sendNotificationApplicationClosedBecausePhase2Validated(application);
  }
  return validated;
}

async function notifyYoungs(): Promise<{ notified: number; errors: number }> {
  const template = config.PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID;
  if (!template) {
    logger.warn("autoValidatePhase2: template Brevo non renseigné, notifications conservées en attente");
    return { notified: 0, errors: 0 };
  }
  if (!/^[1-9]\d*$/.test(template)) throw new Error("PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID doit être un identifiant Brevo valide");
  // Sans transport réel, sendTemplate ne fournit pas d'accusé de réception : ne pas marquer ces envois comme réussis.
  if (config.MAIL_TRANSPORT !== "BREVO" || !config.ENABLE_SENDINBLUE) return { notified: 0, errors: 0 };

  const pendingFilter: FilterQuery<YoungDocument> = {
    ...ACTIVE_YOUNG_FILTER,
    statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
    "phase2ExceptionalValidation.reason": PHASE2_EXCEPTIONAL_VALIDATION.REASON,
    "phase2ExceptionalValidation.notifiedAt": { $exists: false },
  };
  let notified = 0;
  let errors = 0;
  const cursor = YoungModel.find(pendingFilter).select("_id").sort({ _id: 1 }).cursor({ batchSize: 50 });
  for await (const candidate of cursor) {
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + NOTIFICATION_LEASE_MS);
    const lockFilter = { _id: candidate._id, "phase2ExceptionalValidation.notificationLockedUntil": lockedUntil };
    // Empêche deux exécutions de notifier simultanément le même jeune ; un verrou abandonné expire.
    // updateOne évite le hook findOneAndUpdate de mongoose-patch-history, qui ne gère pas un résultat nul.
    // Le plugin lit l'auteur des mises à jour de requête dans l'option _user.
    const claim = await YoungModel.updateOne(
      {
        ...pendingFilter,
        _id: candidate._id,
        $or: [{ "phase2ExceptionalValidation.notificationLockedUntil": { $exists: false } }, { "phase2ExceptionalValidation.notificationLockedUntil": { $lte: now } }],
      },
      { $set: { "phase2ExceptionalValidation.notificationLockedUntil": lockedUntil } },
      { _user: FROM_USER },
    );
    if (claim.modifiedCount !== 1) continue;
    const young = await YoungModel.findOne({ ...pendingFilter, ...lockFilter });
    if (!young) continue;
    try {
      const mail = await sendTemplate(template, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        cc: getCcOfYoung({ template, young }),
        params: { cta: `${config.APP_URL}/phase2`, youngFirstName: young.firstName },
      });
      // sendTemplate capture certains échecs sans lever d'exception.
      if (!mail?.messageId) throw new Error("Notification de validation exceptionnelle non confirmée par Brevo");
      await YoungModel.updateOne(
        lockFilter,
        {
          $set: { "phase2ExceptionalValidation.notifiedAt": new Date() },
          $unset: { "phase2ExceptionalValidation.notificationLockedUntil": "" },
        },
        { _user: FROM_USER },
      );
      notified++;
    } catch (error) {
      errors++;
      await YoungModel.updateOne(lockFilter, { $unset: { "phase2ExceptionalValidation.notificationLockedUntil": "" } }, { _user: FROM_USER });
      capture(error, { extra: { youngId: candidate._id.toString(), cron: "autoValidatePhase2" } });
    }
  }
  return { notified, errors };
}

export async function handler(): Promise<void> {
  if (Date.now() < new Date(PHASE2_EXCEPTIONAL_VALIDATION.START_AT).getTime()) return;

  const eligibleFilter = await getEligibleYoungFilter();
  let validated = 0;
  let errors = 0;
  // Pas de pagination par skip : les jeunes quittent le résultat au fil des validations.
  const cursor = YoungModel.find(eligibleFilter).select("_id").sort({ _id: 1 }).cursor({ batchSize: 50 });
  for await (const young of cursor) {
    try {
      if (await validateYoung(young._id.toString(), eligibleFilter)) validated++;
    } catch (error) {
      errors++;
      capture(error, { extra: { youngId: young._id.toString(), cron: "autoValidatePhase2" } });
    }
  }

  const notifications = await notifyYoungs();
  errors += notifications.errors;
  logger.info(`autoValidatePhase2: ${validated} validations, ${notifications.notified} notifications, ${errors} erreurs`);
  if (errors) throw new Error(`autoValidatePhase2: ${errors} erreurs, les traitements en échec seront repris`);
}
