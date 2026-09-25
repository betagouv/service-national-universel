/**
 * Reproduction du constat H87 de l'audit sécurité du 21/09/2026.
 *
 * `hasUnrestrictedPermission` renvoie `true` dès qu'UNE des permissions qui matchent la
 * ressource/action est dépourvue de policy. Une permission large sans policy annule donc
 * silencieusement les policies écrites pour restreindre le même rôle sur la même ressource.
 *
 * Cas réel seedé en production (migration 20250624122150) :
 *   - MISSION_READ                        : MISSION / READ, rôle SUPERVISOR, sans policy
 *   - MISSION_SAME_STRUCTURE_FULL         : MISSION / FULL, rôle SUPERVISOR, policy « sa structure »
 *   - MISSION_SAME_STRUCTURE_FULL_NETWORK : MISSION / FULL, rôle SUPERVISOR, policy « son réseau »
 *
 * `getMatchingPermissions` fait remonter les trois pour l'action READ (FULL couvre READ) :
 * les deux policies de périmètre ne sont jamais évaluées.
 */
import { isAuthorized } from "./accessControl";
import { getPolicyMongoFilter } from "./policyQuery";
import { PERMISSION_ACTIONS } from "./constantes/actions";
import { PERMISSION_RESOURCES } from "./constantes/resources";
import { ROLES } from "../roles";

const SA_STRUCTURE = "aaaaaaaaaaaaaaaaaaaaaaaa";
const STRUCTURE_TIERCE = "bbbbbbbbbbbbbbbbbbbbbbbb";

const superviseur = {
  _id: "111111111111111111111111",
  role: ROLES.SUPERVISOR,
  email: "superviseur@example.org",
  firstName: "Super",
  lastName: "Viseur",
  region: "Ile-de-France",
  department: ["75"],
  structureId: SA_STRUCTURE,
  acl: [
    {
      code: "mission:same-structure:full",
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.FULL,
      policy: [{ where: [{ field: "structureId", source: "structureId" }] }],
    },
    {
      code: "mission:same-structure-network:full",
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.FULL,
      policy: [{ where: [{ resource: "structure", field: "networkId", source: "structureId" }] }],
    },
    // la permission large, sans policy, seedée pour le même rôle et la même ressource
    { code: "mission:read", resource: PERMISSION_RESOURCES.MISSION, action: PERMISSION_ACTIONS.READ, policy: [] },
  ],
} as any;

describe("H87 — une permission sans policy ne doit pas annuler les policies du même rôle", () => {
  it("refuse la lecture d'une mission hors de la structure du superviseur", () => {
    const autorise = isAuthorized({
      user: superviseur,
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.READ,
      context: { mission: { structureId: STRUCTURE_TIERCE }, structure: { networkId: STRUCTURE_TIERCE } },
    });

    expect(autorise).toBe(false);
  });

  it("autorise toujours la lecture d'une mission de sa propre structure", () => {
    const autorise = isAuthorized({
      user: superviseur,
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.READ,
      context: { mission: { structureId: SA_STRUCTURE }, structure: { networkId: STRUCTURE_TIERCE } },
    });

    expect(autorise).toBe(true);
  });

  it("produit un filtre Mongo de périmètre au lieu d'un accès non restreint", () => {
    const filtre = getPolicyMongoFilter({ user: superviseur, resource: PERMISSION_RESOURCES.MISSION, action: PERMISSION_ACTIONS.READ });

    expect(filtre).not.toBeNull();
    expect(filtre).toEqual({ $or: [{ structureId: SA_STRUCTURE }] });
  });

  it("laisse inchangé un rôle qui n'a que des permissions sans policy (admin)", () => {
    const admin = {
      _id: "222222222222222222222222",
      role: ROLES.ADMIN,
      acl: [{ code: "mission:full", resource: PERMISSION_RESOURCES.MISSION, action: PERMISSION_ACTIONS.FULL, policy: [] }],
    } as any;

    expect(isAuthorized({ user: admin, resource: PERMISSION_RESOURCES.MISSION, action: PERMISSION_ACTIONS.READ, context: { mission: { structureId: STRUCTURE_TIERCE } } })).toBe(true);
    expect(getPolicyMongoFilter({ user: admin, resource: PERMISSION_RESOURCES.MISSION, action: PERMISSION_ACTIONS.READ })).toBeNull();
  });
});
