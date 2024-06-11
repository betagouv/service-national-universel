import { isTeamLeaderOrSupervisorEditable, isSameBusTeam } from "./ligneService";
import { ROLES } from "../roles";
import { CohortDto, LigneBusDto } from "../dto";

describe("isTeamLeaderOrSupervisorEditable", () => {
  it("should return true for admin", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.ADMIN }, {} as CohortDto)).toBe(true);
  });

  it("should return false for transporter", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.TRANSPORTER }, {} as CohortDto)).toBe(false);
  });

  it("should return true for transporter when busEditionOpenForTransporter is true", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.TRANSPORTER }, { busEditionOpenForTransporter: true } as CohortDto)).toBe(true);
  });

  it("should return false for referent region", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.REFERENT_REGION }, {} as CohortDto)).toBe(false);
  });

  it("should return true for referent region when editionOpenForReferentRegion is true", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.REFERENT_REGION }, { informationsConvoyage: { editionOpenForReferentRegion: true } } as CohortDto)).toBe(true);
  });

  it("should return false for referent department", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.REFERENT_DEPARTMENT }, {} as CohortDto)).toBe(false);
  });

  it("should return true for referent department when editionOpenForReferentDepartment is true", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.REFERENT_DEPARTMENT }, { informationsConvoyage: { editionOpenForReferentDepartment: true } } as CohortDto)).toBe(true);
  });

  it("should return false for head center", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.HEAD_CENTER }, {} as CohortDto)).toBe(false);
  });

  it("should return true for head center when editionOpenForHeadOfCenter is true", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: ROLES.HEAD_CENTER }, { informationsConvoyage: { editionOpenForHeadOfCenter: true } } as CohortDto)).toBe(true);
  });

  it("should return false for unknown role", () => {
    expect(isTeamLeaderOrSupervisorEditable({ role: "UNKNOWN" }, {} as CohortDto)).toBe(false);
  });
});

describe("isSameBusTeam", () => {
  it("should return true when empty", () => {
    expect(isSameBusTeam({ team: [] } as LigneBusDto, { team: [] } as LigneBusDto)).toBe(true);
    expect(isSameBusTeam({} as LigneBusDto, {} as LigneBusDto)).toBe(true);
  });
  it("should return true when same _ids", () => {
    expect(isSameBusTeam({ team: [{ _id: "a" }] } as LigneBusDto, { team: [{ _id: "a" }] } as LigneBusDto)).toBe(true);
    expect(isSameBusTeam({ team: [{ _id: "a" }, { _id: "b" }] } as LigneBusDto, { team: [{ _id: "b" }, { _id: "a" }] } as LigneBusDto)).toBe(true);
  });
  it("should return false when diffents _ids", () => {
    expect(isSameBusTeam({ team: [{ _id: "a" }] } as LigneBusDto, { team: [{ _id: "b" }] } as LigneBusDto)).toBe(false);
    expect(isSameBusTeam({ team: [{ _id: "a" }, { _id: "b" }] } as LigneBusDto, { team: [{ _id: "a" }, { _id: "b" }, { _id: "c" }] } as LigneBusDto)).toBe(false);
    expect(isSameBusTeam({ team: [{ _id: "a" }, { _id: "b" }] } as LigneBusDto, { team: [{ _id: "b" }, { _id: "c" }] } as LigneBusDto)).toBe(false);
  });
});
