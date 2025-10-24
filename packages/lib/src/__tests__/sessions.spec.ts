import { canAdminCreateCustomMission } from "../sessions";
import { YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "../constants/constants";

describe("canAdminCreateCustomMission", () => {
  it("devrait retourner true si phase1 DONE et phase2 WAITING_REALISATION", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    expect(canAdminCreateCustomMission(young)).toBe(true);
  });

  it("devrait retourner true si phase1 EXEMPTED et phase2 IN_PROGRESS", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.EXEMPTED,
      statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS,
    } as any;
    expect(canAdminCreateCustomMission(young)).toBe(true);
  });

  it("devrait retourner true si phase1 DONE et phase2 WITHDRAWN", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WITHDRAWN,
    } as any;
    expect(canAdminCreateCustomMission(young)).toBe(true);
  });

  it("devrait retourner false si phase2 VALIDATED", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
    } as any;
    expect(canAdminCreateCustomMission(young)).toBe(false);
  });

  it("devrait retourner false si phase1 NOT_DONE", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.NOT_DONE,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    expect(canAdminCreateCustomMission(young)).toBe(false);
  });

  it("devrait retourner false si phase1 AFFECTED", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    expect(canAdminCreateCustomMission(young)).toBe(false);
  });

  it("devrait retourner false si phase1 WAITING_AFFECTATION", () => {
    const young = {
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION,
    } as any;
    expect(canAdminCreateCustomMission(young)).toBe(false);
  });
});

