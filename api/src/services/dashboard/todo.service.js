const { DASHBOARD_TODOS_FUNCTIONS, ROLES } = require("snu-lib");
const { CohortModel } = require("../../models");

const services = {
  inscription: require("./todo-inscription.service"),
  sejour: require("./todo-sejour.service"),
  engagement: require("./todo-engagement.service"),
};
const service = {};

service.todosByRole = async (user) => {
  // Assign the right function to the right role.
  let functionsByRole = {
    inscription: [],
    sejour: [],
    engagement: [],
  };
  switch (user.role) {
    case ROLES.ADMIN:
      functionsByRole = {
        inscription: [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.BASIC, DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_BY_COHORT],
        sejour: [
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_NOT_CONFIRMED,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PARTICIPATION_NOT_CONFIRMED,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_TO_DECLARE,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_TO_DECLARE,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.DOCS,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CONTACT_TO_FILL,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_MANAGER_TO_FILL,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MODIFICATION_REQUEST,
        ],
        engagement: [DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.BASIC],
      };
      break;
    case ROLES.REFERENT_REGION:
      functionsByRole = {
        inscription: [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.BASIC, DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_BY_COHORT],
        sejour: [
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CONTACT_TO_FILL,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.DOCS,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_TO_DECLARE,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_TO_DECLARE,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_MANAGER_TO_FILL,
          //TODO : Schéma d’affectation. X volontaires prévus en trop dans le [Nom du département]
          //TODO : Intra-départemental. X volontaires demandant une affectation intradépartementale pour le séjour de [Février 2023 - C] (à suivre)
        ],
        engagement: [
          //TODO : check with PO's here
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.BASIC,
          // TODO: optimize theses queries using ES instead of mongo.
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_MANAGER,
        ],
      };
      break;
    case ROLES.REFERENT_DEPARTMENT:
      functionsByRole = {
        inscription: [
          DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.BASIC,
          DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.WAITING_VALIDATION_BY_COHORT,
          DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.IMAGE_RIGHT,
        ],
        sejour: [
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.DOCS,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_MANAGER_TO_FILL,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_TO_DECLARE,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.PARTICIPATION_NOT_CONFIRMED,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.MEETING_POINT_TO_DECLARE,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_TO_DECLARE,
          DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CENTER_MANAGER_TO_FILL,
          //TODO : Schéma d’affectation. X volontaires prévus en trop dans le [Nom du département]
          //TODO : Intra-départemental. X volontaires demandant une affectation intradépartementale pour le séjour de [Février 2023 - C] (à suivre)
        ],
        engagement: [
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.BASIC,
          // TODO: optimize theses queries using ES instead of mongo.
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.STRUCTURE_MANAGER,
        ],
      };
      break;
    case ROLES.HEAD_CENTER:
      functionsByRole = {
        inscription: [DASHBOARD_TODOS_FUNCTIONS.INSCRIPTION.IMAGE_RIGHT],
        sejour: [DASHBOARD_TODOS_FUNCTIONS.SEJOUR.DOCS, DASHBOARD_TODOS_FUNCTIONS.SEJOUR.CHECKIN, DASHBOARD_TODOS_FUNCTIONS.SEJOUR.YOUNG_TO_CONTACT],
      };
      break;
    case ROLES.SUPERVISOR:
    case ROLES.RESPONSIBLE:
      functionsByRole = {
        engagement: [
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_END,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_UPDATE_AFTER_START,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_STATUS_AFTER_END,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.YOUNG_TO_FOLLOW_WITHOUT_CONTRACT_AFTER_START,
          DASHBOARD_TODOS_FUNCTIONS.ENGAGEMENT.BASIC_FOR_RESP,
        ],
      };
      break;
    default:
      break;
  }

  // Get all cohorts and filter them.
  const all = await CohortModel.find({});
  const notFinished = all.filter((c) => new Date(c.dateEnd) > Date.now()).map((e) => e.name);
  const notStarted = all.filter((c) => new Date(c.dateStart) > Date.now()).map((e) => e.name);
  const assignementOpen = all.filter((c) => Boolean(c.isAssignmentAnnouncementsOpenForYoung) && notFinished.includes(c)).map((e) => e.name);
  const fiveDaysBeforeInscriptionEnd = all
    .filter((c) => new Date(c.instructionEndDate) - Date.now() < 5 * 24 * 60 * 60 * 1000 && new Date(c.instructionEndDate) - Date.now() > 0)
    .map((e) => e.name);
  const oneWeekBeforepdrChoiceLimitDate = all
    .filter((c) => new Date(c.pdrChoiceLimitDate) - Date.now() < 7 * 24 * 60 * 60 * 1000 && new Date(c.pdrChoiceLimitDate) - Date.now() > 0)
    .map((e) => e.name);
  // dateStart - 7 weeks > now && dateStart ≤ now
  const sevenWeeksBeforeSessionStart = all
    .filter((c) => new Date(c.dateStart) - Date.now() < 7 * 7 * 24 * 60 * 60 * 1000 && new Date(c.dateStart) - Date.now() > 0)
    .map((e) => e.name);
  // entre 2 semaines avant le 1er jour du séjour et le dernier jour du séjour, alors alerte (1 alerte par session)
  const twoWeeksBeforeSessionStart = all.filter((c) => new Date(c.dateStart) - Date.now() < 14 * 24 * 60 * 60 * 1000 && new Date(c.dateEnd) - Date.now() > 0).map((e) => e.name);
  const twoDaysAfterSessionStart = all.filter((c) => new Date(c.dateStart) + 2 * 24 * 60 * 60 * 1000 < Date.now()).map((e) => e.name);
  // dateStart > now && dateEnd + 2 weeks < now
  const twoWeeksAfterSessionEnd = all.filter((c) => new Date(c.dateStart) > Date.now() && new Date(c.dateEnd) + 2 * 7 * 24 * 60 * 60 * 1000 < Date.now()).map((e) => e.name);
  const sessionEditionOpen = all.filter((c) => c.sessionEditionOpenForReferentRegion && c.sessionEditionOpenForReferentDepartment).map((e) => e.name);

  // Map all functions to get the todos.
  const todos = {};
  for (const [key, value] of Object.entries(functionsByRole)) {
    const arr = await Promise.all(
      value.map((f) =>
        services[key][f](user, {
          all,
          notStarted,
          notFinished,
          assignementOpen,
          fiveDaysBeforeInscriptionEnd,
          oneWeekBeforepdrChoiceLimitDate,
          sevenWeeksBeforeSessionStart,
          twoWeeksBeforeSessionStart,
          twoDaysAfterSessionStart,
          twoWeeksAfterSessionEnd,
          sessionEditionOpen,
        }),
      ),
    );
    todos[key] = arr.reduce((acc, cur) => ({ ...acc, ...cur }), {});
  }

  return todos;
};

module.exports = service;
