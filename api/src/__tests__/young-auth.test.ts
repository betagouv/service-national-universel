import request from "supertest";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper, getYoungByIdHelper } from "./helpers/young";
import { dbConnect, dbClose } from "./helpers/db";
import { fakerFR as faker } from "@faker-js/faker";
import crypto from "crypto";
import { createCohortHelper } from "./helpers/cohort";
import getNewCohortFixture from "./fixtures/cohort";
import { createFixtureClasse } from "./fixtures/classe";
import { ClasseModel } from "../models";
import { YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";
import jwt from "jsonwebtoken";

const VALID_PASSWORD = faker.internet.password(16, false, /^[a-z]*$/, "AZ12/+");

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Young Auth", () => {
  let res;
  describe("POST /young/signin", () => {
    it("should return 400 when no email, no password or wrong email", async () => {
      res = await request(getAppHelper()).post("/young/signin");
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
    it("should return 400 when all the fields are note defined or not well informed", async () => {
      const fixture = getNewYoungFixture();
      res = await request(getAppHelper()).post("/young/signup");
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ email: "foo", password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ email: "foo", password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({
        email: "foo",
        password: "bar",
        birthdateAt: fixture.birthdateAt,
      });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({
        email: "foo",
        password: "bar",
        birthdateAt: fixture.birthdateAt,
        frenchNationality: "false",
        schooled: "false",
        cohort: "false",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 when password does not match requirments", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email?.toLowerCase();
      res = await request(getAppHelper()).post("/young/signup").send({ email, password: "bar", firstName: "foo", lastName: "bar", birthdateAt: fixture.birthdateAt });
      expect(res.status).toBe(400);
    });

    // TODO - Put this code back next time a cohort is opened

    it.skip("should return 200", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email?.toLowerCase();
      res = await request(getAppHelper()).post("/young/signup").send({
        email: email,
        firstName: "foo",
        lastName: "bar",
        password: VALID_PASSWORD,
        birthdateAt: fixture.birthdateAt,
        schoolRegion: fixture.schoolRegion,
        grade: fixture.grade,
        frenchNationality: fixture.frenchNationality,
        schooled: fixture.schooled,
        cohort: fixture.cohort,
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
    });

    it.skip("should transform firstName and lastName", async () => {
      const fixture = getNewYoungFixture();
      res = await request(getAppHelper()).post("/young/signup").send({
        email: fixture.email,
        firstName: "foo",
        lastName: "bar",
        password: VALID_PASSWORD,
        birthdateAt: fixture.birthdateAt,
        schoolRegion: fixture.schoolRegion,
        grade: fixture.grade,
        frenchNationality: fixture.frenchNationality,
        schooled: fixture.schooled,
        cohort: fixture.cohort,
      });
      expect(res.body.user.firstName).toBe("Foo");
      expect(res.body.user.lastName).toBe("BAR");
      expect(res.body.user.email).toBe(fixture.email?.toLowerCase());
    });

    it("should return 409 when user already exists", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email?.toLowerCase();
      const young = await createYoungHelper({ ...fixture, email });
      const cohort = await createCohortHelper({ ...getNewCohortFixture(), name: young.cohort });
      res = await request(getAppHelper()).post("/young/signup").set("x-user-timezone", "-60").send({
        email: email,
        phone: fixture.phone,
        phoneZone: fixture.phoneZone,
        firstName: "foo",
        lastName: "bar",
        password: VALID_PASSWORD,
        birthdateAt: fixture.birthdateAt,
        schoolRegion: fixture.schoolRegion,
        grade: fixture.grade,
        frenchNationality: fixture.frenchNationality,
        schooled: fixture.schooled,
        cohort: cohort.name,
      });
      expect(res.status).toBe(409);
    });

    it("should return 409 when the number of users in the class exceeds the total seats", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email?.toLowerCase();
      const classe = await ClasseModel.create({ ...createFixtureClasse(), totalSeats: 1 });
      await createYoungHelper({ ...fixture, email, classeId: classe._id, status: YOUNG_STATUS.VALIDATED });
      res = await request(getAppHelper()).post("/young/signup").send({
        email: "newuser@example.com",
        phone: fixture.phone,
        phoneZone: fixture.phoneZone,
        firstName: "new",
        lastName: "user",
        password: VALID_PASSWORD,
        birthdateAt: fixture.birthdateAt,
        grade: fixture.grade,
        frenchNationality: fixture.frenchNationality,
        classeId: classe._id,
        source: YOUNG_SOURCE.CLE,
      });
      expect(res.status).toBe(409);
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
