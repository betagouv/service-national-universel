import {
  SENDINBLUE_TEMPLATES,
  MISSION_STATUS,
  APPLICATION_STATUS,
  canCreateApplications,
  calculateAge,
  YoungType,
  MissionType,
  CohortType,
  SUB_ROLES,
  ROLES,
  ApplicationType,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE2,
  COHORT_STATUS,
} from "snu-lib";
import { deletePatches } from "../controllers/patches";
import { ApplicationModel, MissionModel, ReferentDocument, YoungDocument } from "../models";
import { YoungModel } from "../models";
import { ReferentModel } from "../models";
import { Email, sendTemplate } from "../brevo";
import { config } from "../config";
import { getCcOfYoung } from "../utils";
import { getTutorName } from "../services/mission";
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

  if (!canCreateApplications(young, cohort)) {
    const hasValidatedOrExemptedPhase1 = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE || young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED;
    const phase2NotValidated = young.statusPhase2 !== YOUNG_STATUS_PHASE2.VALIDATED;
    const hasCompletedMission = young.phase2ApplicationStatus?.some((status) => status === APPLICATION_STATUS.DONE);
    const cohortArchived = cohort.status === COHORT_STATUS.ARCHIVED;

    if (!hasValidatedOrExemptedPhase1) {
      refusalMessages.push("Vous devez avoir validé votre phase 1 pour candidater.");
    } else if (!phase2NotValidated) {
      refusalMessages.push("Votre phase 2 est déjà validée.");
    } else if (cohortArchived && !hasCompletedMission) {
      refusalMessages.push("Votre cohorte est archivée. Pour candidater à de nouvelles missions, vous devez d'abord avoir effectué au moins une mission.");
    } else {
      refusalMessages.push("Vous ne pouvez pas candidater à cette mission.");
    }
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

export async function getReferentsPhase2(department: string): Promise<ReferentDocument[]> {
  // get the manager_phase2
  const managersPhase2 = await ReferentModel.find({
    subRole: SUB_ROLES.manager_phase2,
    role: ROLES.REFERENT_DEPARTMENT,
    department: department,
  });
  if (managersPhase2.length > 0) {
    return managersPhase2;
  }
  // if not found, get the manager_department
  const referentDepartemental = await ReferentModel.findOne({
    subRole: SUB_ROLES.manager_department,
    role: ROLES.REFERENT_DEPARTMENT,
    department: department,
  });
  if (!referentDepartemental) {
    throw new Error(`notifyReferentsEquivalenceSubmitted: no referent found for department ${department}`);
  }
  return [referentDepartemental];
}

export async function updateMission(app, fromUser) {
  try {
    const mission = await MissionModel.findById(app.missionId);
    if (!mission) return;

    // Get all applications for the mission
    const placesTaken = await ApplicationModel.countDocuments({ missionId: mission._id, status: { $in: ["VALIDATED", "IN_PROGRESS", "DONE"] } });
    const placesLeft = Math.max(0, mission.placesTotal - placesTaken);
    if (mission.placesLeft !== placesLeft) {
      mission.set({ placesLeft });
    }

    if (placesLeft === 0) {
      mission.set({ placesStatus: "FULL" });
    } else if (placesLeft === mission.placesTotal) {
      mission.set({ placesStatus: "EMPTY" });
    } else {
      mission.set({ placesStatus: "ONE_OR_MORE" });
    }

    // On met à jour le nb de candidatures en attente.
    const pendingApplications = await ApplicationModel.countDocuments({
      missionId: mission._id,
      status: { $in: ["WAITING_VERIFICATION", "WAITING_VALIDATION"] },
    });

    if (mission.pendingApplications !== pendingApplications) {
      mission.set({ pendingApplications });
    }

    const allApplications = await ApplicationModel.find({ missionId: mission._id });
    mission.set({ applicationStatus: allApplications.map((e) => e.status) });

    await mission.save({ fromUser });
  } catch (e) {
    capture(e);
  }
}

interface EmailTemplate {
  template: string;
  toYoung?: boolean;
  toReferent?: boolean;
}

interface EmailParams {
  youngFirstName: string;
  youngLastName: string;
  missionName: string;
  cta?: string;
}

function getEmailTemplatesForStatus(status: string): EmailTemplate[] {
  switch (status) {
    case APPLICATION_STATUS.VALIDATED:
      return [
        { template: SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION, toYoung: true },
        { template: SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED, toReferent: true },
      ];
    case APPLICATION_STATUS.REFUSED:
      return [{ template: SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION, toYoung: true }];
    case APPLICATION_STATUS.CANCEL:
      return [
        { template: SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION, toYoung: true },
        { template: SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION, toReferent: true },
      ];
    default:
      return [];
  }
}

function getEmailParamsForStatus(status: string, application: ApplicationType, mission: MissionType): EmailParams {
  const baseParams: EmailParams = {
    youngFirstName: application.youngFirstName || "",
    youngLastName: application.youngLastName || "",
    missionName: mission.name,
  };

  switch (status) {
    case APPLICATION_STATUS.VALIDATED:
      return {
        ...baseParams,
        cta: `${config.APP_URL}/candidature?utm_campaign=transactionel+mig+candidature+approuvee&utm_source=notifauto&utm_medium=mail+151+faire`,
      };
    case APPLICATION_STATUS.REFUSED:
      return {
        ...baseParams,
        cta: `${config.APP_URL}/mission?utm_campaign=transactionnel+mig+candidature+nonretenue&utm_source=notifauto&utm_medium=mail+152+candidater`,
      };
    case APPLICATION_STATUS.CANCEL:
      return baseParams;
    default:
      return baseParams;
  }
}

function getYoungEmailRecipients(application: ApplicationType, young: YoungDocument): Email[] {
  const recipients: Email[] = [];

  if (application.youngEmail) {
    recipients.push({
      name: `${application.youngFirstName} ${application.youngLastName}`,
      email: application.youngEmail,
    });
  }

  if (young.parent1Email) {
    recipients.push({
      name: `${young.parent1FirstName} ${young.parent1LastName}`,
      email: young.parent1Email,
    });
  }

  if (young.parent2Email) {
    recipients.push({
      name: `${young.parent2FirstName} ${young.parent2LastName}`,
      email: young.parent2Email,
    });
  }

  return recipients;
}

function getReferentEmailRecipients(referent: ReferentDocument): Email[] {
  return [
    {
      name: `${referent.firstName} ${referent.lastName}`,
      email: referent.email,
    },
  ];
}

function getReferentCtaForTemplate(template: string, application: ApplicationType): string | undefined {
  if (template === SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED) {
    return `${config.ADMIN_URL}/volontaire/${application.youngId}/phase2/application/${application._id}/contrat`;
  }
  return undefined;
}

export async function sendNotificationsByStatus(application: ApplicationType, young: YoungDocument, status: string) {
  try {
    const mission = await MissionModel.findById(application.missionId);
    if (!mission) return;

    const referent = await ReferentModel.findById(mission.tutorId);
    if (!referent) return;

    const templates = getEmailTemplatesForStatus(status);
    const baseParams = getEmailParamsForStatus(status, application, mission);

    for (const { template, toYoung, toReferent } of templates) {
      let emailTo: Email[] = [];
      let params = { ...baseParams };

      if (toYoung) {
        emailTo = getYoungEmailRecipients(application, young);
      } else if (toReferent) {
        emailTo = getReferentEmailRecipients(referent);
        const referentCta = getReferentCtaForTemplate(template, application);
        if (referentCta) {
          params.cta = referentCta;
        }
      }

      if (emailTo.length > 0) {
        const cc = toYoung ? getCcOfYoung({ template, young }) : [];
        await sendTemplate(template, {
          emailTo,
          params,
          cc,
        });
      }
    }
  } catch (error) {
    capture(error);
  }
}
