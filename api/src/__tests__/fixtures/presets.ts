import { COHORT_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, APPLICATION_STATUS } from "snu-lib";

/**
 * Presets de cohortes réutilisables
 */
export const COHORT_PRESETS = {
  published: {
    name: "Cohorte Publiée",
    status: COHORT_STATUS.PUBLISHED,
    dateStart: new Date("2024-06-01"),
    dateEnd: new Date("2024-06-30"),
  },

  partiallyArchived: {
    name: "Cohorte Archivée Partiellement",
    status: COHORT_STATUS.ARCHIVED,
    dateStart: new Date("2023-06-01"),
    dateEnd: new Date("2023-06-30"),
  },

  fullyArchived: {
    name: "Cohorte Totalement Archivée",
    status: COHORT_STATUS.FULLY_ARCHIVED,
    dateStart: new Date("2022-06-01"),
    dateEnd: new Date("2022-06-30"),
  },
};

/**
 * Presets de jeunes réutilisables
 */
export const YOUNG_PRESETS = {
  eligible: {
    statusPhase1: YOUNG_STATUS_PHASE1.DONE,
    statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
  },

  notEligible: {
    statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
    statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
  },

  phase2Validated: {
    statusPhase1: YOUNG_STATUS_PHASE1.DONE,
    statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
  },

  phase1Exempted: {
    statusPhase1: YOUNG_STATUS_PHASE1.EXEMPTED,
    statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
  },
};

/**
 * Presets de candidatures
 */
export const APPLICATION_PRESETS = {
  done: {
    status: APPLICATION_STATUS.DONE,
  },

  validated: {
    status: APPLICATION_STATUS.VALIDATED,
  },

  waiting: {
    status: APPLICATION_STATUS.WAITING_VALIDATION,
  },

  waitingAcceptation: {
    status: APPLICATION_STATUS.WAITING_ACCEPTATION,
  },

  inProgress: {
    status: APPLICATION_STATUS.IN_PROGRESS,
  },
};

