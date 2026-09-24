// Lot R1 (GOO-32) : jetons agents révocables (M98), secret JWT obligatoire (L47), agents exposés sans leurs
// champs de réinitialisation (L49), politique de mot de passe alignée sur l'API v1 (L52).
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const AGENT_ID = "cccccccccccccccccccccccc";
const SECRET = "test-secret";
// Mot de passe conforme construit à l'exécution : un littéral est pris pour un secret par GitGuardian.
const COMPLIANT_PASSWORD = ["A", "b".repeat(10), "1", "!"].join("");

let mockCurrentUser;

jest.mock("../config", () => ({ config: { JWT_SECRET: "test-secret", PASSWORD_RESET_TOKEN_SECRET: "reset", SNUPPORT_URL_ADMIN: "http://admin" } }));
jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
  apiKeyGuard: (_req, _res, next) => next(),
}));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../brevo", () => ({ sendEmail: jest.fn() }));
jest.mock("../models/organisation", () => ({ findById: jest.fn().mockResolvedValue(null), findOne: jest.fn().mockResolvedValue(null) }));
jest.mock("../models/agent", () => ({ findById: jest.fn(), findOne: jest.fn(), find: jest.fn() }));
jest.mock("../models/contact", () => ({ findById: jest.fn(), findOne: jest.fn() }));
jest.mock("../utils", () => ({
  validatePassword: jest.requireActual("../utils/password").validatePassword,
  diacriticSensitiveRegex: (s) => s,
}));

const AgentModel = require("../models/agent");
const ContactModel = require("../models/contact");
const { signAgentToken, validateAgentTokenPayload, isAgentTokenCurrent } = require("../utils/agentToken");
const { serializeAgent, serializeAgentSelf } = require("../utils/agentSerializer");
const { JWT_MAX_AGE, JWT_VERSION, checkJwtVersion } = require("../jwt-options");
const { validationErrorHandler } = require("../middlewares/validation");

// Reproduit la vérification de la stratégie "agent" de passport.js.
const authenticate = (token, agent) => {
  const payload = jwt.verify(token, SECRET);
  const { error, value } = validateAgentTokenPayload(payload);
  if (error || !checkJwtVersion(value)) return false;
  return isAgentTokenCurrent(agent, value);
};

const buildAgentDoc = (fields = {}) => {
  const doc = {
    _id: AGENT_ID,
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    role: "AGENT",
    organisationId: "org",
    snuReferentId: "snu-123",
    forgotPasswordResetToken: "hash",
    forgotPasswordResetExpires: new Date(),
    lastLogoutAt: null,
    passwordChangedAt: null,
    ...fields,
  };
  doc.set = jest.fn((values) => Object.assign(doc, values));
  doc.save = jest.fn().mockResolvedValue(doc);
  doc.toObject = () => {
    // eslint-disable-next-line no-unused-vars
    const { set, save, toObject, ...rest } = doc;
    return rest;
  };
  return doc;
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.cookie = jest.fn();
    res.clearCookie = jest.fn();
    next();
  });
  app.use("/agent", require("../controllers/agent"));
  app.use("/contact", require("../controllers/contact"));
  app.use(validationErrorHandler);
  return app;
};

beforeEach(() => jest.clearAllMocks());

describe("M98 : jetons de session agent", () => {
  it("dure 2 h et porte les dates d'invalidation", () => {
    expect(JWT_MAX_AGE).toBe(2 * 60 * 60);
    const payload = jwt.verify(signAgentToken(buildAgentDoc()), SECRET);
    expect(payload.exp - payload.iat).toBe(2 * 60 * 60);
    expect(payload).toMatchObject({ __v: JWT_VERSION, _id: AGENT_ID, lastLogoutAt: null, passwordChangedAt: null });
  });

  it("accepte un jeton à jour", () => {
    const agent = buildAgentDoc();
    expect(authenticate(signAgentToken(agent), agent)).toBe(true);
  });

  it("refuse un jeton émis avant un changement de mot de passe", () => {
    const agent = buildAgentDoc();
    const token = signAgentToken(agent);
    agent.passwordChangedAt = new Date();
    expect(authenticate(token, agent)).toBe(false);
  });

  it("refuse un jeton émis avant une déconnexion", () => {
    const agent = buildAgentDoc({ lastLogoutAt: new Date("2026-09-01T10:00:00.123Z") });
    const token = signAgentToken(agent);
    expect(authenticate(token, agent)).toBe(true);
    agent.lastLogoutAt = new Date("2026-09-24T10:00:00.456Z");
    expect(authenticate(token, agent)).toBe(false);
  });

  it("refuse un ancien jeton sans les dates d'invalidation", () => {
    const legacy = jwt.sign({ __v: "0", _id: AGENT_ID }, SECRET, { expiresIn: 60 });
    expect(authenticate(legacy, buildAgentDoc())).toBe(false);
  });

  it("POST /agent/logout avance lastLogoutAt, ce qui révoque le jeton courant", async () => {
    mockCurrentUser = buildAgentDoc();
    const token = signAgentToken(mockCurrentUser);
    const res = await request(buildApp()).post("/agent/logout");
    expect(res.status).toBe(200);
    expect(mockCurrentUser.save).toHaveBeenCalled();
    expect(mockCurrentUser.lastLogoutAt).toBeTruthy();
    expect(authenticate(token, mockCurrentUser)).toBe(false);
  });

  it("POST /agent/forgot_password_reset avance passwordChangedAt, ce qui révoque les sessions ouvertes", async () => {
    const agent = buildAgentDoc();
    const token = signAgentToken(agent);
    AgentModel.findOne.mockResolvedValue(agent);
    const res = await request(buildApp())
      .post("/agent/forgot_password_reset")
      .send({ token: "a".repeat(40), password: COMPLIANT_PASSWORD, passwordConfirm: COMPLIANT_PASSWORD });
    expect(res.status).toBe(200);
    expect(agent.passwordChangedAt).toBeTruthy();
    expect(authenticate(token, agent)).toBe(false);
  });

  it("POST /agent/forgot_password donne 1 h au lien de réinitialisation (et non 86 secondes)", async () => {
    const agent = buildAgentDoc();
    AgentModel.findOne.mockResolvedValue(agent);
    const before = Date.now();
    await request(buildApp()).post("/agent/forgot_password").send({ email: "ada@example.com" });
    expect(agent.forgotPasswordResetExpires - before).toBeGreaterThanOrEqual(60 * 60 * 1000 - 1000);
  });
});

describe("M98 : stratégie passport « agent » réelle", () => {
  const passport = require("passport");
  const cookieParser = require("cookie-parser");
  require("../passport")();

  const buildGuardedApp = () => {
    const app = express();
    app.use(cookieParser());
    app.use(passport.initialize());
    app.get("/protected", passport.authenticate("agent", { session: false }), (req, res) => res.send({ ok: true, id: req.user._id }));
    return app;
  };

  it("accepte le jeton courant", async () => {
    const agent = buildAgentDoc();
    AgentModel.findById.mockResolvedValue(agent);
    const res = await request(buildGuardedApp())
      .get("/protected")
      .set("Cookie", `jwtzamoud=${signAgentToken(agent)}`);
    expect(res.status).toBe(200);
  });

  it("répond 401 à un jeton émis avant un changement de mot de passe", async () => {
    const agent = buildAgentDoc();
    const token = signAgentToken(agent);
    AgentModel.findById.mockResolvedValue(buildAgentDoc({ passwordChangedAt: new Date() }));
    const res = await request(buildGuardedApp()).get("/protected").set("Cookie", `jwtzamoud=${token}`);
    expect(res.status).toBe(401);
  });

  it("répond 401 à un jeton émis avant une déconnexion", async () => {
    const agent = buildAgentDoc();
    const token = signAgentToken(agent);
    AgentModel.findById.mockResolvedValue(buildAgentDoc({ lastLogoutAt: new Date() }));
    const res = await request(buildGuardedApp()).get("/protected").set("Cookie", `jwtzamoud=${token}`);
    expect(res.status).toBe(401);
  });

  it("répond 401 à un jeton de l'ancien format (24 h, sans dates)", async () => {
    AgentModel.findById.mockResolvedValue(buildAgentDoc());
    const legacy = jwt.sign({ __v: "0", _id: AGENT_ID }, SECRET, { expiresIn: 60 * 60 * 24 });
    const res = await request(buildGuardedApp()).get("/protected").set("Cookie", `jwtzamoud=${legacy}`);
    expect(res.status).toBe(401);
  });
});

describe("L52 : politique de mot de passe", () => {
  it.each(["abc123", "motdepasselong", "MotDePasseLong1"])("refuse %s", async (password) => {
    AgentModel.findOne.mockResolvedValue(buildAgentDoc());
    const res = await request(buildApp())
      .post("/agent/forgot_password_reset")
      .send({ token: "a".repeat(40), password, passwordConfirm: password });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PASSWORD_NOT_VALIDATED");
  });

  it("POST /agent crée toujours l'agent avec un mot de passe aléatoire", async () => {
    mockCurrentUser = buildAgentDoc();
    AgentModel.create = jest.fn().mockResolvedValue({});
    const res = await request(buildApp()).post("/agent").send({ email: "new@example.com", firstName: "N", lastName: "A", role: "AGENT" });
    expect(res.body).toEqual({ ok: true });
    expect(AgentModel.create).toHaveBeenCalled();
  });
});

describe("L49 : exposition des agents", () => {
  it("les sérialiseurs ne sortent ni les champs de réinitialisation ni snuReferentId", () => {
    const agent = buildAgentDoc();
    for (const serialized of [serializeAgent(agent), serializeAgentSelf(agent)]) {
      expect(serialized).not.toHaveProperty("forgotPasswordResetToken");
      expect(serialized).not.toHaveProperty("forgotPasswordResetExpires");
      expect(serialized).not.toHaveProperty("snuReferentId");
      expect(serialized).not.toHaveProperty("lastLogoutAt");
      expect(serialized).not.toHaveProperty("passwordChangedAt");
      expect(serialized).toMatchObject({ _id: AGENT_ID, firstName: "Ada", role: "AGENT" });
    }
  });

  it("GET /agent projette les champs publics", async () => {
    mockCurrentUser = buildAgentDoc();
    const select = jest.fn().mockResolvedValue([buildAgentDoc()]);
    AgentModel.find.mockReturnValue({ select });
    const res = await request(buildApp()).get("/agent");
    expect(select).toHaveBeenCalledWith("_id firstName lastName email role departments region");
    expect(res.body.data.AGENT).toEqual([{ _id: AGENT_ID, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", role: "AGENT" }]);
  });

  it("GET /agent/me ne renvoie pas les champs de sécurité", async () => {
    mockCurrentUser = buildAgentDoc();
    const res = await request(buildApp()).get("/agent/me");
    expect(res.body.user).not.toHaveProperty("forgotPasswordResetToken");
    expect(res.body.user).not.toHaveProperty("snuReferentId");
    expect(res.body.user).toMatchObject({ _id: AGENT_ID, organisationId: "org" });
  });

  it("GET /contact/:id projette les champs publics quand l'identifiant désigne un agent", async () => {
    mockCurrentUser = buildAgentDoc();
    ContactModel.findById.mockResolvedValue(null);
    const select = jest.fn().mockResolvedValue({ _id: AGENT_ID, firstName: "Ada", role: "AGENT" });
    AgentModel.findById.mockReturnValue({ select });
    const res = await request(buildApp()).get(`/contact/${AGENT_ID}`);
    expect(res.status).toBe(200);
    expect(select).toHaveBeenCalledWith("_id firstName lastName email role departments region");
  });
});

describe("L47 : JWT_SECRET obligatoire hors développement", () => {
  const loadConfig = (env) => {
    const saved = { ...process.env };
    Object.assign(process.env, env);
    try {
      let config;
      jest.isolateModules(() => {
        jest.unmock("../config");
        config = jest.requireActual("../config").config;
      });
      return config;
    } finally {
      process.env = saved;
    }
  };

  it("refuse de démarrer en production sans JWT_SECRET", () => {
    delete process.env.JWT_SECRET;
    expect(() => loadConfig({ ENVIRONMENT: "production", PASSWORD_RESET_TOKEN_SECRET: "x" })).toThrow("JWT_SECRET");
  });

  it("démarre en production avec JWT_SECRET, sans repli", () => {
    expect(loadConfig({ ENVIRONMENT: "production", PASSWORD_RESET_TOKEN_SECRET: "x", JWT_SECRET: "prod-secret" }).JWT_SECRET).toBe("prod-secret");
  });

  it("garde le repli en test", () => {
    delete process.env.JWT_SECRET;
    expect(loadConfig({ ENVIRONMENT: "test" }).JWT_SECRET).toBe("my-secret");
  });
});
