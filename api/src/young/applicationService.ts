import config from "config";
import { APPLICATION_STATUS, ApplicationType, EQUIVALENCE_STATUS, MissionEquivalenceType, SENDINBLUE_TEMPLATES, YOUNG_STATUS, YOUNG_STATUS_PHASE2, YoungType } from "snu-lib";
import { ApplicationDocument, ApplicationModel, MissionEquivalenceDocument, MissionEquivalenceModel, ReferentModel, YoungDocument } from "../models";
import { getCcOfYoung } from "../utils";
import { sendTemplate } from "../brevo";

function computeHoursDone(applications: ApplicationType[], equivalences: MissionEquivalenceType[]) {
  return (
    applications.reduce((acc, application) => {
      if (application.status === "DONE") {
        return acc + Number(application.missionDuration || 0);
      }
      return acc;
    }, 0) +
    equivalences.reduce((acc, equivalence) => {
      if (equivalence.status === "VALIDATED") {
        return acc + (equivalence.missionDuration || 0);
      }
      return acc;
    }, 0)
  );
}

function computeHoursEstimated(applications: ApplicationType[], equivalences: MissionEquivalenceType[]) {
  return (
    applications.reduce((acc, application) => {
      if (["VALIDATED", "IN_PROGRESS"].includes(application.status)) {
        return acc + Number(application.missionDuration || 0);
      }
      return acc;
    }, 0) +
    equivalences.reduce((acc, equivalence) => {
      if (equivalence.status && ["VALIDATED", "WAITING_VERIFICATION", "WAITING_CORRECTION"].includes(equivalence.status)) {
        return acc + (equivalence.missionDuration || 0);
      }
      return acc;
    }, 0)
  );
}

export async function updateYoungPhase2StatusAndHours(young: YoungDocument, fromUser) {
  const applications = await ApplicationModel.find({ youngId: young._id });
  const equivalences = await MissionEquivalenceModel.find({ youngId: young._id });

  young.set({
    phase2NumberHoursDone: String(computeHoursDone(applications, equivalences)),
    phase2NumberHoursEstimated: String(computeHoursEstimated(applications, equivalences)),
    statusPhase2UpdatedAt: Date.now(),
  });

  // Mise à jour du statut de la phase 2
  const activeApplication = applications.filter((a) => ["WAITING_VALIDATION", "VALIDATED", "IN_PROGRESS", "WAITING_VERIFICATION"].includes(a.status));
  const pendingApplication = applications.filter((a) => ["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(a.status));

  if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED || young.status === YOUNG_STATUS.WITHDRAWN) {
    // Ne pas changer le statut si déjà VALIDATED ou WITHDRAWN
    young.set({ statusPhase2ValidatedAt: Date.now() });
    await cancelPendingApplications(pendingApplication, fromUser);
  } else if (Number(young.phase2NumberHoursDone) >= 84) {
    // Valider la phase 2 si 84 heures effectuées
    young.set({
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
      statusPhase2ValidatedAt: Date.now(),
      "files.militaryPreparationFilesIdentity": [],
      "files.militaryPreparationFilesCensus": [],
      "files.militaryPreparationFilesAuthorization": [],
      "files.militaryPreparationFilesCertificate": [],
      statusMilitaryPreparationFiles: undefined,
    });
    await cancelPendingApplications(pendingApplication, fromUser);
    await sendPhase2ValidationEmail(young);
  } else if (activeApplication.length) {
    // Mettre le statut en IN_PROGRESS si une application est active
    young.set({ statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS, statusPhase2ValidatedAt: undefined });
  } else {
    // Sinon, attendre la réalisation
    young.set({ statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION });
  }

  // Mise à jour des statuts des applications
  young.set({ phase2ApplicationStatus: applications.map((e) => e.status) });
  return young.save({ fromUser });
}

export async function cancelPendingApplications(pendingApplications: ApplicationDocument[], fromUser) {
  for (const application of pendingApplications) {
    application.set({ status: APPLICATION_STATUS.CANCEL });
    await application.save({ fromUser });
    await sendNotificationApplicationClosedBecausePhase2Validated(application);
  }
}

export async function cancelPendingEquivalence(pendingEquivalences: MissionEquivalenceDocument[], fromUser) {
  for (const equivalence of pendingEquivalences) {
    equivalence.set({ status: EQUIVALENCE_STATUS.REFUSED, message: "La phase 2 a été validée" });
    await equivalence.save({ fromUser });
  }
}

async function sendPhase2ValidationEmail(young: YoungType) {
  let template = SENDINBLUE_TEMPLATES.young.PHASE_2_VALIDATED;
  let cc = getCcOfYoung({ template, young });
  await sendTemplate(template, {
    emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
    params: {
      cta: `${config.APP_URL}/phase2?utm_campaign=transactionnel+nouvelles+mig+proposees&utm_source=notifauto&utm_medium=mail+154+telecharger`,
    },
    cc,
  });
}

async function sendNotificationApplicationClosedBecausePhase2Validated(application: ApplicationType) {
  if (application.tutorId) {
    const responsible = await ReferentModel.findById(application.tutorId);
    if (responsible)
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION_PHASE_2_VALIDATED, {
        emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
        params: {
          missionName: application.missionName,
          youngFirstName: application.youngFirstName,
          youngLastName: application.youngLastName,
        },
      });
  }
}
