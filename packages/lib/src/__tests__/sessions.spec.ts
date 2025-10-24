import { canAdminCreateApplication, canReferentCreateApplication } from "../sessions";
import { YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, APPLICATION_STATUS } from "../constants/constants";

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

  it("devrait retourner false si aucune application", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [];
    expect(canReferentCreateApplication(young, applications)).toBe(false);
  });

  it("devrait retourner false si applications sans statut DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    const applications = [
      { status: APPLICATION_STATUS.VALIDATED },
      { status: APPLICATION_STATUS.IN_PROGRESS },
      { status: APPLICATION_STATUS.WAITING_VALIDATION },
    ];
    expect(canReferentCreateApplication(young, applications)).toBe(false);
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
});

