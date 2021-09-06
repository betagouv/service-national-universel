require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const faker = require("faker");
const crypto = require("crypto");

const VALID_PASSWORD = faker.internet.password(16, false, /^[a-z]*$/, "AZ12/+");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Young", () => {
  describe("POST /young/signin", () => {
    it("should return 400 when no email, no password or wrong email", async () => {
      let res = await request(getAppHelper()).post("/young/signin");
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
      const user = await createYoungHelper({ ...fixture, password: "bar", email: fixture.email.toLowerCase() });
      const res = await request(getAppHelper()).post("/young/signin").send({ email: user.email, password: "bar" });
      expect(res.status).toBe(200);
    });
  });
  describe("POST /young/signup", () => {
    it("should return 400 when no email, no password, wrong email, no firstname or no lastname", async () => {
      let res = await request(getAppHelper()).post("/young/signup");
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ email: "foo", password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ password: "foo" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ email: "foo@bar.fr", password: "bar" });
      expect(res.status).toBe(400);

      res = await request(getAppHelper()).post("/young/signup").send({ email: "foo@bar.fr", password: "bar", firstName: "foo" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when password does not match requirments", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email.toLowerCase();
      res = await request(getAppHelper()).post("/young/signup").send({ email, password: "bar", firstName: "foo", lastName: "bar" });
      expect(res.status).toBe(400);
    });

    it("should return 200", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email.toLowerCase();
      res = await request(getAppHelper()).post("/young/signup").send({ email, password: VALID_PASSWORD, firstName: "foo", lastName: "bar" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
    });

    it("should transform firstName and lastName", async () => {
      const fixture = getNewYoungFixture();
      res = await request(getAppHelper())
        .post("/young/signup")
        .send({ email: fixture.email, password: VALID_PASSWORD, firstName: "foo", lastName: "bar" });
      expect(res.body.user.firstName).toBe("Foo");
      expect(res.body.user.lastName).toBe("BAR");
      expect(res.body.user.email).toBe(fixture.email.toLowerCase());
    });

    it("should return 409 when user already exists", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email.toLowerCase();
      await createYoungHelper({ ...fixture, email });
      res = await request(getAppHelper()).post("/young/signup").send({ email, password: VALID_PASSWORD, firstName: "foo", lastName: "bar" });
      expect(res.status).toBe(409);
    });
  });
  describe("POST /young/logout", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).post("/young/logout");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /young/signin_token", () => {
    it("should return 200", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      passport.user.set = jest.fn();
      passport.user.save = jest.fn();
      const res = await request(getAppHelper()).get("/young/signin_token").set("Cookie", ["jwt=blah"]);
      expect(res.status).toBe(200);
      expect(passport.user.set).toHaveBeenCalled();
      expect(passport.user.save).toHaveBeenCalled();
      passport.user = previous;
    });
  });

  describe("POST /young/reset_password", () => {
    it("should return return 400 when missing password", async () => {
      let res = await request(getAppHelper()).post("/young/reset_password");
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
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      res = await request(getAppHelper())
        .post("/young/reset_password")
        .send({ password: VALID_PASSWORD, verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(401);
      passport.user = previous;
    });

    it("should return return 401 when original password does not match", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), password: "foo" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      res = await request(getAppHelper())
        .post("/young/reset_password")
        .send({ password: "bar", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(401);
      passport.user = previous;
    });

    it("should return return 422 when verifyPassword !== newPassword", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), password: "foo" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      res = await request(getAppHelper())
        .post("/young/reset_password")
        .send({ password: "foo", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD + "HOP" });
      expect(res.status).toBe(422);
      passport.user = previous;
    });

    it("should return return 200 when password is changed", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), password: "foo" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      res = await request(getAppHelper())
        .post("/young/reset_password")
        .send({ password: "foo", verifyPassword: VALID_PASSWORD, newPassword: VALID_PASSWORD });
      expect(res.status).toBe(200);
      passport.user = previous;
    });
  });

  describe("POST /young/forgot_password", () => {
    it("should return return 404 when missing email", async () => {
      let res = await request(getAppHelper()).post("/young/forgot_password");
      expect(res.status).toBe(404);
    });
    it("should return 404 when user does not exist", async () => {
      const res = await request(getAppHelper()).post("/young/forgot_password").send({ email: "foo@bar.fr" });
      expect(res.status).toBe(404);
    });
    it("should return return 200 when user exists", async () => {
      const fixture = getNewYoungFixture();
      const young = await createYoungHelper({ ...fixture, email: fixture.email.toLowerCase() });
      const res = await request(getAppHelper()).post("/young/forgot_password").send({ email: young.email });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /young/forgot_password_reset", () => {
    it("should return return 400 when missing token or password", async () => {
      let res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ token: "foo" });
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
        email: fixture.email.toLowerCase(),
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
      const young = await createYoungHelper({
        ...fixture,
        email: fixture.email.toLowerCase(),
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
        email: fixture.email.toLowerCase(),
        forgotPasswordResetExpires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        forgotPasswordResetToken: token,
      });
      const res = await request(getAppHelper()).post("/young/forgot_password_reset").send({ password: VALID_PASSWORD, token });
      expect(res.status).toBe(200);

      const updatedYoung = await getYoungByIdHelper(young.id);
      expect(updatedYoung.forgotPasswordResetExpires).toBeFalsy();
      expect(updatedYoung.forgotPasswordResetToken).toBeFalsy();
    });
  });
});
