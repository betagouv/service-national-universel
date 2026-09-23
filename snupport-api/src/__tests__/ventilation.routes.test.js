// Lot P (M95, M96) : les règles de ventilation s'exécutent automatiquement sur les tickets entrants.
// GET renvoyait toutes les règles et POST/PATCH/DELETE n'étaient pas cloisonnés : tout agent, référent
// SNU compris, pouvait lire, créer, modifier ou supprimer n'importe quelle règle, y compris centrale.
const express = require("express");
const request = require("supertest");

const AGENT_RULE_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const REFERENT_RULE_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const UNKNOWN_RULE_ID = "cccccccccccccccccccccccc";

let mockCurrentUser;

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
}));

jest.mock("../models/ventilation", () => ({
  find: jest.fn().mockResolvedValue([]),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn().mockResolvedValue(undefined),
  findByIdAndDelete: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockResolvedValue(undefined),
}));

const VentilationModel = require("../models/ventilation");
const { validationErrorHandler } = require("../middlewares/validation");
const ventilationRouter = require("../controllers/ventilation");

const RULES = {
  [AGENT_RULE_ID]: { _id: AGENT_RULE_ID, userRole: "AGENT" },
  [REFERENT_RULE_ID]: { _id: REFERENT_RULE_ID, userRole: "REFERENT_REGION", userRegion: "Bretagne" },
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/ventilation", ventilationRouter);
  app.use(validationErrorHandler);
  return app;
};

const REFERENT = { _id: "dddddddddddddddddddddddd", role: "REFERENT_REGION", region: "Bretagne" };
const AGENT = { _id: "eeeeeeeeeeeeeeeeeeeeeeee", role: "AGENT" };

const validRule = { name: "r", description: "d", active: true, actions: [], conditionsEt: [], conditionsOu: [] };

beforeEach(() => {
  jest.clearAllMocks();
  VentilationModel.findById.mockImplementation(async (id) => RULES[id] || null);
});

describe("GET /ventilation", () => {
  it("ne renvoie à un agent que les règles centrales", async () => {
    mockCurrentUser = AGENT;
    await request(buildApp()).get("/ventilation");
    expect(VentilationModel.find).toHaveBeenCalledWith({ userRole: "AGENT" });
  });

  it("borne un référent régional à ses propres règles", async () => {
    mockCurrentUser = REFERENT;
    await request(buildApp()).get("/ventilation");
    expect(VentilationModel.find).toHaveBeenCalledWith({ userRole: "REFERENT_REGION", userRegion: "Bretagne" });
  });
});

describe("POST /ventilation", () => {
  it("force le rôle et le territoire d'un référent à la création", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).post("/ventilation").send(validRule);
    expect(res.status).toBe(200);
    expect(VentilationModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userRole: "REFERENT_REGION", userRegion: "Bretagne" })
    );
  });
});

describe("PATCH /ventilation/:id", () => {
  it("interdit à un référent de modifier une règle centrale", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).patch(`/ventilation/${AGENT_RULE_ID}`).send({ name: "pirate" });
    expect(res.status).toBe(403);
    expect(VentilationModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("laisse un agent central modifier une règle centrale", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp()).patch(`/ventilation/${AGENT_RULE_ID}`).send({ name: "ok" });
    expect(res.status).toBe(200);
    expect(VentilationModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: AGENT_RULE_ID }, { name: "ok" });
  });

  it("renvoie 404 pour une règle inconnue", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp()).patch(`/ventilation/${UNKNOWN_RULE_ID}`).send({ name: "x" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /ventilation/:id", () => {
  it("interdit à un référent de supprimer une règle centrale", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).delete(`/ventilation/${AGENT_RULE_ID}`);
    expect(res.status).toBe(403);
    expect(VentilationModel.findByIdAndDelete).not.toHaveBeenCalled();
  });
});
