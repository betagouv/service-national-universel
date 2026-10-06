import request from "supertest";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { dbConnect, dbClose } from "./helpers/db";
import { fakerFR as faker } from "@faker-js/faker";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const VALID_PASSWORD = faker.internet.password(16, false, /^[a-z]*$/, "AZ12/+");

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Young Auth", () => {
  let res;
  describe("POST /young/signin", () => {
    it("should return 400 when no email, no password or wrong email", async () => {
      res = await request(getAppHelper()).post("/young/signin").send({});
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signin").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signin").send({ email: "foo", password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signin").send({ password: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return 401 when user does not exists", async () => {
      const res = await request(getAppHelper()).post("/young/signin").send({ email: "foo@bar.fr", password: "bar" });
      expect(res.status).toBe(401);
    });
    it("should return 401 when user is deleted", async () => {
      const user = await createYoungHelper({ ...getNewYoungFixture(), status: "DELETED", password: "bar" });
      const res = await request(getAppHelper()).post("/young/signin").send({ email: user.email, password: "bar" });
      expect(res.status).toBe(401);
    });
    it("should return 401 if password does not match", async () => {
      const user = await createYoungHelper({ ...getNewYoungFixture(), password: "bar" });
      const res = await request(getAppHelper()).post("/young/signin").send({ email: user.email, password: "foo" });
      expect(res.status).toBe(401);
    });
    it("should return 200 and a token when user exists and password match", async () => {
      const fixture = getNewYoungFixture();
      const user = await createYoungHelper({ ...fixture, password: "bar", email: fixture.email?.toLowerCase() });
      const res = await request(getAppHelper()).post("/young/signin").send({ email: user.email, password: "bar" });
      expect(res.status).toBe(200);
    });
  });
  describe("POST /young/signup", () => {
    // L'inscription en ligne est fermée (M3, audit du 2026-09-21) : la route
    // renvoie 403, comme POST /referent/signup. Le tunnel d'inscription est
    // décommissionné (lot H1) : les cas de l'inscription d'origine, désactivés,
    // ont été retirés.
    it("should return 403 because online signup is closed", async () => {
      const fixture = getNewYoungFixture();
      res = await request(getAppHelper()).post("/young/signup").send({
        email: fixture.email?.toLowerCase(),
        firstName: "foo",
        lastName: "bar",
        password: VALID_PASSWORD,
        birthdateAt: fixture.birthdateAt,
        grade: fixture.grade,
        frenchNationality: fixture.frenchNationality,
        schooled: fixture.schooled,
        cohort: fixture.cohort,
      });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe("OPERATION_NOT_ALLOWED");
    });
  });
  describe("POST /young/logout", () => {
    it("should return 200", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), password: VALID_PASSWORD });
      const res = await request(getAppHelper(young)).post("/young/logout");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /young/signin_token", () => {
    it("should return 200", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      young.set = jest.fn();
      young.save = jest.fn();
      jest.spyOn(jwt, "verify").mockImplementation(() => ({
        _id: young._id,
      }));

      const res = await request(getAppHelper(young)).get("/young/signin_token").set("Cookie", ["jwt_young=blah"]);
      expect(res.status).toBe(200);
      expect(young.set).toHaveBeenCalled();
      expect(young.save).toHaveBeenCalled();
    });
  });

  describe("POST /young/reset_password", () => {
    it("should return return 400 when missing password", async () => {
      res = await request(getAppHelper()).post("/young/reset_password");
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/reset_password").send({ password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/reset_password").send({ password: "bar", newPassword: "baz" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/reset_password").send({ verifyPassword: "bar", newPassword: "baz" });
      expect(res.status).toBe(400);
    });

    it("should return return 400 when password does not meet security requirement", async () => {
      res = await request(getAppHelper()).post("/young/reset_password").send({ password: "bar", verifyPassword: "baz", newPassword: "baz" });
      expect(res.status).toBe(400);
    });

    it("should return 401 when new password is identical as last password", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), password: VALID_PASSWORD });

      res = await request(getAppHelper(young)).post("/young/reset_password").send({ password: VALID_PASSWORD, verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(401);
    });

    it("should return return 401 when original password does not match", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), password: "foo" });

      res = await request(getAppHelper(young)).post("/young/reset_password").send({ password: "bar", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(401);
    });

    it("should return return 422 when verifyPassword !== newPassword", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), password: "foo" });

      res = await request(getAppHelper(young))
        .post("/young/reset_password")
        .send({ password: "foo", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD + "HOP" });
      expect(res.status).toBe(422);
    });

    it("should return return 200 when password is changed", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), password: "foo" });

      res = await request(getAppHelper(young)).post("/young/reset_password").send({ password: "foo", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /young/forgot_password", () => {
    it("should return return 404 when missing email", async () => {
      res = await request(getAppHelper()).post("/young/forgot_password");
      expect(res.status).toBe(404);
    });
    it("should return 200 when user does not exist", async () => {
      const res = await request(getAppHelper()).post("/young/forgot_password").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(200);
    });
    it("should return return 200 when user exists", async () => {
      const fixture = getNewYoungFixture();
      const young = await createYoungHelper({ ...fixture, email: fixture.email?.toLowerCase() });
      const res = await request(getAppHelper()).post("/young/forgot_password").send({ email: young.email });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /young/forgot_password_reset", () => {
    it("should return return 400 when missing token or password", async () => {
      res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ token: "foo" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ password: "bar" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when password is not secure", async () => {
      const res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ password: "bar", token: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when user is not found", async () => {
      const res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ password: VALID_PASSWORD, token: "foo" });
      expect(res.status).toBe(400);
    });
    it("should return return 400 when forgotPasswordResetExpires is expired", async () => {
      const fixture = getNewYoungFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      await createYoungHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() - 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
      });
      const res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ password: VALID_PASSWORD, token: token });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("PASSWORD_TOKEN_EXPIRED_OR_INVALID");
    });

    it("should return 401 when new password is identical as last password", async () => {
      const fixture = getNewYoungFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      await createYoungHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
        password: VALID_PASSWORD,
      });
      const res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ password: VALID_PASSWORD, token });
      expect(res.status).toBe(401);
    });

    it("should return return 200 otherwise", async () => {
      const fixture = getNewYoungFixture();
      const token = await crypto.randomBytes(20).toString("hex");
      const young = await createYoungHelper({
        ...fixture,
        email: fixture.email?.toLowerCase(),
        forgotPasswordResetExpires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
      });
      const res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ password: VALID_PASSWORD, token });
      expect(res.status).toBe(200);

      const updatedYoung = await getYoungByIdHelper(young.id);
      expect(updatedYoung?.forgotPasswordResetExpires).toBeFalsy();
      expect(updatedYoung?.forgotPasswordResetToken).toBeFalsy();
    });
  });
});
