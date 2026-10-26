// PM45 : POST /ticket laissait un référent départemental/régional créer un ticket sur n'importe
// quel contact "young" (fiche existante hors de son périmètre renvoyée en entier), et créait un
// contact inconnu pour n'importe quelle adresse email fournie. Piège de test (confirmé dans ce
// dépôt) : canAccessContact renvoie `true` dès que `contact.role !== "young"` — un contact de test
// SANS `role: "young"` explicite rend n'importe quel test vert par construction. On fixe donc
// toujours role, department ET region sur les contacts mockés.
const express = require("express");
const request = require("supertest");

const REFERENT_DEPT = { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", role: "REFERENT_DEPARTMENT", departments: ["Rhône"], firstName: "Réf", lastName: "Dép", email: "refdep@example.com" };
const REFERENT_REGION = { _id: "bbbbbbbbbbbbbbbbbbbbbbbb", role: "REFERENT_REGION", region: "Auvergne-Rhône-Alpes", firstName: "Réf", lastName: "Rég", email: "refregion@example.com" };
const AGENT = { _id: "cccccccccccccccccccccccc", role: "AGENT", firstName: "Agent", lastName: "Support", email: "agent@example.com" };

let mockCurrentUser;

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
}));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: async (t) => t }));
jest.mock("../utils", () => ({
  sendEmailWithConditions: jest.fn().mockResolvedValue(undefined),
  sendNotif: jest.fn().mockResolvedValue(undefined),
  weekday: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  getHoursDifference: () => 1,
  SENDINBLUE_TEMPLATES: { NEW_TICKET: "1254" },
  diacriticSensitiveRegex: (s) => s,
}));

const mockTicketDoc = (attrs) => ({ save: jest.fn().mockResolvedValue(undefined), ...attrs });

jest.mock("../models/ticket", () => ({
  find: jest.fn(() => ({ sort: () => ({ collation: () => ({ limit: async () => [{ number: "41" }] }) }) })),
  create: jest.fn(),
}));
jest.mock("../models/contact", () => ({ findOne: jest.fn(), create: jest.fn() }));
jest.mock("../models/agent", () => ({ findOne: jest.fn() }));
jest.mock("../models/message", () => ({ create: jest.fn().mockResolvedValue({ _id: "m1" }) }));
jest.mock("../models/tag", () => ({}));

const TicketModel = require("../models/ticket");
const ContactModel = require("../models/contact");
const MessageModel = require("../models/message");
const router = require("../controllers/ticket");

const app = express();
app.use(express.json());
app.use("/ticket", router);
app.use(require("../middlewares/validation").validationErrorHandler);

beforeEach(() => {
  jest.clearAllMocks();
  TicketModel.create.mockImplementation(async (obj) => mockTicketDoc({ _id: "t-new", number: 42, ...obj }));
});

const body = (overrides = {}) => ({
  subject: "Besoin d'aide",
  contactEmail: "cible@example.com",
  canal: "PLATFORM",
  message: "Bonjour",
  tags: [],
  copyRecipients: [],
  files: [],
  ...overrides,
});

describe("POST /ticket — périmètre du contact pour les référents (PM45)", () => {
  it("refuse un référent départemental sur un contact jeune hors de son département", async () => {
    mockCurrentUser = REFERENT_DEPT;
    ContactModel.findOne.mockResolvedValue({ _id: "c-cible", email: "cible@example.com", role: "young", department: "Paris", region: "Île-de-France" });

    const res = await request(app).post("/ticket").send(body());

    expect(res.status).toBe(403);
    expect(TicketModel.create).not.toHaveBeenCalled();
  });

  it("refuse un référent régional sur un contact jeune hors de sa région", async () => {
    mockCurrentUser = REFERENT_REGION;
    ContactModel.findOne.mockResolvedValue({ _id: "c-cible", email: "cible@example.com", role: "young", department: "Paris", region: "Île-de-France" });

    const res = await request(app).post("/ticket").send(body());

    expect(res.status).toBe(403);
    expect(TicketModel.create).not.toHaveBeenCalled();
  });

  it("accepte un référent départemental sur un contact jeune de son département", async () => {
    mockCurrentUser = REFERENT_DEPT;
    ContactModel.findOne.mockResolvedValue({ _id: "c-cible", email: "cible@example.com", role: "young", department: "Rhône", region: "Auvergne-Rhône-Alpes" });

    const res = await request(app).post("/ticket").send(body());

    expect(res.status).toBe(200);
    expect(TicketModel.create).toHaveBeenCalled();
  });

  it("ne crée pas de contact inconnu pour un référent départemental si l'email ne correspond à aucun contact", async () => {
    mockCurrentUser = REFERENT_DEPT;
    ContactModel.findOne.mockResolvedValue(null);

    const res = await request(app).post("/ticket").send(body());

    expect(res.status).toBe(403);
    expect(ContactModel.create).not.toHaveBeenCalled();
    expect(TicketModel.create).not.toHaveBeenCalled();
  });

  it("ne renvoie qu'une projection minimale du ticket créé par un référent départemental", async () => {
    mockCurrentUser = REFERENT_DEPT;
    ContactModel.findOne.mockResolvedValue({ _id: "c-cible", email: "cible@example.com", role: "young", department: "Rhône", region: "Auvergne-Rhône-Alpes", attributes: [{ name: "secret", value: "x" }] });

    const res = await request(app).post("/ticket").send(body());

    expect(res.status).toBe(200);
    expect(res.body.data.ticket).toEqual({ _id: "t-new", number: 42 });
  });

  it("n'applique aucune restriction de périmètre à un agent (contact jeune hors zone quelconque)", async () => {
    mockCurrentUser = AGENT;
    ContactModel.findOne.mockResolvedValue({ _id: "c-cible", email: "cible@example.com", role: "young", department: "Paris", region: "Île-de-France" });

    const res = await request(app).post("/ticket").send(body());

    expect(res.status).toBe(200);
    expect(TicketModel.create).toHaveBeenCalled();
    expect(res.body.data.ticket).toHaveProperty("_id", "t-new");
  });

  it("n'applique aucune restriction de périmètre à un référent sur un contact non-jeune (agent, admin, etc.)", async () => {
    mockCurrentUser = REFERENT_DEPT;
    ContactModel.findOne.mockResolvedValue({ _id: "c-cible", email: "cible@example.com", role: "admin", department: "Paris", region: "Île-de-France" });

    const res = await request(app).post("/ticket").send(body());

    expect(res.status).toBe(200);
    expect(TicketModel.create).toHaveBeenCalled();
  });
});
