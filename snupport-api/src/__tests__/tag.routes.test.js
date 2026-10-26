// Lot P (M90, L51) : les étiquettes sont partagées par tout le support. La création était déjà réservée
// aux agents centraux (requireRole AGENT), mais la modification, la suppression logique et une route de
// suppression définitive restaient ouvertes à tout agent. La recherche alimentait un `$regex` brut.
const express = require("express");
const request = require("supertest");

const TAG_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

let mockCurrentUser;

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
}));

jest.mock("../models/tag", () => ({
  find: jest.fn(() => ({ sort: jest.fn().mockResolvedValue([]) })),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn().mockResolvedValue(undefined),
  findByIdAndDelete: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockResolvedValue(undefined),
}));

const TagModel = require("../models/tag");
const { validationErrorHandler } = require("../middlewares/validation");
const tagRouter = require("../controllers/tag");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/tag", tagRouter);
  app.use(validationErrorHandler);
  return app;
};

const REFERENT = { _id: "dddddddddddddddddddddddd", role: "REFERENT_REGION", region: "Bretagne" };
const AGENT = { _id: "eeeeeeeeeeeeeeeeeeeeeeee", role: "AGENT" };

beforeEach(() => jest.clearAllMocks());

describe("administration des étiquettes réservée au support central", () => {
  it("interdit à un référent de modifier une étiquette", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).patch(`/tag/${TAG_ID}`).send({ name: "x" });
    expect(res.status).toBe(403);
    expect(TagModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("interdit à un référent la suppression logique d'une étiquette", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).put(`/tag/soft-delete/${TAG_ID}`);
    expect(res.status).toBe(403);
    expect(TagModel.findById).not.toHaveBeenCalled();
  });

  it("laisse un agent central modifier une étiquette", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp()).patch(`/tag/${TAG_ID}`).send({ name: "ok" });
    expect(res.status).toBe(200);
    expect(TagModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: TAG_ID }, { name: "ok" });
  });

  it("a retiré la route de suppression définitive", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp()).delete(`/tag/${TAG_ID}`);
    expect(res.status).toBe(404);
    expect(TagModel.findByIdAndDelete).not.toHaveBeenCalled();
  });
});

describe("GET /tag/search", () => {
  it("échappe et ancre la saisie avant de la passer à $regex (L51)", async () => {
    mockCurrentUser = AGENT;
    await request(buildApp()).get("/tag/search").query({ q: ".*" });
    expect(TagModel.find).toHaveBeenCalledWith({
      deletedAt: null,
      name: { $regex: "^\\.\\*.*$", $options: "i" },
    });
  });

  it("restreint un référent aux étiquettes visibles par tous", async () => {
    mockCurrentUser = REFERENT;
    await request(buildApp()).get("/tag/search").query({ q: "abc" });
    expect(TagModel.find).toHaveBeenCalledWith(expect.objectContaining({ userVisibility: "ALL" }));
  });
});
