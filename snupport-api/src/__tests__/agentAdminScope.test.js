const { canAdministerAgents, canAssignRole, canManageAgent } = require("../utils/agentAdminScope");

const ORG = "org_snu";
const AUTRE_ORG = "org_autre";
const agent = (role, organisationId = ORG, _id = "self") => ({ _id, role, organisationId });

const ADMINISTRATORS = ["AGENT"];
const PROVISIONED = ["DG", "REFERENT_REGION", "REFERENT_DEPARTMENT"];
const ALL_ROLES = [...ADMINISTRATORS, ...PROVISIONED];

describe("canAdministerAgents", () => {
  it.each(ADMINISTRATORS)("allows %s to administer agent accounts", (role) => {
    expect(canAdministerAgents(agent(role))).toBe(true);
  });

  it.each(PROVISIONED)("refuses %s", (role) => {
    expect(canAdministerAgents(agent(role))).toBe(false);
  });

  it("refuses a user without a role", () => {
    expect(canAdministerAgents({ organisationId: ORG })).toBe(false);
  });
});

describe("canAssignRole", () => {
  it.each(ALL_ROLES)("allows an AGENT to create a %s account", (role) => {
    expect(canAssignRole(agent("AGENT"), role)).toBe(true);
  });

  it.each(PROVISIONED)("refuses a %s creating any account", (role) => {
    expect(canAssignRole(agent(role), "REFERENT_DEPARTMENT")).toBe(false);
  });

  it("refuses an unknown role", () => {
    expect(canAssignRole(agent("AGENT"), "SUPERUSER")).toBe(false);
  });
});

describe("canManageAgent", () => {
  it.each(ALL_ROLES)("allows an AGENT acting on a %s of the same organisation", (role) => {
    expect(canManageAgent(agent("AGENT"), agent(role, ORG, "target"))).toBe(true);
  });

  it.each(ALL_ROLES)("refuses acting on a %s of another organisation", (role) => {
    expect(canManageAgent(agent("AGENT"), agent(role, AUTRE_ORG, "target"))).toBe(false);
  });

  it.each(PROVISIONED)("refuses a %s acting on anyone", (role) => {
    expect(canManageAgent(agent(role), agent("REFERENT_REGION", ORG, "target"))).toBe(false);
  });

  it("refuses a missing target", () => {
    expect(canManageAgent(agent("AGENT"), null)).toBe(false);
  });
});

// Le rôle ADMIN a été supprimé : il n'ouvrait aucun droit nulle part et cassait GET /agent.
// Ces cas verrouillent la suppression — le réintroduire doit faire échouer la suite.
describe("the removed ADMIN role", () => {
  it("cannot administer agent accounts", () => {
    expect(canAdministerAgents(agent("ADMIN"))).toBe(false);
  });

  it("cannot be assigned to a new account", () => {
    expect(canAssignRole(agent("AGENT"), "ADMIN")).toBe(false);
  });

  // Choix délibéré : un compte au rôle inconnu reste administrable par un AGENT, pour
  // qu'un éventuel document historique puisse être nettoyé plutôt que de rester bloqué.
  // Sans droits propres (canAdministerAgents est faux pour lui), il ne présente aucun risque.
  it("stays manageable so a legacy account can be cleaned up", () => {
    expect(canManageAgent(agent("AGENT"), agent("ADMIN", ORG, "target"))).toBe(true);
  });

  it("stays protected by the organisation boundary", () => {
    expect(canManageAgent(agent("AGENT"), agent("ADMIN", AUTRE_ORG, "target"))).toBe(false);
  });
});
