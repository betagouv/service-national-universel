// Lot P18 (GOO-76) : limite de débit sur les routes de connexion agent (PM42, audit du 25/09/2026).
const express = require("express");
const request = require("supertest");

jest.mock("../config", () => ({ config: { JWT_SECRET: "test-secret", PASSWORD_RESET_TOKEN_SECRET: "reset", SNUPPORT_URL_ADMIN: "http://admin" } }));
jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => next(),
  apiKeyGuard: (_req, _res, next) => next(),
}));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../brevo", () => ({ sendEmail: jest.fn() }));
jest.mock("../models/organisation", () => ({ findById: jest.fn().mockResolvedValue(null), findOne: jest.fn().mockResolvedValue(null) }));
// Toujours "compte introuvable" : seul le comportement du limiteur (429 avant même la logique
// métier) est sous test ici, pas l'authentification elle-même (couverte par agentSession.lotr1.test.js).
jest.mock("../models/agent", () => ({ findById: jest.fn(), findOne: jest.fn().mockResolvedValue(null), find: jest.fn() }));
// controllers/agent.js importe validatePassword depuis ../utils, qui charge en cascade
// utils/crypto.js et son FILE_ENCRYPTION_SECRET : hors sujet ici, comme dans agentSession.lotr1.test.js.
jest.mock("../utils", () => ({ validatePassword: jest.fn(), diacriticSensitiveRegex: (s) => s }));

const { validationErrorHandler } = require("../middlewares/validation");
const { resetRateLimiters } = require("../middlewares/rateLimit");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.cookie = jest.fn();
    res.clearCookie = jest.fn();
    next();
  });
  app.use("/agent", require("../controllers/agent"));
  app.use(validationErrorHandler);
  return app;
};

afterEach(() => resetRateLimiters());

describe("PM42 : limite de débit sur POST /agent/signin", () => {
  it("répond 429 après le quota, pour une même IP + email", async () => {
    const app = buildApp();
    let lastStatus;
    for (let i = 0; i < 21; i++) {
      const res = await request(app).post("/agent/signin").send({ email: "attacker@example.com", password: "x" });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });

  it("un autre email depuis la même IP n'est pas affecté par le quota consommé", async () => {
    const app = buildApp();
    for (let i = 0; i < 21; i++) {
      await request(app).post("/agent/signin").send({ email: "attacker@example.com", password: "x" });
    }
    const res = await request(app).post("/agent/signin").send({ email: "victime@example.com", password: "x" });
    expect(res.status).not.toBe(429);
  });
});

describe("PM42 : limite de débit sur POST /agent/forgot_password", () => {
  it("répond 429 après le quota", async () => {
    const app = buildApp();
    let lastStatus;
    for (let i = 0; i < 11; i++) {
      const res = await request(app).post("/agent/forgot_password").send({ email: "attacker@example.com" });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});

describe("PM42 : limite de débit sur POST /agent/forgot_password_reset", () => {
  it("répond 429 après le quota, même en essayant un jeton différent à chaque appel", async () => {
    const app = buildApp();
    let lastStatus;
    for (let i = 0; i < 11; i++) {
      const res = await request(app)
        .post("/agent/forgot_password_reset")
        .send({ token: i.toString().padStart(40, "a"), password: "whatever", passwordConfirm: "whatever" });
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
