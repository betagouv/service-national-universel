import express from "express";
import request from "supertest";
import passport from "passport";

import Auth from "../auth";
import { config } from "../config";
import { ReferentModel, YoungModel } from "../models";
import { setSessionCookie } from "../cookie-options";
import { sendTemplate } from "../brevo";
import { consume2FAAttempt, consumeEmailValidationAttempt } from "../services/auth/attemptCounters";
import { JWT_SIGNIN_VERSION } from "../jwt-options";
import jwt from "jsonwebtoken";
import optionalAuth from "../middlewares/optionalAuth";
import { getAcl } from "../services/iam/Permission.service";

// These tests exercise authentication, not native telemetry integrations.
jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendTemplate: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../cookie-options", () => ({
  ...jest.requireActual("../cookie-options"),
  setSessionCookie: jest.fn(),
}));
jest.mock("../services/auth/attemptCounters", () => ({
  consumeLoginAttempt: jest.fn().mockResolvedValue({ blocked: false }),
  resetLoginAttempts: jest.fn().mockResolvedValue(undefined),
  consume2FAAttempt: jest.fn(),
  consumeEmailValidationAttempt: jest.fn(),
  isLoginLocked: jest.fn().mockReturnValue(false),
}));
jest.mock("../featureFlag/featureFlagService", () => ({
  getFeatureFlagsAvailable: jest.fn().mockResolvedValue([]),
}));
jest.mock("../featureFlag/adminAccessRestriction", () => ({
  isReferentAccessAllowed: jest.fn().mockResolvedValue(true),
}));
jest.mock("../services/iam/Permission.service", () => ({
  getAcl: jest.fn().mockResolvedValue([]),
}));

const PASSWORD = "ValidPassword123!";
const auth = new Auth(YoungModel);

function youngAccount() {
  const young = new YoungModel({
    email: "young@example.org",
    status: "VALIDATED",
    token2FA: "123456",
    token2FAExpires: new Date(Date.now() + 60000),
    lastLogoutAt: null,
    passwordChangedAt: null,
  });
  return Object.assign(young, {
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(young),
  });
}

function response() {
  const res = { status: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

describe("global young access closure — offline authentication tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it.each([false, true])("refuses a correct password with ENABLE_2FA=%s", async (enable2FA) => {
    const young = youngAccount();
    jest.spyOn(YoungModel, "findOne").mockResolvedValue(young);
    const previous2FA = config.ENABLE_2FA;
    (config as any).ENABLE_2FA = enable2FA;
    const res = response();

    try {
      await auth.signin({ body: { email: young.email, password: PASSWORD }, cookies: {} }, res);

      expect(young.comparePassword).toHaveBeenCalledWith(PASSWORD);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ ok: false, code: "EMAIL_OR_PASSWORD_INVALID" });
      expect(young.status).toBe("VALIDATED");
      expect(young.save).not.toHaveBeenCalled();
      expect(setSessionCookie).not.toHaveBeenCalled();
      expect(sendTemplate).not.toHaveBeenCalled();
    } finally {
      (config as any).ENABLE_2FA = previous2FA;
    }
  });

  it.each(["admin", "responsible", "supervisor"])("keeps active %s referent sign-in working", async (role) => {
    const referent = new ReferentModel({ email: "referent@example.org", status: "ACTIVE", role, roles: [role] });
    Object.assign(referent, { comparePassword: jest.fn().mockResolvedValue(true), save: jest.fn().mockResolvedValue(referent) });
    jest.spyOn(ReferentModel, "findOne").mockResolvedValue(referent);
    const previous2FA = config.ENABLE_2FA;
    (config as any).ENABLE_2FA = false;
    const res = response();
    try {
      await new Auth(ReferentModel).signin({ body: { email: referent.email, password: PASSWORD }, cookies: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(setSessionCookie).toHaveBeenCalledWith(res, "jwt_ref", expect.any(String), expect.any(Number));
    } finally {
      (config as any).ENABLE_2FA = previous2FA;
    }
  });

  it("refuses a correct pending 2FA code", async () => {
    const young = youngAccount();
    jest.mocked(consume2FAAttempt).mockResolvedValue(young);
    const res = response();

    await auth.signin2FA({ body: { email: young.email, token_2fa: "123456", rememberMe: true } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(young.save).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it.each(["signinToken", "refreshToken"] as const)("refuses %s before saving or issuing a session", async (method) => {
    const young = youngAccount();
    const res = response();
    await auth[method]({ user: young, cookies: { jwt_young: "old-token" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(young.save).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("does not open a session through email validation", async () => {
    const young = youngAccount();
    jest.mocked(consumeEmailValidationAttempt).mockResolvedValue(young);
    const res = response();
    await auth.validateEmail({ user: young, body: { token_email_validation: "123456" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(young.save).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("keeps forgot-password responses neutral without sending a reset link", async () => {
    const young = youngAccount();
    jest.spyOn(YoungModel, "findOne").mockResolvedValue(young);
    const res = response();
    await auth.forgotPassword({ body: { email: young.email } }, res, "https://example.org/reset");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ ok: true });
    expect(young.save).not.toHaveBeenCalled();
    expect(sendTemplate).not.toHaveBeenCalled();
  });

  it("refuses outstanding password-reset tokens without changing the password", async () => {
    const young = youngAccount();
    jest.spyOn(YoungModel, "findOne").mockResolvedValue(young);
    const res = response();
    await auth.forgotPasswordReset({ body: { password: PASSWORD, token: "a-valid-pending-reset-token" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ ok: false, code: "PASSWORD_TOKEN_EXPIRED_OR_INVALID" });
    expect(young.comparePassword).not.toHaveBeenCalled();
    expect(young.save).not.toHaveBeenCalled();
  });

  it("refuses authenticated password changes that could issue a fresh session", async () => {
    const young = youngAccount();
    jest.spyOn(YoungModel, "findById").mockResolvedValue(young);
    const res = response();
    await auth.resetPassword({ user: young, body: { password: "old-password", newPassword: PASSWORD, verifyPassword: PASSWORD } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(young.save).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it.each(["/signup", "/signup_invite"])("closes %s without reading or changing an account", async (path) => {
    const young = youngAccount();
    const findOne = jest.spyOn(YoungModel, "findOne").mockResolvedValue(young);
    const router = require("../controllers/young").default;
    const app = express().use(express.json()).use(router);
    const res = await request(app).post(path).send({ email: young.email, password: PASSWORD, invitationToken: "pending-invitation" });
    expect(res.status).toBe(403);
    expect(findOne).not.toHaveBeenCalled();
    expect(young.save).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it.each(["token", "logout"])("rejects support-site %s with a valid young session", async (route) => {
    const young = youngAccount();
    jest.spyOn(YoungModel, "findById").mockResolvedValue(young);
    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: young.id, lastLogoutAt: null, passwordChangedAt: null }, config.JWT_SECRET);
    const router = require("../controllers/signin");
    const app = express()
      .use((req, _res, next) => {
        req.cookies = { jwt_young: token };
        next();
      })
      .use(router);
    const res = await (route === "token" ? request(app).get("/token") : request(app).post("/logout")).set("Origin", config.KNOWLEDGEBASE_URL);
    expect(res.status).toBe(401);
    expect(young.save).not.toHaveBeenCalled();
  });

  it("does not authenticate a young through optional support authentication", async () => {
    const young = youngAccount();
    jest.spyOn(ReferentModel, "findById").mockResolvedValue(null);
    const findYoung = jest.spyOn(YoungModel, "findById").mockResolvedValue(young);
    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: young.id, lastLogoutAt: null, passwordChangedAt: null }, config.JWT_SECRET);
    const app = express().get("/", optionalAuth, (req, res) => res.send({ authenticated: Boolean(req.user) }));
    const res = await request(app).get("/").set("Authorization", `JWT ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: false });
    expect(findYoung).not.toHaveBeenCalled();
    expect(getAcl).not.toHaveBeenCalled();
  });

  it("keeps valid referent optional authentication working", async () => {
    const referent = new ReferentModel({ email: "referent@example.org", role: "admin", status: "ACTIVE", lastLogoutAt: null, passwordChangedAt: null });
    jest.spyOn(ReferentModel, "findById").mockResolvedValue(referent);
    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: referent.id, lastLogoutAt: null, passwordChangedAt: null }, config.JWT_SECRET);
    const app = express().get("/", optionalAuth, (req, res) => res.send({ authenticated: Boolean(req.user) }));
    const res = await request(app).get("/").set("Authorization", `JWT ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true });
  });

  it("does not create a young session through administrator impersonation", async () => {
    const findYoung = jest.spyOn(YoungModel, "findById");
    const admin = new ReferentModel({ email: "admin@example.org", role: "admin", status: "ACTIVE" });
    jest.spyOn(passport, "authenticate").mockImplementation(() => (req, _res, next) => {
      req.user = admin;
      next();
    });
    const router = require("../referent/referentController").default;
    const app = express().use(express.json()).use(router);
    const res = await request(app).post(`/signin_as/young/${youngAccount().id}`).send({});
    expect(res.status).toBe(403);
    expect(findYoung).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });
});
