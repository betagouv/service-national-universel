// Lot P19 (PM44, PL19) : POST /kb-search n'exigeait qu'un agent authentifié (agentGuard), pas
// nécessairement AGENT — un référent synchronisé lisait l'historique des recherches internes de la
// base de connaissance. Le find() sur KbSearchModel n'avait par ailleurs aucune borne.
const express = require("express");
const request = require("supertest");

let mockCurrentUser;

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
}));

jest.mock("../models/kbSearch", () => ({
  find: jest.fn(),
}));

const KbSearchModel = require("../models/kbSearch");
const { validationErrorHandler } = require("../middlewares/validation");
const kbSearchRouter = require("../controllers/kbSearch");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/kb-search", kbSearchRouter);
  app.use(validationErrorHandler);
  return app;
};

const AGENT = { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", role: "AGENT" };
const REFERENT = { _id: "bbbbbbbbbbbbbbbbbbbbbbbb", role: "REFERENT_DEPARTMENT", departments: ["Paris"] };

const chainableQuery = (result) => {
  const q = { sort: () => q, limit: () => Promise.resolve(result) };
  return q;
};

beforeEach(() => {
  jest.clearAllMocks();
  KbSearchModel.find.mockReturnValue(chainableQuery([]));
});

describe("POST /kb-search (PM44, PL19)", () => {
  it("refuse un référent synchronisé", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).post("/kb-search").send({});
    expect(res.status).toBe(403);
    expect(KbSearchModel.find).not.toHaveBeenCalled();
  });

  it("autorise l'agent central", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp()).post("/kb-search").send({});
    expect(res.status).toBe(200);
    expect(KbSearchModel.find).toHaveBeenCalled();
  });

  it("borne le nombre de résultats renvoyés", async () => {
    mockCurrentUser = AGENT;
    let limitArg;
    KbSearchModel.find.mockReturnValue({
      sort: () => ({
        limit: (n) => {
          limitArg = n;
          return Promise.resolve([]);
        },
      }),
    });
    await request(buildApp()).post("/kb-search").send({});
    expect(limitArg).toBeGreaterThan(0);
    expect(limitArg).toBeLessThanOrEqual(500);
  });
});
