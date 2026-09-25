import { UserDto } from "./dto";
import { canSigninAs, getYoungFieldsHiddenFrom, omitYoungFields, ROLES, SUB_ROLE_GOD, YOUNG_HEALTH_FIELDS, YOUNG_IDENTITY_FILE_FIELDS } from "./roles";

describe("canSigninAs function", () => {
  it("should return true if actor is admin and target is not god", () => {
    const actor = { role: ROLES.ADMIN } as UserDto;
    const target = { subRole: "not_god", department: ["dep1"], region: "region1" };
    expect(canSigninAs(actor, target, "referent")).toBe(true);
  });

  it("should return false if actor is admin and target is god", () => {
    const actor = { role: ROLES.ADMIN } as UserDto;
    const target = { role: ROLES.ADMIN, subRole: SUB_ROLE_GOD, department: ["dep1"], region: "region1" };
    expect(canSigninAs(actor, target, "referent")).toBe(false);
  });

  it("should return false if actor is not admin or referent reg dep", () => {
    const actor = { role: ROLES.VISITOR } as UserDto;
    const target = { role: ROLES.ADMINISTRATEUR_CLE, department: ["dep1"], region: "region1" };
    expect(canSigninAs(actor, target, "referent")).toBe(false);
  });

  it("should return true if actor is referent department and target is in same department", () => {
    const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["dep1"] } as UserDto;
    const target = { role: ROLES.ADMINISTRATEUR_CLE, department: ["dep1"], region: "region1" };
    expect(canSigninAs(actor, target, "referent")).toBe(true);
  });

  it("should return true if actor is referent region and target is in same region", () => {
    const actor = { role: ROLES.REFERENT_REGION, region: "region1" } as UserDto;
    const target = { department: "dep1", region: "region1" };
    expect(canSigninAs(actor, target, "young")).toBe(true);
  });

  it("should return false if actor is referent region and target is not in same region", () => {
    const actor = { role: ROLES.REFERENT_REGION, region: "region1" } as UserDto;
    const target = { department: "dep1", region: "region2" };
    expect(canSigninAs(actor, target, "young")).toBe(false);
  });
});

describe("helpers d'administration CLE devenus inutilisés", () => {
  it("n'exporte plus les helpers d'administration CLE dont les seuls appelants ont été supprimés", async () => {
    const roles = await import("./roles");
    expect(roles).not.toHaveProperty("canCreateEtablissement");
    expect(roles).not.toHaveProperty("canUpdateEtablissement");
    expect(roles).not.toHaveProperty("canDeleteClasse");
    expect(roles).not.toHaveProperty("canUpdateClasse");
    expect(roles).not.toHaveProperty("canUpdateClasseStay");
    expect(roles).not.toHaveProperty("canVerifyClasse");
    expect(roles).not.toHaveProperty("canWithdrawClasse");
    expect(roles).not.toHaveProperty("canNotifyAdminCleForVerif");
    expect(roles).not.toHaveProperty("canUpdateReferentClasse");
  });
});

describe("getYoungFieldsHiddenFrom / omitYoungFields", () => {
  it("masque notes, santé et pièces d'identité aux structures d'accueil", () => {
    for (const role of [ROLES.RESPONSIBLE, ROLES.SUPERVISOR]) {
      const hidden = getYoungFieldsHiddenFrom({ role });
      expect(hidden).toEqual(expect.arrayContaining(["notes", ...YOUNG_HEALTH_FIELDS, ...YOUNG_IDENTITY_FILE_FIELDS]));
    }
  });

  it("ne masque que les notes au visiteur et au volontaire", () => {
    expect(getYoungFieldsHiddenFrom({ role: ROLES.VISITOR })).toEqual(["notes"]);
    expect(getYoungFieldsHiddenFrom({ _id: "young" })).toEqual(["notes"]);
  });

  it("ne masque rien aux référents habilités", () => {
    expect(getYoungFieldsHiddenFrom({ role: ROLES.ADMIN })).toEqual([]);
    expect(getYoungFieldsHiddenFrom({ role: ROLES.REFERENT_DEPARTMENT })).toEqual([]);
  });

  it("masque tout sans acteur", () => {
    expect(getYoungFieldsHiddenFrom(undefined)).toEqual(["notes", ...YOUNG_HEALTH_FIELDS, ...YOUNG_IDENTITY_FILE_FIELDS]);
  });

  it("retire les chemins pointés sans muter l'objet imbriqué d'origine", () => {
    const files = { cniFiles: [{ name: "cni.pdf" }], rulesFiles: [] };
    const doc = omitYoungFields({ notes: [], handicap: "true", files }, ["notes", "files.cniFiles", "absent.path"]);
    expect(doc).toEqual({ handicap: "true", files: { rulesFiles: [] } });
    expect(files.cniFiles).toHaveLength(1);
  });
});
