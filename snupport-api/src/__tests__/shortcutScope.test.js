const { buildSignatureQuery, canManageShortcut } = require("../utils/shortcutScope");

describe("canManageShortcut", () => {
  const agentShortcut = { userRole: "AGENT" };

  it("lets an agent manage an agent shortcut", () => {
    expect(canManageShortcut({ role: "AGENT" }, agentShortcut)).toBe(true);
  });

  it.each(["REFERENT_DEPARTMENT", "REFERENT_REGION", "DG"])("forbids %s from editing an agent shortcut or signature", (role) => {
    expect(canManageShortcut({ role, region: "Bretagne", departments: ["Finistère"] }, agentShortcut)).toBe(false);
    expect(canManageShortcut({ role, region: "Bretagne", departments: ["Finistère"] }, { ...agentShortcut, isSignature: true })).toBe(false);
  });

  it("limits a regional referent to the shortcuts of their region", () => {
    const user = { role: "REFERENT_REGION", region: "Bretagne" };
    expect(canManageShortcut(user, { userRole: "REFERENT_REGION", userRegion: "Bretagne" })).toBe(true);
    expect(canManageShortcut(user, { userRole: "REFERENT_REGION", userRegion: "Normandie" })).toBe(false);
    expect(canManageShortcut(user, { userRole: "REFERENT_REGION" })).toBe(false);
    expect(canManageShortcut(user, { userRole: "REFERENT_DEPARTMENT" })).toBe(false);
  });

  it("limits a departmental referent to the shortcuts of their departments", () => {
    const user = { role: "REFERENT_DEPARTMENT", departments: ["Finistère"] };
    expect(canManageShortcut(user, { userRole: "REFERENT_DEPARTMENT", userDepartment: "Finistère" })).toBe(true);
    expect(canManageShortcut(user, { userRole: "REFERENT_DEPARTMENT", userDepartment: "Morbihan" })).toBe(false);
    expect(canManageShortcut(user, { userRole: "REFERENT_DEPARTMENT" })).toBe(true);
    expect(canManageShortcut(user, { userRole: "REFERENT_REGION", userRegion: "Bretagne" })).toBe(false);
  });

  it("refuses missing user or shortcut", () => {
    expect(canManageShortcut(undefined, agentShortcut)).toBe(false);
    expect(canManageShortcut({ role: "AGENT" }, null)).toBe(false);
  });
});

describe("buildSignatureQuery", () => {
  it("serves agents and DG only agent signatures", () => {
    for (const role of ["AGENT", "DG"]) {
      expect(buildSignatureQuery({ role }, "young")).toEqual({ isSignature: true, dest: { $in: ["young"] }, userRole: "AGENT" });
    }
  });

  it("never serves a referent's signature outside their territory", () => {
    expect(buildSignatureQuery({ role: "REFERENT_REGION", region: "Bretagne" }, "young")).toEqual({
      isSignature: true,
      dest: { $in: ["young"] },
      $or: [{ userRole: "AGENT" }, { userRole: "REFERENT_REGION", userRegion: "Bretagne" }],
    });
    expect(buildSignatureQuery({ role: "REFERENT_DEPARTMENT", departments: ["Finistère"] })).toEqual({
      isSignature: true,
      $or: [{ userRole: "AGENT" }, { userRole: "REFERENT_DEPARTMENT", userDepartment: { $in: ["Finistère"] } }],
    });
  });

  it("only ever returns signatures", () => {
    expect(buildSignatureQuery({ role: "AGENT" }).isSignature).toBe(true);
  });
});
