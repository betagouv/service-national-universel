import request from "supertest";
import { ROLES, SUB_ROLES } from "snu-lib";
import getAppHelper from "./helpers/app";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewStructureFixture from "./fixtures/structure";
import { createReferentHelper, getReferentByIdHelper } from "./helpers/referent";
import { dbConnect, dbClose } from "./helpers/db";
import { fakerFR as faker } from "@faker-js/faker";
import crypto from "crypto";

const VALID_PASSWORD = faker.internet.password(16, false, /^[a-z]*$/, "AZ12/+");

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(dbConnect);
afterAll(dbClose);

describe("Referent", () => {
  let res;
  describe("POST /referent/signin", () => {
    it("should return 400 when no email, no password or wrong email", async () => {
      res = await request(getAppHelper()).post("/referent/signin");
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/signin").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/signin").send({ email: "foo", password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/signin").send({ password: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return 401 when user does not exists", async () => {
      const res = await request(getAppHelper()).post("/referent/signin").send({ email: "foo@bar.fr", password: "bar" });
      expect(res.status).toBe(401);
    });
    it("should return 401 if password does not match", async () => {
      const user = await createReferentHelper({ ...getNewReferentFixture(), password: "bar" });
      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "foo" });
      expect(res.status).toBe(401);
    });
    it("should return 200 and a token when user exists and password match", async () => {
      const fixture = getNewReferentFixture();
      const user = await createReferentHelper({ ...fixture, password: "bar", email: fixture.email?.toLowerCase() });
      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "bar" });
      expect(res.status).toBe(200);
      expect(res.body.redirect).toBeUndefined();
    });
    it("should return 200 with redirect when user is admin cle with reinscription", async () => {
      const user = await createReferentHelper(
        getNewReferentFixture({
          password: "bar",
          role: ROLES.ADMINISTRATEUR_CLE,
          subRole: SUB_ROLES.referent_etablissement,
          invitationToken: "validToken",
        }),
      );
      const res = await request(getAppHelper()).post("/referent/signin").send({ email: user.email, password: "bar" });
      expect(res.status).toBe(200);
      expect(res.body.code).toBe("VERIFICATION_REQUIRED");
      expect(res.body.redirect).toBe(`/verifier-mon-compte?token=${user.invitationToken}`);
    });
  });

  describe("POST /referent/logout", () => {
    it("should return 200", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = referent;
      const res = await request(getAppHelper()).post("/referent/logout");
      expect(res.status).toBe(200);
      passport.user = previous;
    });
  });

  describe("GET /referent/signin_token", () => {
    it("should return 200", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = referent;
      passport.user.set = jest.fn();
      passport.user.save = jest.fn();
      const res = await request(getAppHelper()).get("/referent/signin_token").set("Cookie", ["jwt_ref=blah"]);
      expect(res.status).toBe(200);
      expect(passport.user.set).toHaveBeenCalled();
      expect(passport.user.save).toHaveBeenCalled();
      passport.user = previous;
    });
  });

  describe("POST /referent/reset_password", () => {
    it("should return return 400 when missing password", async () => {
      res = await request(getAppHelper()).post("/referent/reset_password");
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: "bar", newPassword: "baz" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/reset_password").send({ verifyPassword: "bar", newPassword: "baz" });
      expect(res.status).toBe(400);
    });

    it("should return return 400 when password does not meet security requirement", async () => {
      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: "bar", verifyPassword: "baz", newPassword: "baz" });
      expect(res.status).toBe(400);
    });

    it("should return 401 when new password is identical as last password", async () => {
      const young = await createReferentHelper({ ...getNewReferentFixture(), password: VALID_PASSWORD });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: VALID_PASSWORD, verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(401);
      passport.user = previous;
    });

    it("should return return 401 when original password does not match", async () => {
      const young = await createReferentHelper({ ...getNewReferentFixture(), password: "foo" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: "bar", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(401);
      passport.user = previous;
    });

    it("should return return 422 when verifyPassword !== newPassword", async () => {
      const young = await createReferentHelper({ ...getNewReferentFixture(), password: "foo" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      res = await request(getAppHelper())
        .post("/referent/reset_password")
        .send({ password: "foo", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD + "HOP" });
      expect(res.status).toBe(422);
      passport.user = previous;
    });

    it("should return return 200 when password is changed", async () => {
      const young = await createReferentHelper({ ...getNewReferentFixture(), password: "foo" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      res = await request(getAppHelper()).post("/referent/reset_password").send({ password: "foo", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(200);
      passport.user = previous;
    });
  });

  describe("POST /referent/forgot_password", () => {
    it("should return return 404 when missing email", async () => {
      res = await request(getAppHelper()).post("/referent/forgot_password");
      expect(res.status).toBe(404);
    });
    it("should return 200 when user does not exist", async () => {
      const res = await request(getAppHelper()).post("/referent/forgot_password").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(200);
    });
    it("should return return 200 when user exists", async () => {
      const fixture = getNewReferentFixture();
      const young = await createReferentHelper({ ...fixture, email: fixture.email?.toLowerCase() });
      const res = await request(getAppHelper()).post("/referent/forgot_password").send({ email: young.email });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /referent/forgot_password_reset", () => {
    it("should return return 400 when missing token or password", async () => {
      res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ token: "foo" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: "bar" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when password is not secure", async () => {
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: "bar", token: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when user is not found", async () => {
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: VALID_PASSWORD, token: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when forgotPasswordResetExpires is expired", async () => {
      const fixture = getNewReferentFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      await createReferentHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() - 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
      });
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: VALID_PASSWORD, token: token });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("PASSWORD_TOKEN_EXPIRED_OR_INVALID");
    });

    it("should return 401 when new password is identical as last password", async () => {
      const fixture = getNewReferentFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      await createReferentHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
        password: VALID_PASSWORD,
      });
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: VALID_PASSWORD, token });
      expect(res.status).toBe(401);
    });

    it("should return return 200 otherwise", async () => {
      const fixture = getNewReferentFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      const young = await createReferentHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
      });
      const res = await request(getAppHelper()).post("/referent/forgot_password_reset").send({ password: VALID_PASSWORD, token });
      expect(res.status).toBe(200);

      const updatedYoung = await getReferentByIdHelper(young.id);
      expect(updatedYoung?.forgotPasswordResetExpires).toBeFalsy();
      expect(updatedYoung?.forgotPasswordResetToken).toBeFalsy();
    });
  });
});
