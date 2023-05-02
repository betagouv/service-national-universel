/**
 * Ce CRON est lancé tous les jours à 14h.
 * Il vérifie si on est la veille de la fermeture des instructions d'une cohorte.
 * Si c'est le cas, il envoit à tous les référents départementaux pour qui il reste des jeunes en attente de validation une relance mail.
 */
const path = require("path");
const apiDir = path.resolve(__dirname, "..", "..");
const srcDir = path.join(apiDir, "src");
require("dotenv").config({ path: path.join(apiDir, ".env-staging") });
require(path.join(srcDir, "mongo"));
const { capture } = require("../sentry");
const ReferentModel = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { ADMIN_URL } = require("../config");
const { sessions2023, YOUNG_STATUS, REFERENT_ROLES, REFERENT_DEPARTMENT_SUBROLE, SENDINBLUE_TEMPLATES } = require("snu-lib");
const YoungModel = require("../models/young");

const HOURS_BEFORE_END_REMINDER = 48 - 14; // à 14h la veille
const MS_BEFORE_END_REMINDER = HOURS_BEFORE_END_REMINDER * 60 * 60 * 1000; // la même chose en ms
const MS_THIRTY_MINUTES = 30 * 60 * 1000;

exports.handler = async () => {
  try {
    let countReferents = 0;
    // liste des cohortes pour lesquelles on est la veille de la fin de l'instruction
    const cohorts = await getCohortsEndingTomorrow();
    // pour chaque cohorte :
    for (const cohort of cohorts) {
      // ---  liste des départements ou il reste des jeunes en attente de validation
      const departments = await getDepatmentsWithWaitingYoungs(cohort);
      // --- Pour chaque département :
      for (const department of departments) {
        // --- --- Trouver les référent departementaux avec subrole secretariat ou manager_department
        const referents = await getReferentForDepartment(department._id);
        // --- --- Pour chaque référent :
        for (const referent of referents) {
          // --- --- --- envoyer la relance.
          await sendReminder(referent, department, cohort);
          countReferents++;
        }
      }
    }
    await slack.success({ title: "clotureInscriptionReminder", text: `${countReferents} referents reminded.` });
  } catch (e) {
    capture(e);
    await slack.error({ title: "clotureInscriptionReminder", text: JSON.stringify(e) });
  }
};

// la fonction est async pour prévoir le jour où on ira chercher l'information dans la collection cohort.
async function getCohortsEndingTomorrow() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const todayDate = new Date(`${now.getFullYear()}-${month < 9 ? "0" + month : month}-${now.getDate()}T14:00:00.000Z`);
  const today = todayDate.valueOf();
  return sessions2023
    .filter((session) => {
      return (
        session.eligibility &&
        session.eligibility.instructionEndDate &&
        session.eligibility.instructionEndDate.valueOf() - MS_BEFORE_END_REMINDER <= today + MS_THIRTY_MINUTES &&
        session.eligibility.instructionEndDate.valueOf() - MS_BEFORE_END_REMINDER >= today - MS_THIRTY_MINUTES
      );
    })
    .map((session) => session.name);
}

function getDepatmentsWithWaitingYoungs(cohort) {
  return YoungModel.aggregate([{ $match: { cohort, status: YOUNG_STATUS.WAITING_VALIDATION } }, { $group: { _id: "$department", count: { $sum: 1 } } }]);
}

function getReferentForDepartment(department) {
  return ReferentModel.find({
    role: REFERENT_ROLES.REFERENT_DEPARTMENT,
    subRole: { $in: [REFERENT_DEPARTMENT_SUBROLE.secretariat, REFERENT_DEPARTMENT_SUBROLE.manager_department] },
    department,
  });
}

function sendReminder(referent, department, cohort) {
  return sendTemplate(SENDINBLUE_TEMPLATES.referent.INSTRUCTION_END_REMINDER, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: {
      cta: `${ADMIN_URL}/volontaire?STATUS=%5B"WAITING_VALIDATION"%5D&COHORT=%5B"${encodeURIComponent(cohort)}"%5D&DEPARTMENT=%5B"${encodeURIComponent(department._id)}"%5D`,
      department: department._id,
      cohort,
      pending_cases: department.count,
    },
  });
}
