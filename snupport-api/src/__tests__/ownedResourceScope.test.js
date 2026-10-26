// Lot P (M84, M96) : périmètre des objets d'administration à propriétaire (dossiers, ventilations).
const { canManageOwnedResource, scopeOwnedResourceQuery } = require("../utils/ownedResourceScope");

const AGENT = { role: "AGENT" };
const DEP = { role: "REFERENT_DEPARTMENT", departments: ["75", "92"] };
const REG = { role: "REFERENT_REGION", region: "Bretagne" };

describe("canManageOwnedResource", () => {
  it("laisse un agent central administrer les objets centraux", () => {
    expect(canManageOwnedResource(AGENT, { userRole: "AGENT" })).toBe(true);
  });

  it("empêche un agent d'administrer l'objet d'un référent", () => {
    expect(canManageOwnedResource(AGENT, { userRole: "REFERENT_REGION", userRegion: "Bretagne" })).toBe(false);
  });

  it("empêche un référent d'administrer un objet central (AGENT)", () => {
    expect(canManageOwnedResource(DEP, { userRole: "AGENT" })).toBe(false);
    expect(canManageOwnedResource(REG, { userRole: "AGENT" })).toBe(false);
  });

  it("borne un référent régional à sa propre région", () => {
    expect(canManageOwnedResource(REG, { userRole: "REFERENT_REGION", userRegion: "Bretagne" })).toBe(true);
    expect(canManageOwnedResource(REG, { userRole: "REFERENT_REGION", userRegion: "Normandie" })).toBe(false);
    expect(canManageOwnedResource(REG, { userRole: "REFERENT_REGION" })).toBe(false);
  });

  it("borne un référent départemental à ses départements", () => {
    expect(canManageOwnedResource(DEP, { userRole: "REFERENT_DEPARTMENT", userDepartment: "75" })).toBe(true);
    expect(canManageOwnedResource(DEP, { userRole: "REFERENT_DEPARTMENT", userDepartment: "13" })).toBe(false);
  });

  it("laisse un référent départemental gérer un objet historique sans département", () => {
    expect(canManageOwnedResource(DEP, { userRole: "REFERENT_DEPARTMENT" })).toBe(true);
  });

  it("échoue fermé sur les entrées manquantes ou les rôles inconnus", () => {
    expect(canManageOwnedResource(null, { userRole: "AGENT" })).toBe(false);
    expect(canManageOwnedResource(AGENT, null)).toBe(false);
    expect(canManageOwnedResource({ role: "DG" }, { userRole: "AGENT" })).toBe(false);
  });
});

describe("scopeOwnedResourceQuery", () => {
  it("ne filtre un agent que sur son rôle (pas de périmètre géographique)", () => {
    expect(scopeOwnedResourceQuery(AGENT)).toEqual({ userRole: "AGENT" });
  });

  it("filtre un référent départemental sur ses départements", () => {
    expect(scopeOwnedResourceQuery(DEP)).toEqual({ userRole: "REFERENT_DEPARTMENT", userDepartment: { $in: ["75", "92"] } });
  });

  it("filtre un référent régional sur sa région", () => {
    expect(scopeOwnedResourceQuery(REG)).toEqual({ userRole: "REFERENT_REGION", userRegion: "Bretagne" });
  });
});
