// M86 : les routes publiques de lecture de la base de connaissance croyaient le rôle annoncé dans
// l'URL et le statut demandé en query : un anonyme lisait les articles réservés aux admins et les
// brouillons. M83 : POST /feedback, public, créait contacts et commentaires sans limite.
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const request = require("supertest");

const JWT_SECRET = "secret-de-test";
const API_KEY = "cle-api-v1";
const PARENT_ID = "cccccccccccccccccccccccc";
const ARTICLE_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

jest.mock("../config", () => ({ config: { JWT_SECRET: "secret-de-test" } }));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../utils/sitemap.utils", () => ({ revalidateSiteMap: jest.fn(), formatSectionsIntoSitemap: jest.fn() }));
jest.mock("../utils/index.js", () => ({ uploadPublicPicture: jest.fn(), diacriticSensitiveRegex: (s) => s }));
jest.mock("../models/kbSearch", () => ({ create: jest.fn() }));
jest.mock("../models/knowledgeBase", () => ({ find: jest.fn(), findOne: jest.fn(), findById: jest.fn(), findByIdAndUpdate: jest.fn(), exists: jest.fn() }));
jest.mock("../models/agent", () => ({ findById: jest.fn() }));
jest.mock("../models/organisation", () => ({ findOne: jest.fn() }));
jest.mock("../models/contact", () => ({ findOne: jest.fn(), create: jest.fn() }));
jest.mock("../models/feedback", () => ({ create: jest.fn() }));

const KnowledgeBaseModel = require("../models/knowledgeBase");
const AgentModel = require("../models/agent");
const OrganisationModel = require("../models/organisation");
const ContactModel = require("../models/contact");
const FeedbackModel = require("../models/feedback");
const { signReaderToken } = require("../utils/knowledgeBaseReader");

require("../passport")();

// Requête mongoose chaînable : sort/populate/limit/lean renvoient le même résultat.
const query = (result) => {
  const q = {
    sort: () => q,
    populate: () => q,
    lean: () => Promise.resolve(result),
    limit: () => Promise.resolve(result),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return q;
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use("/knowledge-base", require("../controllers/knowledgeBase"));
  app.use("/feedback", require("../controllers/feedback"));
  app.use("/v0/knowledge-base", require("../controllers/v0/knowledgeBase"));
  app.use(require("../middlewares/validation").validationErrorHandler);
  return app;
};

const readerAuth = (roles) => ({ Authorization: `KnowledgeBaseReader ${signReaderToken(roles)}` });
const agentAuth = (id) => ({ Authorization: `JWTZAMOUD ${jwt.sign({ __v: "0", _id: id }, JWT_SECRET)}` });

beforeEach(() => {
  jest.clearAllMocks();
  KnowledgeBaseModel.find.mockImplementation(() => query([]));
  KnowledgeBaseModel.findOne.mockImplementation(() => query(null));
  OrganisationModel.findOne.mockImplementation(({ apikey }) => Promise.resolve(apikey === API_KEY ? { _id: "org" } : null));
  AgentModel.findById.mockImplementation((id) => Promise.resolve(id === "agentsupport" ? { _id: id, role: "AGENT" } : { _id: id, role: "REFERENT_DEPARTMENT" }));
});

describe("GET /knowledge-base/:allowedRole (M86)", () => {
  it("sert la base publique à un anonyme, publiée seulement", async () => {
    const res = await request(buildApp()).get("/knowledge-base/public");
    expect(res.status).toBe(200);
    expect(KnowledgeBaseModel.find).toHaveBeenCalledWith({ allowedRoles: "public", status: "PUBLISHED" });
  });

  it.each(["admin", "referent", "young"])("refuse le rôle %s à un anonyme", async (role) => {
    const res = await request(buildApp()).get(`/knowledge-base/${role}`);
    expect(res.status).toBe(403);
    expect(KnowledgeBaseModel.find).not.toHaveBeenCalled();
  });

  it("sert un rôle porté par le jeton de lecture", async () => {
    const res = await request(buildApp())
      .get("/knowledge-base/referent")
      .set(readerAuth(["referent", "structure"]));
    expect(res.status).toBe(200);
  });

  it("refuse un rôle absent du jeton de lecture", async () => {
    const res = await request(buildApp())
      .get("/knowledge-base/admin")
      .set(readerAuth(["referent"]));
    expect(res.status).toBe(403);
  });

  it("refuse un jeton signé avec la clé des sessions agent", async () => {
    const forged = jwt.sign({ roles: ["admin"] }, JWT_SECRET, { audience: "knowledge-base-reader" });
    const res = await request(buildApp())
      .get("/knowledge-base/admin")
      .set({ Authorization: `KnowledgeBaseReader ${forged}` });
    expect(res.status).toBe(403);
  });

  it("refuse un jeton de lecture expiré", async () => {
    const expired = jwt.sign(
      { roles: ["admin"], exp: Math.floor(Date.now() / 1000) - 10 },
      require("crypto").createHmac("sha256", JWT_SECRET).update("knowledge-base-reader").digest(),
      {
        audience: "knowledge-base-reader",
      },
    );
    const res = await request(buildApp())
      .get("/knowledge-base/admin")
      .set({ Authorization: `KnowledgeBaseReader ${expired}` });
    expect(res.status).toBe(403);
  });

  it("n'accepte pas un jeton de lecture comme session agent", async () => {
    const res = await request(buildApp())
      .get("/knowledge-base/admin")
      .set({ Authorization: `JWTZAMOUD ${signReaderToken(["admin"])}` });
    expect(res.status).toBe(403);
  });

  it("sert tous les rôles à un éditeur de la base (agent du support central)", async () => {
    const res = await request(buildApp()).get("/knowledge-base/admin").set(agentAuth("agentsupport"));
    expect(res.status).toBe(200);
  });

  it("refuse un agent qui n'édite pas la base (référent synchronisé)", async () => {
    const res = await request(buildApp()).get("/knowledge-base/admin").set(agentAuth("referentsync"));
    expect(res.status).toBe(403);
  });

  it("sert tous les rôles à l'API v1 (clé d'API)", async () => {
    const res = await request(buildApp()).get("/knowledge-base/admin").set({ apikey: API_KEY });
    expect(res.status).toBe(200);
  });

  it("refuse une clé d'API inconnue", async () => {
    const res = await request(buildApp()).get("/knowledge-base/admin").set({ apikey: "autre" });
    expect(res.status).toBe(403);
  });
});

describe("GET /knowledge-base/:allowedRole/:slug (M86)", () => {
  it("refuse un article d'un rôle réservé à un anonyme", async () => {
    const res = await request(buildApp()).get("/knowledge-base/admin/un-article");
    expect(res.status).toBe(403);
    expect(KnowledgeBaseModel.findOne).not.toHaveBeenCalled();
  });

  it("ne cherche qu'un article publié du rôle prouvé", async () => {
    KnowledgeBaseModel.findOne.mockImplementation(() => query({ _id: ARTICLE_ID, type: "article", slug: "un-article" }));
    const res = await request(buildApp())
      .get("/knowledge-base/referent/un-article")
      .set(readerAuth(["referent"]));
    expect(res.status).toBe(200);
    expect(KnowledgeBaseModel.findOne).toHaveBeenCalledWith({ slug: "un-article", allowedRoles: "referent", status: "PUBLISHED" });
  });
});

describe("GET /knowledge-base/:allowedRole/search (M86)", () => {
  const search = (role, status) =>
    request(buildApp())
      .get(`/knowledge-base/${role}/search`)
      .query({ search: "inscription", ...(status ? { status } : {}) });
  const lastQuery = () => KnowledgeBaseModel.find.mock.calls[0][0];

  it("refuse la recherche admin (tous rôles) à un anonyme", async () => {
    const res = await search("admin");
    expect(res.status).toBe(403);
  });

  it.each(["DRAFT", "ARCHIVED", undefined])("ne renvoie que du publié à un anonyme (status=%s)", async (status) => {
    const res = await search("public", status);
    expect(res.status).toBe(200);
    expect(lastQuery()).toEqual(expect.objectContaining({ allowedRoles: "public", status: "PUBLISHED" }));
  });

  it("ne renvoie que du publié au porteur d'un jeton de lecture", async () => {
    const res = await search("referent", "DRAFT").set(readerAuth(["referent"]));
    expect(res.status).toBe(200);
    expect(lastQuery().status).toBe("PUBLISHED");
  });

  it("laisse l'éditeur de la base chercher dans tous les statuts (liens entre articles)", async () => {
    const res = await search("admin").set(agentAuth("agentsupport"));
    expect(res.status).toBe(200);
    expect(lastQuery()).not.toHaveProperty("status");
    expect(lastQuery()).not.toHaveProperty("allowedRoles");
  });
});

describe("POST /knowledge-base/:allowedRole/siblings (M86)", () => {
  it("ne renvoie que les éléments publiés du rôle, pas tous les enfants", async () => {
    const res = await request(buildApp()).post("/knowledge-base/public/siblings").send({ parentId: PARENT_ID });
    expect(res.status).toBe(200);
    expect(KnowledgeBaseModel.find).toHaveBeenCalledWith({ parentId: PARENT_ID, allowedRoles: "public", status: "PUBLISHED" });
  });

  it("refuse un rôle réservé à un anonyme", async () => {
    const res = await request(buildApp()).post("/knowledge-base/admin/siblings").send({ parentId: PARENT_ID });
    expect(res.status).toBe(403);
  });
});

describe("POST /v0/knowledge-base/reader-token (M86)", () => {
  const post = (body, headers = { apikey: API_KEY }) => request(buildApp()).post("/v0/knowledge-base/reader-token").set(headers).send(body);

  it("signe un jeton de lecture pour l'API v1", async () => {
    const res = await post({ roles: ["referent", "structure"] });
    expect(res.status).toBe(200);
    const read = await request(buildApp())
      .get("/knowledge-base/structure")
      .set({ Authorization: `KnowledgeBaseReader ${res.body.data.token}` });
    expect(read.status).toBe(200);
  });

  it("refuse un appel sans clé d'API", async () => {
    const res = await post({ roles: ["admin"] }, {});
    expect(res.status).toBe(401);
  });

  it("refuse un rôle inconnu", async () => {
    const res = await post({ roles: ["superadmin"] });
    expect(res.status).toBe(400);
  });
});

describe("POST /feedback (M83)", () => {
  const post = (body, headers = { apikey: API_KEY }) => request(buildApp()).post("/feedback").set(headers).send(body);

  beforeEach(() => {
    KnowledgeBaseModel.exists.mockResolvedValue({ _id: ARTICLE_ID });
    ContactModel.findOne.mockResolvedValue(null);
  });

  it("refuse un appel direct, sans la clé de l'API v1", async () => {
    const res = await post({ isPositive: true, knowledgeBaseArticle: ARTICLE_ID }, {});
    expect(res.status).toBe(401);
    expect(FeedbackModel.create).not.toHaveBeenCalled();
  });

  it("refuse un article inexistant ou non publié", async () => {
    KnowledgeBaseModel.exists.mockResolvedValue(null);
    const res = await post({ isPositive: true, knowledgeBaseArticle: ARTICLE_ID });
    expect(res.status).toBe(404);
    expect(KnowledgeBaseModel.exists).toHaveBeenCalledWith({ _id: ARTICLE_ID, type: "article", status: "PUBLISHED" });
    expect(FeedbackModel.create).not.toHaveBeenCalled();
  });

  it("refuse un commentaire de plus de 2000 caractères", async () => {
    const res = await post({ isPositive: false, knowledgeBaseArticle: ARTICLE_ID, comment: "x".repeat(2001) });
    expect(res.status).toBe(400);
  });

  it("ne crée pas de contact pour un email inconnu", async () => {
    const res = await post({ isPositive: false, knowledgeBaseArticle: ARTICLE_ID, contactEmail: "inconnu@example.org", comment: "pas clair" });
    expect(res.status).toBe(200);
    expect(ContactModel.create).not.toHaveBeenCalled();
    expect(FeedbackModel.create).toHaveBeenCalledWith({ isPositive: false, knowledgeBaseArticle: ARTICLE_ID, comment: "pas clair" });
  });

  it("rattache le feedback à un contact existant", async () => {
    ContactModel.findOne.mockResolvedValue({ _id: "contact1" });
    const res = await post({ isPositive: true, knowledgeBaseArticle: ARTICLE_ID, contactEmail: "connu@example.org" });
    expect(res.status).toBe(200);
    expect(FeedbackModel.create).toHaveBeenCalledWith({ isPositive: true, knowledgeBaseArticle: ARTICLE_ID, createdBy: "contact1" });
  });
});
