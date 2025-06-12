import { config } from "../../config";
import { CohortType, ERRORS, ROLES, SENDINBLUE_TEMPLATES, PlanTransportType, COHORT_TYPE } from "snu-lib";
import { ClasseDocument, EtablissementModel, LigneBusDocument, ReferentModel, YoungDocument } from "../../models";
import { sendTemplate } from "../../brevo";

interface notifyYoungsAndRlsPDRWasUpdatedProps {
  youngs: YoungDocument[];
  cohort: CohortType;
  date: string;
  meetingPoint: PlanTransportType["pointDeRassemblements"][number];
}

export async function notifyYoungsAndRlsPDRWasUpdated({ youngs, cohort, date, meetingPoint }: notifyYoungsAndRlsPDRWasUpdatedProps) {
  let isBeforeDeparture = false;
  let templateId: string | null = null;
  if (new Date() < new Date(cohort.dateStart)) {
    isBeforeDeparture = true;
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_DEPARTURE;
  } else if (new Date() < new Date(cohort.dateEnd)) {
    if (cohort.type === COHORT_TYPE.CLE) {
      templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_RETURN_CLE;
    } else if (cohort.type === COHORT_TYPE.VOLONTAIRE) {
      templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_RETURN_HTS;
    }
  }

  if (!templateId) throw new Error("Modification date is out of range, no email sent.");

  for (const young of youngs) {
    if (isBeforeDeparture) {
      const contacts = [young.email];
      if (young.parent1Email) contacts.push(young.parent1Email);
      if (young.parent2Email) contacts.push(young.parent2Email);

      for (const contact of contacts) {
        await sendTemplate(templateId, { emailTo: [{ email: contact }] });
      }
    } else {
      if (young.cohesionStayPresence !== "false" && young.departInform !== "true") {
        if (young.parent1Email) {
          await sendTemplate(templateId, {
            emailTo: [{ email: young.parent1Email }],
            cc: [{ email: young.email }],
            params: {
              PDR_RETOUR: meetingPoint.name,
              PDR_RETOUR_ADRESSE: meetingPoint.address,
              PDR_RETOUR_VILLE: meetingPoint.city,
              DATE_RETOUR: date,
              HEURE_RETOUR: meetingPoint.returnHour,
            },
          });
        }
        if (young.parent2Email) {
          await sendTemplate(templateId, {
            emailTo: [{ email: young.parent2Email }],
            cc: [{ email: young.email }],
            params: {
              PDR_RETOUR: meetingPoint.name,
              PDR_RETOUR_ADRESSE: meetingPoint.address,
              PDR_RETOUR_VILLE: meetingPoint.city,
              DATE_RETOUR: date,
              HEURE_RETOUR: meetingPoint.returnHour,
            },
          });
        }
      }
    }
  }
}

export async function notifyYoungsAndRlsSessionWasUpdated(youngs: YoungDocument[]) {
  const templateId = SENDINBLUE_TEMPLATES.young.PHASE_1_CHANGEMENT_CENTRE;
  for (const young of youngs) {
    await sendTemplate(templateId, { emailTo: [{ email: young.email }] });
    if (young.parent1Email) await sendTemplate(templateId, { emailTo: [{ email: young.parent1Email }] });
    if (young.parent2Email) await sendTemplate(templateId, { emailTo: [{ email: young.parent2Email }] });
  }
}

export async function notifyReferentsCLELineWasUpdated(classe: ClasseDocument) {
  const etablissementId = classe.etablissementId;
  const etablissement = await EtablissementModel.findById(etablissementId);
  if (!etablissement) throw new Error(ERRORS.NOT_FOUND);
  const referentsCLEIds = [...classe.referentClasseIds, ...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds];

  const referentsCLE = await ReferentModel.find({ _id: { $in: referentsCLEIds } }).select("email");

  for (const referent of referentsCLE) {
    await sendTemplate(SENDINBLUE_TEMPLATES.CLE.PHASE_1_MODIFICATION_LIGNE, { emailTo: [{ email: referent.email }] });
  }
}

export async function notifyTransporteurLineWasUpdated(ligne: LigneBusDocument, type: "Informations générales" | "Équipe" | "Centre de cohésion" | "Point de rassemblement") {
  const usersToNotify = await ReferentModel.find({ role: ROLES.TRANSPORTER });

  await sendTemplate(SENDINBLUE_TEMPLATES.PLAN_TRANSPORT.NOTIF_TRANSPORTEUR_MODIF, {
    emailTo: usersToNotify.map((referent) => ({
      name: `${referent.firstName} ${referent.lastName}`,
      email: referent.email,
    })),
    params: {
      type,
      cohort: ligne.cohort,
      ID: ligne._id.toString(),
      lineName: ligne.busId,
      cta: `${config.ADMIN_URL}/ligne-de-bus/${ligne._id.toString()}`,
    },
  });
}
