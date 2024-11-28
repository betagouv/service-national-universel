import { SENDINBLUE_TEMPLATES, MISSION_STATUS, APPLICATION_STATUS, isCohortTooOld, canApplyToPhase2, calculateAge, YoungType, MissionType, CohortType } from "snu-lib";
import { deletePatches } from "../controllers/patches";
import { ApplicationModel } from "../models";
import { YoungModel } from "../models";
import { ReferentModel } from "../models";
import { sendTemplate } from "../brevo";
import { config } from "../config";
import { getCcOfYoung } from "../utils";
import { getTutorName } from "./mission";
import { capture } from "../sentry";
import { logger } from "../logger";

export const anonymizeApplicationsFromYoungId = async ({ youngId = "", anonymizedYoung = {} }: { youngId: string; anonymizedYoung: Partial<YoungType> }) => {
  try {
    const applications = await ApplicationModel.find({ youngId });

    logger.debug(`ANONYMIZE YOUNGS APPLICATIONS >>> ${applications.length} applications found for young with id ${youngId}.`);

    if (!applications.length) {
      return;
    }

    for (const application of applications) {
      application.set({
        youngFirstName: anonymizedYoung.firstName,
        youngLastName: anonymizedYoung.lastName,
        youngEmail: anonymizedYoung.email,
        youngBirthdateAt: anonymizedYoung.birthdateAt,
        youngCity: anonymizedYoung.city,
        youngDepartment: anonymizedYoung.department,
        contractStatus: application.contractStatus || "DRAFT",
      });
      await application.save();
      const deletePatchesResult = await deletePatches({ id: application._id.toString(), model: ApplicationModel });
      if (!deletePatchesResult.ok) {
        throw new Error("ERROR deleting patches of application", { cause: { application_id: application._id, code: deletePatchesResult.code } });
      }
    }

    logger.debug(`ANONYMIZE YOUNGS APPLICATIONS >>> ${applications.length} applications anonymized for young with id ${youngId}.`);
  } catch (e) {
    capture(e);
  }
};

export const updateApplicationTutor = async (mission, fromUser) => {
  try {
    const applications = await ApplicationModel.find({
      missionId: mission._id,
    });

    for (let application of applications) {
      if (application.tutorId !== mission.tutorId) {
        const tutor = await ReferentModel.findById(mission.tutorId);
        if (tutor && tutor.firstName && tutor.lastName) {
          // @ts-ignore
          application.set({ tutorId: mission.tutorId, tutorName: getTutorName(tutor) });
        }
        await application.save({ fromUser });
      }
    }
  } catch (e) {
    capture(e);
  }
};

export const updateApplicationStatus = async (mission, fromUser) => {
  try {
    if (![MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED, MISSION_STATUS.REFUSED].includes(mission.status)) {
      return logger.debug(`no need to update applications, new status for mission ${mission._id} is ${mission.status}`);
    }
    const applications = await ApplicationModel.find({
      missionId: mission._id,
      status: {
        $in: [
          APPLICATION_STATUS.WAITING_VALIDATION,
          APPLICATION_STATUS.WAITING_ACCEPTATION,
          APPLICATION_STATUS.WAITING_VERIFICATION,
          // APPLICATION_STATUS.VALIDATED,
          // APPLICATION_STATUS.IN_PROGRESS,
        ],
      },
    });
    for (let application of applications) {
      let cta = `${config.APP_URL}/phase2`;
      let statusComment = "";
      let sendinblueTemplate = "";
      switch (mission.status) {
        case MISSION_STATUS.REFUSED:
          statusComment = "La mission n'est plus disponible.";
          break;
        case MISSION_STATUS.CANCEL:
          statusComment = "La mission a été annulée.";
          sendinblueTemplate = SENDINBLUE_TEMPLATES.young.MISSION_CANCEL;
          cta = `${config.APP_URL}/phase2?utm_campaign=transactionnel+mig+annulee&utm_source=notifauto&utm_medium=mail+261+acceder`;
          break;
        case MISSION_STATUS.ARCHIVED:
          statusComment = "La mission a été archivée.";
          sendinblueTemplate = SENDINBLUE_TEMPLATES.young.MISSION_ARCHIVED;
          break;
      }
      application.set({ status: APPLICATION_STATUS.CANCEL, statusComment });
      await application.save({ fromUser });

      // ! Should update contract too if it exists

      if (sendinblueTemplate) {
        const young = await YoungModel.findById(application.youngId);
        let cc = getCcOfYoung({ template: sendinblueTemplate, young });

        if (!application.youngEmail) {
          throw new Error(`updateApplicationStatus: youngEmail is missing for young ${application.youngId}`);
        }

        await sendTemplate(sendinblueTemplate, {
          emailTo: [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }],
          params: {
            cta,
            missionName: mission.name,
            message: mission.statusComment,
          },
          cc,
        });
      }
    }
  } catch (e) {
    capture(e);
  }
};

export const getAuthorizationToApply = async (mission: MissionType, young: YoungType, cohort: CohortType) => {
  let refusalMessages: string[] = [];

  if (isCohortTooOld(cohort)) {
    refusalMessages.push("Le délai pour candidater est dépassé.");
  }

  if (!canApplyToPhase2(young, cohort)) {
    refusalMessages.push("Pour candidater, vous devez avoir terminé votre séjour de cohésion");
  }

  if (mission.placesLeft === 0) {
    refusalMessages.push("La mission est déjà complète.");
  }

  if (mission.visibility === "HIDDEN") {
    refusalMessages.push("La structure a fermé les candidatures pour cette mission.");
  }

  const applicationsCount = await ApplicationModel.countDocuments({
    youngId: young._id,
    status: { $in: [APPLICATION_STATUS.WAITING_VALIDATION, APPLICATION_STATUS.WAITING_VERIFICATION] },
  });

  if (applicationsCount >= 15) {
    refusalMessages.push("Vous ne pouvez candidater qu'à 15 missions différentes.");
  }

  const isMilitaryPreparation = mission?.isMilitaryPreparation === "true";

  if (!mission.startAt) {
    throw new Error("getAuthorizationToApply: mission.startAt is missing");
  }

  const today = new Date();
  const missionStartDate = new Date(mission.startAt);
  const date = today > missionStartDate ? today : missionStartDate;
  const ageAtStart = calculateAge(young.birthdateAt, date);

  if (!isMilitaryPreparation && ageAtStart < 15) {
    refusalMessages.push("Vous devez avoir au moins 15 ans pour candidater.");
  }

  // Military preparations have special rules
  if (isMilitaryPreparation && ageAtStart < 16) {
    refusalMessages.push("Pour candidater, vous devez avoir plus de 16 ans (révolus le 1er jour de la Préparation militaire choisie)");
  }

  if (isMilitaryPreparation && young.statusMilitaryPreparationFiles === "REFUSED") {
    refusalMessages.push("Vous n’êtes pas éligible aux préparations militaires. Vous ne pouvez pas candidater");
  }

  const isMilitaryApplicationIncomplete =
    !young.files.militaryPreparationFilesIdentity?.length || !young.files.militaryPreparationFilesAuthorization?.length || !young.files.militaryPreparationFilesCertificate?.length;

  if (isMilitaryPreparation && isMilitaryApplicationIncomplete) {
    refusalMessages.push("Pour candidater, veuillez téléverser le dossier d’éligibilité présent en bas de page");
  }

  return { canApply: refusalMessages.length === 0, message: refusalMessages.join("\n") };
};
