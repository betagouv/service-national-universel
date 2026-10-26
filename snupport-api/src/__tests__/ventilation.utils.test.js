// Lot P19 (PM47) : les règles de ventilation d'un référent s'exécutaient sur n'importe quel ticket
// de son territoire, y compris hors périmètre de lecture (TECHNICAL), au lieu des seuls tickets
// QUESTION (mêmes règles que ticketScope.js). Par ailleurs, une règle pointant vers un agent
// supprimé/inexistant faisait planter le traitement (setAgent renvoie `undefined`, puis le bloc qui
// journalise l'erreur replante à son tour sur ce `undefined`) : la requête entrante (POST /v0/message,
// IMAP, POST /ticket, PATCH /ticket/:id, POST /message) ne recevait alors jamais de réponse (DoS).
jest.mock("../models/ventilation", () => ({ find: jest.fn() }));
jest.mock("../models/folder", () => ({ findOne: jest.fn() }));
jest.mock("../models/tag", () => ({ findById: jest.fn() }));
jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));

let mockSetAgent;
let mockSetContact;
jest.mock("../utils", () => ({
  setAgent: (...args) => mockSetAgent(...args),
  setContact: (...args) => mockSetContact(...args),
}));

const VentilationModel = require("../models/ventilation");
const { capture } = require("../sentry");
const { matchVentilationRule } = require("../utils/ventilation");

const buildTicket = (overrides = {}) => ({
  agentId: null,
  foldersId: [],
  folders: [],
  tagsId: [],
  tags: [],
  logVentilation: [],
  contactRegion: "Bretagne",
  contactDepartment: "75",
  formSubjectStep1: "TECHNICAL",
  set(fields) {
    Object.assign(this, fields);
  },
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSetAgent = jest.fn(async (ticket) => ticket);
  mockSetContact = jest.fn(async (ticket) => ticket);
});

describe("matchVentilationRule — périmètre des règles de référent (PM47)", () => {
  it("exclut les règles de référent (région/département) pour un ticket hors périmètre de lecture (TECHNICAL)", async () => {
    VentilationModel.find.mockResolvedValue([]);
    await matchVentilationRule(buildTicket({ formSubjectStep1: "TECHNICAL" }));
    const query = VentilationModel.find.mock.calls[0][0];
    expect(query.$or.some((clause) => clause.userRole === "REFERENT_REGION")).toBe(false);
    expect(query.$or.some((clause) => clause.userRole === "REFERENT_DEPARTMENT")).toBe(false);
    expect(query.$or.some((clause) => clause.userRole === "AGENT")).toBe(true);
  });

  it("inclut les règles de référent (région/département) pour un ticket QUESTION de leur territoire", async () => {
    VentilationModel.find.mockResolvedValue([]);
    await matchVentilationRule(buildTicket({ formSubjectStep1: "QUESTION" }));
    const query = VentilationModel.find.mock.calls[0][0];
    const regionBranch = query.$or.find((clause) => clause.userRole === "REFERENT_REGION");
    const deptBranch = query.$or.find((clause) => clause.userRole === "REFERENT_DEPARTMENT");
    expect(regionBranch).toEqual({ userRole: "REFERENT_REGION", userRegion: "Bretagne" });
    expect(deptBranch).toEqual({ userRole: "REFERENT_DEPARTMENT", userDepartment: "75" });
  });
});

describe("matchVentilationRule — non-régression du DoS agentId (PM47)", () => {
  const ruleSettingAgent = {
    _id: "rule1",
    conditionsEt: [],
    conditionsOu: [],
    actions: [{ action: "SET", field: "agentId", value: "agent-supprime" }],
  };

  it("ne plante pas quand setAgent ne trouve pas l'agent et renvoie le ticket inchangé (contrat respecté)", async () => {
    VentilationModel.find.mockResolvedValue([ruleSettingAgent]);
    mockSetAgent = jest.fn(async (ticket) => ticket);
    const ticket = buildTicket();
    const result = await matchVentilationRule(ticket);
    expect(result).toBe(ticket);
    expect(result.logVentilation).toContain("rule1");
    expect(capture).not.toHaveBeenCalled();
  });

  it("ne rejette pas la promesse (ne replante pas) même si setAgent viole son contrat et renvoie undefined", async () => {
    VentilationModel.find.mockResolvedValue([ruleSettingAgent]);
    mockSetAgent = jest.fn(async () => undefined);
    const ticket = buildTicket();
    // Avant le correctif, ce second déréférencement (dans le bloc qui journalise l'erreur) faisait
    // rejeter la promesse : la requête entrante ne recevait alors jamais de réponse.
    await expect(matchVentilationRule(ticket)).resolves.not.toBeInstanceOf(Error);
    expect(capture).toHaveBeenCalled();
  });
});
