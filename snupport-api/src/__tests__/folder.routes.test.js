// Lot P (M84) : les dossiers de tickets portent un propriétaire par rôle/territoire, mais PATCH,
// DELETE et /reindex ne le vérifiaient pas : tout agent, référent SNU compris, pouvait renommer,
// réordonner ou supprimer n'importe quel dossier, y compris les dossiers centraux.
const express = require("express");
const request = require("supertest");

const AGENT_FOLDER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const REFERENT_FOLDER_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const UNKNOWN_FOLDER_ID = "cccccccccccccccccccccccc";

let mockCurrentUser;

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
}));

jest.mock("../models/folder", () => ({
  findById: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn().mockResolvedValue(undefined),
  findOneAndDelete: jest.fn().mockResolvedValue(undefined),
  countDocuments: jest.fn().mockResolvedValue(0),
  create: jest.fn().mockResolvedValue(undefined),
}));

const FolderModel = require("../models/folder");
const { validationErrorHandler } = require("../middlewares/validation");
const folderRouter = require("../controllers/folder");

const FOLDERS = {
  [AGENT_FOLDER_ID]: { _id: AGENT_FOLDER_ID, userRole: "AGENT" },
  [REFERENT_FOLDER_ID]: { _id: REFERENT_FOLDER_ID, userRole: "REFERENT_REGION", userRegion: "Bretagne" },
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/folder", folderRouter);
  app.use(validationErrorHandler);
  return app;
};

const REFERENT = { _id: "dddddddddddddddddddddddd", role: "REFERENT_REGION", region: "Bretagne" };
const AGENT = { _id: "eeeeeeeeeeeeeeeeeeeeeeee", role: "AGENT" };

beforeEach(() => {
  jest.clearAllMocks();
  FolderModel.findById.mockImplementation(async (id) => FOLDERS[id] || null);
});

describe("PATCH /folder/:id", () => {
  it("interdit à un référent de modifier un dossier central", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).patch(`/folder/${AGENT_FOLDER_ID}`).send({ name: "pirate" });
    expect(res.status).toBe(403);
    expect(FolderModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("laisse un agent central modifier un dossier central", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp()).patch(`/folder/${AGENT_FOLDER_ID}`).send({ name: "ok" });
    expect(res.status).toBe(200);
    expect(FolderModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: AGENT_FOLDER_ID }, { name: "ok" }, { new: true });
  });

  it("renvoie 404 pour un dossier inconnu", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp()).patch(`/folder/${UNKNOWN_FOLDER_ID}`).send({ name: "x" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /folder/:id", () => {
  it("interdit à un référent de supprimer un dossier central", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).delete(`/folder/${AGENT_FOLDER_ID}`);
    expect(res.status).toBe(403);
    expect(FolderModel.findOneAndDelete).not.toHaveBeenCalled();
  });

  it("laisse un référent supprimer son propre dossier", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).delete(`/folder/${REFERENT_FOLDER_ID}`);
    expect(res.status).toBe(200);
    expect(FolderModel.findOneAndDelete).toHaveBeenCalledWith({ _id: REFERENT_FOLDER_ID });
  });
});

describe("POST /folder/reindex", () => {
  it("ne réindexe que les dossiers du périmètre de l'appelant, et attend les écritures", async () => {
    mockCurrentUser = REFERENT;
    FolderModel.find.mockResolvedValue([FOLDERS[AGENT_FOLDER_ID], FOLDERS[REFERENT_FOLDER_ID]]);
    const res = await request(buildApp())
      .post("/folder/reindex")
      .send({ ids: [AGENT_FOLDER_ID, REFERENT_FOLDER_ID] });
    expect(res.status).toBe(200);
    // Le dossier central est ignoré ; seul le dossier du référent est réindexé.
    expect(FolderModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(FolderModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: REFERENT_FOLDER_ID }, { folderIndex: 1 });
  });
});
