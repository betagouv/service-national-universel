import { isCohortFullyArchived } from "../sessions";
import {
  canCreateApplications,
  canViewMissions,
  canViewMissionDetail,
  canCreateEquivalences,
  canManageApplications,
  canAccessMilitaryPreparation,
  canAdminCreateApplication,
  canReferentCreateApplication,
  canReferentUpdateApplicationStatus,
  canReferentUpdatePhase2Status,
  canReferentCreateEquivalence,
} from "../roles";
import { YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, APPLICATION_STATUS, COHORT_STATUS } from "../constants/constants";

describe("canAdminCreateApplication", () => {
  it("devrait retourner true si phase1 DONE et phase2 WAITING_REALISATION", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    expect(canAdminCreateApplication(young)).toBe(true);
  });

  it("devrait retourner true si phase1 EXEMPTED et phase2 IN_PROGRESS", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.EXEMPTED,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    expect(canAdminCreateApplication(young)).toBe(true);
  });

  it("devrait retourner true si phase1 DONE et phase2 WITHDRAWN", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WITHDRAWN,
    } as any;
    expect(canAdminCreateApplication(young)).toBe(true);
  });

  it("devrait retourner false si phase2 VALIDATED", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
    } as any;
    expect(canAdminCreateApplication(young)).toBe(false);
  });

  it("devrait retourner false si phase1 NOT_DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.NOT_DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    expect(canAdminCreateApplication(young)).toBe(false);
  });

  it("devrait retourner false si phase1 AFFECTED", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    expect(canAdminCreateApplication(young)).toBe(false);
  });

  it("devrait retourner false si phase1 WAITING_AFFECTATION", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    expect(canAdminCreateApplication(young)).toBe(false);
  });
});

describe("canReferentCreateApplication", () => {
  it("devrait retourner true si phase1 DONE, phase2 WAITING_REALISATION et 1 application DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    const applications = [{ status: APPLICATION_STATUS.DONE }];
    expect(canReferentCreateApplication(young, applications)).toBe(true);
  });

  it("devrait retourner true si phase1 EXEMPTED, phase2 IN_PROGRESS et 1 application DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.EXEMPTED,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [{ status: APPLICATION_STATUS.DONE }];
    expect(canReferentCreateApplication(young, applications)).toBe(true);
  });

  it("devrait retourner true si phase1 DONE, phase2 WITHDRAWN et 1 application DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WITHDRAWN,
    } as any;
    const applications = [{ status: APPLICATION_STATUS.DONE }];
    expect(canReferentCreateApplication(young, applications)).toBe(true);
  });

  it("devrait retourner false si phase2 VALIDATED même avec application DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
    } as any;
    const applications = [{ status: APPLICATION_STATUS.DONE }];
    expect(canReferentCreateApplication(young, applications)).toBe(false);
  });

  it("devrait retourner false si phase1 non validée même avec application DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [{ status: APPLICATION_STATUS.DONE }];
    expect(canReferentCreateApplication(young, applications)).toBe(false);
  });

  it("devrait retourner false si aucune application et cohorte archivée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [];
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canReferentCreateApplication(young, applications, cohort)).toBe(false);
  });

  it("devrait retourner false si applications sans statut DONE et cohorte archivée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [
      { status: APPLICATION_STATUS.VALIDATED },
      { status: APPLICATION_STATUS.IN_PROGRESS },
      { status: APPLICATION_STATUS.WAITING_VALIDATION },
    ];
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canReferentCreateApplication(young, applications, cohort)).toBe(false);
  });

  it("devrait retourner true si au moins une application DONE parmi plusieurs", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [
      { status: APPLICATION_STATUS.VALIDATED },
      { status: APPLICATION_STATUS.DONE },
      { status: APPLICATION_STATUS.IN_PROGRESS },
    ];
    expect(canReferentCreateApplication(young, applications)).toBe(true);
  });

  it("devrait retourner true si cohorte non archivée, phase1/phase2 OK, SANS mission effectuée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [];
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canReferentCreateApplication(young, applications, cohort)).toBe(true);
  });

  it("devrait retourner false si cohorte archivée, phase1/phase2 OK, SANS mission effectuée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [];
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canReferentCreateApplication(young, applications, cohort)).toBe(false);
  });

  it("devrait retourner true si cohorte archivée, phase1/phase2 OK, AVEC mission effectuée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [{ status: APPLICATION_STATUS.DONE }];
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canReferentCreateApplication(young, applications, cohort)).toBe(true);
  });

  it("devrait retourner true si cohorte non archivée, phase1/phase2 OK, AVEC mission effectuée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [{ status: APPLICATION_STATUS.DONE }];
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canReferentCreateApplication(young, applications, cohort)).toBe(true);
  });

  it("devrait retourner false si cohorte FULLY_ARCHIVED même avec mission effectuée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [{ status: APPLICATION_STATUS.DONE }];
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canReferentCreateApplication(young, applications, cohort)).toBe(false);
  });

  it("devrait retourner false si cohorte FULLY_ARCHIVED sans mission effectuée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [];
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canReferentCreateApplication(young, applications, cohort)).toBe(false);
  });
});

describe("canViewMissions - fully archived cases", () => {
  it("devrait retourner true si jeune pointé et cohorte non archivée", () => {
    const young = {
      cohesionStayPresence: "true",
      statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canViewMissions(young, cohort)).toBe(true);
  });

  it("devrait retourner true si phase1 validée et cohorte non archivée", () => {
    const young = {
      cohesionStayPresence: "false",
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canViewMissions(young, cohort)).toBe(true);
  });

  it("devrait retourner true si phase1 validée, phase2 non validée, cohorte archivée et 1 mission DONE", () => {
    const young = {
      cohesionStayPresence: "false",
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canViewMissions(young, cohort)).toBe(true);
  });

  it("devrait retourner true si jeune pointé, phase2 IN_PROGRESS, cohorte archivée et 1 mission DONE", () => {
    const young = {
      cohesionStayPresence: "true",
      statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      phase2ApplicationStatus: [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canViewMissions(young, cohort)).toBe(true);
  });

  it("devrait retourner false si phase2 validée même avec mission DONE", () => {
    const young = {
      cohesionStayPresence: "true",
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canViewMissions(young, cohort)).toBe(false);
  });

  it("devrait retourner false si cohorte archivée sans mission DONE", () => {
    const young = {
      cohesionStayPresence: "true",
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.VALIDATED],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canViewMissions(young, cohort)).toBe(false);
  });

  it("devrait retourner false si phase1 non validée et non pointé", () => {
    const young = {
      cohesionStayPresence: "false",
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canViewMissions(young, cohort)).toBe(false);
  });
});

describe("canCreateApplications", () => {
  it("devrait retourner true si phase1 validée et cohorte non archivée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canCreateApplications(young, cohort)).toBe(true);
  });

  it("devrait retourner true si phase1 EXEMPTED et cohorte non archivée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.EXEMPTED,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canCreateApplications(young, cohort)).toBe(true);
  });

  it("devrait retourner true si phase1 validée, phase2 non validée, cohorte archivée et 1 candidature DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canCreateApplications(young, cohort)).toBe(true);
  });

  it("devrait retourner true si phase1 validée, phase2 IN_PROGRESS, cohorte archivée et 1 candidature DONE parmi plusieurs", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
      phase2ApplicationStatus: [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.DONE, APPLICATION_STATUS.IN_PROGRESS],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canCreateApplications(young, cohort)).toBe(true);
  });

  it("devrait retourner false si phase2 validée même avec candidature DONE et cohorte archivée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canCreateApplications(young, cohort)).toBe(false);
  });

  it("devrait retourner false si phase1 non validée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canCreateApplications(young, cohort)).toBe(false);
  });

  it("devrait retourner false si cohorte archivée et aucune candidature DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.IN_PROGRESS],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canCreateApplications(young, cohort)).toBe(false);
  });

  it("devrait retourner false si phase2 validée avec cohorte non archivée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canCreateApplications(young, cohort)).toBe(false);
  });

  it("devrait retourner false si cohorte FULLY_ARCHIVED même avec mission DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canCreateApplications(young, cohort)).toBe(false);
  });
});

describe("isCohortFullyArchived", () => {
  it("devrait retourner true pour une cohorte FULLY_ARCHIVED", () => {
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(isCohortFullyArchived(cohort)).toBe(true);
  });

  it("devrait retourner false pour une cohorte ARCHIVED", () => {
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(isCohortFullyArchived(cohort)).toBe(false);
  });

  it("devrait retourner false pour une cohorte PUBLISHED", () => {
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(isCohortFullyArchived(cohort)).toBe(false);
  });

  it("devrait retourner false si cohort undefined", () => {
    expect(isCohortFullyArchived(undefined)).toBe(false);
  });
});

describe("canCreateEquivalences", () => {
  it("devrait retourner true si phase1 validée et cohorte non archivée", () => {
    const young = { 
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canCreateEquivalences(young, cohort)).toBe(true);
  });

  it("devrait retourner true si phase1 validée et cohorte ARCHIVED partiellement", () => {
    const young = { 
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canCreateEquivalences(young, cohort)).toBe(true);
  });

  it("devrait retourner false si cohorte FULLY_ARCHIVED", () => {
    const young = { 
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
    } as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canCreateEquivalences(young, cohort)).toBe(false);
  });

  it("devrait retourner false si phase1 non validée", () => {
    const young = { 
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canCreateEquivalences(young, cohort)).toBe(false);
  });
});

describe("canManageApplications", () => {
  it("devrait retourner true pour cohorte PUBLISHED", () => {
    const young = {} as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canManageApplications(young, cohort)).toBe(true);
  });

  it("devrait retourner true pour cohorte ARCHIVED", () => {
    const young = {} as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canManageApplications(young, cohort)).toBe(true);
  });

  it("devrait retourner false pour cohorte FULLY_ARCHIVED", () => {
    const young = {} as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canManageApplications(young, cohort)).toBe(false);
  });

  it("devrait retourner true si cohort undefined", () => {
    const young = {} as any;
    expect(canManageApplications(young, undefined)).toBe(true);
  });
});

describe("canAccessMilitaryPreparation", () => {
  it("devrait retourner true pour cohorte PUBLISHED", () => {
    const young = {} as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canAccessMilitaryPreparation(young, cohort)).toBe(true);
  });

  it("devrait retourner true pour cohorte ARCHIVED", () => {
    const young = {} as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canAccessMilitaryPreparation(young, cohort)).toBe(true);
  });

  it("devrait retourner false pour cohorte FULLY_ARCHIVED", () => {
    const young = {} as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canAccessMilitaryPreparation(young, cohort)).toBe(false);
  });

  it("devrait retourner true si cohort undefined", () => {
    const young = {} as any;
    expect(canAccessMilitaryPreparation(young, undefined)).toBe(true);
  });
});

describe("canViewMissions", () => {
  it("devrait retourner false pour cohorte FULLY_ARCHIVED", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canViewMissions(young, cohort)).toBe(false);
  });

  it("devrait retourner false pour cohorte FULLY_ARCHIVED même avec mission DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
      cohesionStayPresence: "true",
    } as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canViewMissions(young, cohort)).toBe(false);
  });
});

describe("canViewMissionDetail", () => {
  it("devrait retourner true pour cohorte FULLY_ARCHIVED avec phase1 validée", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canViewMissionDetail(young, cohort)).toBe(true);
  });

  it("devrait retourner true pour cohorte FULLY_ARCHIVED même sans mission DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
      cohesionStayPresence: "true",
    } as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canViewMissionDetail(young, cohort)).toBe(true);
  });

  it("devrait retourner false si phase1 non validée même pour cohorte FULLY_ARCHIVED", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canViewMissionDetail(young, cohort)).toBe(false);
  });

  it("devrait retourner true pour cohorte PUBLISHED", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canViewMissionDetail(young, cohort)).toBe(true);
  });

  it("devrait retourner true pour cohorte ARCHIVED avec mission DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [APPLICATION_STATUS.DONE],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canViewMissionDetail(young, cohort)).toBe(true);
  });

  it("devrait retourner false pour cohorte ARCHIVED sans mission DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
      phase2ApplicationStatus: [],
    } as any;
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canViewMissionDetail(young, cohort)).toBe(false);
  });
});

describe("canReferentUpdateApplicationStatus", () => {
  it("devrait retourner true pour cohorte PUBLISHED", () => {
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canReferentUpdateApplicationStatus(cohort)).toBe(true);
  });

  it("devrait retourner true pour cohorte ARCHIVED", () => {
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canReferentUpdateApplicationStatus(cohort)).toBe(true);
  });

  it("devrait retourner false pour cohorte FULLY_ARCHIVED", () => {
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canReferentUpdateApplicationStatus(cohort)).toBe(false);
  });

  it("devrait retourner true si cohort undefined", () => {
    expect(canReferentUpdateApplicationStatus(undefined)).toBe(true);
  });
});

describe("canReferentUpdatePhase2Status", () => {
  it("devrait retourner true pour cohorte PUBLISHED", () => {
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canReferentUpdatePhase2Status(cohort)).toBe(true);
  });

  it("devrait retourner true pour cohorte ARCHIVED", () => {
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canReferentUpdatePhase2Status(cohort)).toBe(true);
  });

  it("devrait retourner false pour cohorte FULLY_ARCHIVED", () => {
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canReferentUpdatePhase2Status(cohort)).toBe(false);
  });

  it("devrait retourner true si cohort undefined", () => {
    expect(canReferentUpdatePhase2Status(undefined)).toBe(true);
  });
});

describe("canReferentCreateEquivalence", () => {
  it("should return true for PUBLISHED cohort", () => {
    const cohort = { status: COHORT_STATUS.PUBLISHED } as any;
    expect(canReferentCreateEquivalence(cohort)).toBe(true);
  });

  it("should return true for ARCHIVED cohort", () => {
    const cohort = { status: COHORT_STATUS.ARCHIVED } as any;
    expect(canReferentCreateEquivalence(cohort)).toBe(true);
  });

  it("should return false for FULLY_ARCHIVED cohort", () => {
    const cohort = { status: COHORT_STATUS.FULLY_ARCHIVED } as any;
    expect(canReferentCreateEquivalence(cohort)).toBe(false);
  });

  it("should return true if cohort is undefined", () => {
    expect(canReferentCreateEquivalence(undefined)).toBe(true);
  });
});

