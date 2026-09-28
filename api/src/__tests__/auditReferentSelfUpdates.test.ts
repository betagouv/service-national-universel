/**
 * Contrôle GOO-40 / GOO-5 : règles de `classifyReferentPatch`, qui rejoue sur `referent_patches`
 * les refus de `isReferentUpdateInUserScope` (#5360).
 */
import { ROLES } from "snu-lib";

import { classifyReferentPatch, ReferentPatch } from "../scripts/auditReferentSelfUpdates.helpers";

const TARGET = "650000000000000000000001";
const OTHER = "650000000000000000000002";

const depRef = (_id: string, department: string[] = ["Paris"]) => ({ _id, role: ROLES.REFERENT_DEPARTMENT, region: "Île-de-France", department });
const patch = (user: ReferentPatch["user"], ops: ReferentPatch["ops"]): ReferentPatch => ({ _id: "p", ref: TARGET, date: new Date("2026-09-01"), user, ops });
const reasons = (p: ReferentPatch) => {
  const result = classifyReferentPatch(p);
  return result.kind === "suspect" ? result.findings.map((f) => f.reason) : result.why;
};

describe("classifyReferentPatch", () => {
  it("ignore les champs non surveillés", () => {
    expect(reasons(patch(depRef(TARGET), [{ op: "replace", path: "/firstName", value: "A" }]))).toBe("hors_champs_surveilles");
  });

  it("ignore les écritures sans auteur (crons, invitation)", () => {
    expect(reasons(patch(undefined, [{ op: "replace", path: "/status", value: "INACTIVE" }]))).toBe("sans_auteur");
  });

  it("ignore les admins, y compris en usurpation d'identité", () => {
    expect(reasons(patch({ _id: OTHER, role: ROLES.ADMIN }, [{ op: "replace", path: "/email", value: "x@y.fr", originalValue: "a@b.fr" }]))).toBe("admin");
    expect(reasons(patch({ ...depRef(OTHER), impersonatedBy: { _id: "a", role: ROLES.ADMIN } }, [{ op: "replace", path: "/status", value: "ACTIVE" }]))).toBe("admin");
  });

  it("signale les auto-modifications de statut, e-mail, rôle et sous-rôle", () => {
    const p = patch(depRef(TARGET), [
      { op: "replace", path: "/status", value: "ACTIVE", originalValue: "INACTIVE" },
      { op: "replace", path: "/email", value: "pirate@x.fr", originalValue: "moi@x.fr" },
      { op: "replace", path: "/role", value: ROLES.REFERENT_REGION, originalValue: ROLES.REFERENT_DEPARTMENT },
      { op: "replace", path: "/subRole", value: "god", originalValue: "" },
    ]);
    expect(reasons(p)).toEqual(["AUTO_STATUT", "AUTO_COURRIEL", "AUTO_ROLE", "AUTO_SOUS_ROLE"]);
    expect(classifyReferentPatch(p)).toMatchObject({ kind: "suspect", self: true });
  });

  it("ne signale pas un e-mail identique à la casse et aux espaces près", () => {
    expect(reasons(patch(depRef(TARGET), [{ op: "replace", path: "/email", value: " Moi@X.fr", originalValue: "moi@x.fr" }]))).toBe("dans_le_perimetre");
  });

  it("signale un département hors du territoire de l'acteur, pas un département du territoire", () => {
    expect(reasons(patch(depRef(TARGET), [{ op: "add", path: "/department/1", value: "Bouches-du-Rhône" }]))).toEqual(["AUTO_GEOGRAPHIE_HORS_TERRITOIRE"]);
    expect(reasons(patch(depRef(OTHER, ["Paris", "Hauts-de-Seine"]), [{ op: "replace", path: "/department/0", value: "Hauts-de-Seine" }]))).toBe("dans_le_perimetre");
    expect(reasons(patch(depRef(OTHER), [{ op: "replace", path: "/department", value: ["Paris", "Bouches-du-Rhône"] }]))).toEqual(["TIERS_GEOGRAPHIE_HORS_TERRITOIRE"]);
    expect(reasons(patch(depRef(OTHER), [{ op: "remove", path: "/department/0" }]))).toBe("dans_le_perimetre");
  });

  it("borne un référent régional aux départements de sa région", () => {
    const regional = { _id: OTHER, role: ROLES.REFERENT_REGION, region: "Île-de-France" };
    expect(reasons(patch(regional, [{ op: "replace", path: "/department/0", value: "Hauts-de-Seine" }]))).toBe("dans_le_perimetre");
    expect(reasons(patch(regional, [{ op: "replace", path: "/department/0", value: "Bouches-du-Rhône" }]))).toEqual(["TIERS_GEOGRAPHIE_HORS_TERRITOIRE"]);
    expect(reasons(patch(regional, [{ op: "replace", path: "/region", value: "Bretagne" }]))).toEqual(["TIERS_GEOGRAPHIE_HORS_TERRITOIRE"]);
  });

  it("signale toute géographie écrite par un rôle sans territoire (responsable)", () => {
    expect(reasons(patch({ _id: OTHER, role: ROLES.RESPONSIBLE }, [{ op: "replace", path: "/region", value: "Île-de-France" }]))).toEqual(["TIERS_GEOGRAPHIE_HORS_TERRITOIRE"]);
  });

  it("signale le changement de rôle d'un pair (rattachement à une structure) mais pas son sous-rôle", () => {
    expect(
      reasons(
        patch(depRef(OTHER), [
          { op: "replace", path: "/role", value: ROLES.RESPONSIBLE, originalValue: ROLES.REFERENT_DEPARTMENT },
          { op: "replace", path: "/subRole", value: "assistant", originalValue: "" },
        ]),
      ),
    ).toEqual(["TIERS_ROLE"]);
  });
});
