import { UserDto } from "./dto";
import { ReferentStatus } from "./constants/referentConstants";
import {
  ASSIGNABLE_ROLES_LIST,
  canInviteUser,
  canSigninAs,
  canUpdateReferent,
  DECOMMISSIONED_ROLES,
  getYoungFieldsHiddenFrom,
  isDecommissionedRole,
  omitYoungFields,
  ROLES,
  ROLES_LIST,
  SUB_ROLE_GOD,
  YOUNG_HEALTH_FIELDS,
  YOUNG_IDENTITY_FILE_FIELDS,
} from "./roles";

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

describe("rôles décommissionnés (GOO-56, lot P24)", () => {
  it("liste exactement les rôles décommissionnés décidés le 25/09/2026", () => {
    expect(new Set(DECOMMISSIONED_ROLES)).toEqual(
      new Set([ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_SANITAIRE, ROLES.TRANSPORTER, ROLES.VISITOR]),
    );
    // DSNJ et INJEP sont explicitement conservés par la décision du 25/09.
    expect(DECOMMISSIONED_ROLES).not.toContain(ROLES.DSNJ);
    expect(DECOMMISSIONED_ROLES).not.toContain(ROLES.INJEP);
  });

  it("isDecommissionedRole teste role ET roles[] (getAcl fait primer roles[])", () => {
    expect(isDecommissionedRole({ role: ROLES.HEAD_CENTER })).toBe(true);
    expect(isDecommissionedRole({ role: ROLES.ADMIN })).toBe(false);
    // roles[] prime sur role : un compte avec role="admin" mais roles=["transporter"] reste décommissionné.
    expect(isDecommissionedRole({ role: ROLES.ADMIN, roles: [ROLES.TRANSPORTER] })).toBe(true);
    expect(isDecommissionedRole(undefined)).toBe(false);
    expect(isDecommissionedRole(null)).toBe(false);
  });

  it("ASSIGNABLE_ROLES_LIST exclut les rôles décommissionnés", () => {
    for (const role of DECOMMISSIONED_ROLES) {
      expect(ASSIGNABLE_ROLES_LIST).not.toContain(role);
    }
    expect(ASSIGNABLE_ROLES_LIST).toContain(ROLES.ADMIN);
    expect(ASSIGNABLE_ROLES_LIST.length).toBe(ROLES_LIST.length - DECOMMISSIONED_ROLES.length);
  });

  it("canInviteUser refuse toujours un rôle décommissionné, même pour un ADMIN", () => {
    for (const role of DECOMMISSIONED_ROLES) {
      expect(canInviteUser(ROLES.ADMIN, role)).toBe(false);
      expect(canInviteUser(ROLES.REFERENT_REGION, role)).toBe(false);
      expect(canInviteUser(ROLES.REFERENT_DEPARTMENT, role)).toBe(false);
    }
  });

  it("canInviteUser garde son comportement pour les rôles toujours attribuables", () => {
    expect(canInviteUser(ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT)).toBe(true);
    expect(canInviteUser(ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT)).toBe(true);
    expect(canInviteUser(ROLES.RESPONSIBLE, ROLES.RESPONSIBLE)).toBe(true);
  });

  it("canUpdateReferent refuse à un ADMIN d'attribuer un rôle décommissionné à un référent", () => {
    const actor = { _id: "actor", role: ROLES.ADMIN, department: [] } as unknown as UserDto;
    const originalTarget = { _id: "target", role: ROLES.REFERENT_DEPARTMENT, status: ReferentStatus.ACTIVE, department: ["Paris"] } as any;
    const modifiedTarget = { role: ROLES.HEAD_CENTER } as any;
    expect(canUpdateReferent({ actor, originalTarget, modifiedTarget, structure: null })).toBe(false);
  });

  it("canUpdateReferent refuse à un ADMIN de réactiver un compte au rôle décommissionné", () => {
    const actor = { _id: "actor", role: ROLES.ADMIN, department: [] } as unknown as UserDto;
    const originalTarget = { _id: "target", role: ROLES.TRANSPORTER, status: ReferentStatus.INACTIVE } as any;
    const modifiedTarget = { status: ReferentStatus.ACTIVE } as any;
    expect(canUpdateReferent({ actor, originalTarget, modifiedTarget, structure: null })).toBe(false);
  });

  it("canUpdateReferent laisse un ADMIN modifier un compte déjà décommissionné sans changer rôle ni statut", () => {
    const actor = { _id: "actor", role: ROLES.ADMIN, department: [] } as unknown as UserDto;
    const originalTarget = { _id: "target", role: ROLES.HEAD_CENTER, status: ReferentStatus.ACTIVE } as any;
    const modifiedTarget = { phone: "0600000000" } as any;
    expect(canUpdateReferent({ actor, originalTarget, modifiedTarget, structure: null })).toBe(true);
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
