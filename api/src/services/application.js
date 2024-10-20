const { SENDINBLUE_TEMPLATES, MISSION_STATUS, APPLICATION_STATUS, isCohortTooOld, canApplyToPhase2, calculateAge } = require("snu-lib");
const { deletePatches } = require("../controllers/patches");
const { ApplicationModel } = require("../models");
const { CohortModel } = require("../models");
const { YoungModel } = require("../models");
const { ReferentModel } = require("../models");
const { sendTemplate } = require("../brevo");
const config = require("config");
const { getCcOfYoung } = require("../utils");
const { getTutorName } = require("./mission");
const { capture } = require("../sentry");
const { logger } = require("../logger");

const anonymizeApplicationsFromYoungId = async ({ youngId = "", anonymizedYoung = {} }) => {
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

const updateApplicationTutor = async (mission, fromUser = null) => {
  try {
    const applications = await ApplicationModel.find({
      missionId: mission._id,
    });

    for (let application of applications) {
      if (application.tutorId !== mission.tutorId) {
        const tutor = await ReferentModel.findById(mission.tutorId);
        application.set({ tutorId: mission.tutorId, tutorName: getTutorName(tutor) });
        await application.save({ fromUser });
      }
    }
  } catch (e) {
    capture(e);
  }
};

const updateApplicationStatus = async (mission, fromUser = null) => {
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

const getAuthorizationToApply = async (mission, young) => {
  let refusalMessages = [];
  if (isCohortTooOld(young)) {
    refusalMessages.push("Le délai pour candidater est dépassé.");
  }

  const cohort = await CohortModel.findById(young.cohortId);
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

  const ageAtStart = calculateAge(young.birthdateAt, mission.startAt);

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

module.exports = {
  anonymizeApplicationsFromYoungId,
  updateApplicationTutor,
  updateApplicationStatus,
  getAuthorizationToApply,
};
