import { config } from "../../config";
import { getCohortPeriod, SENDINBLUE_TEMPLATES, YoungType } from "snu-lib";
import { sendTemplate } from "../../brevo";
import { CohortModel } from "../../models";
import { getCcOfYoung } from "../../utils";

export async function notifyParentsPresenceArriveeWasValidated(young: YoungType) {
  let emailTo = [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email! }];
  if (young.parent2Email) emailTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
  await sendTemplate(SENDINBLUE_TEMPLATES.YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL, {
    emailTo,
    params: {
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
    },
  });
}

export async function notifyJeuneConfirmationParticipationWasUpdated(young: YoungType) {
  let template = SENDINBLUE_TEMPLATES.young.PHASE1_AGREEMENT;
  let cc = getCcOfYoung({ template, young });
  const cohort = await CohortModel.findOne({ name: young.cohort });
  await sendTemplate(template, {
    emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
    params: {
      cta: `${config.APP_URL}`,
      date_cohorte: cohort ? getCohortPeriod(cohort) : "",
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
    },
    cc,
  });
}
