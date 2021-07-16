require("dotenv").config({ path: "./.env-testing" });
const fetch = require("node-fetch");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { getYoungsHelper, createYoungHelper, notExistingYoungId, deleteYoungByEmailHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewDepartmentServiceFixture = require("./fixtures/departmentService");
const { createDepartmentServiceHelper, deleteAllDepartmentServicesHelper } = require("./helpers/departmentService");
const { createMeetingPointHelper } = require("./helpers/meetingPoint");
const getNewMeetingPointFixture = require("./fixtures/meetingPoint");
const { createBusHelper } = require("./helpers/bus");
const getNewBusFixture = require("./fixtures/bus");
const { createCohesionCenter, getCohesionCenterById } = require("./helpers/cohesionCenter");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.mock("../qpv", () => ({
  ...jest.requireActual("../qpv"),
  getQPV: (a) => Promise.resolve(a === "qpvShouldWork"),
}));

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: () => Promise.resolve({ Body: "" }),
  uploadFile: (path, file) => Promise.resolve({ path, file }),
}));

jest.mock("../cryptoUtils", () => ({
  ...jest.requireActual("../cryptoUtils"),
  decrypt: () => Buffer.from("test"),
  encrypt: () => Buffer.from("test"),
}));
jest.mock("node-fetch");

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
      res = await request(getAppHelper()).post("/young/signup").send({ email, password: "barBAR123,;:", firstName: "foo", lastName: "bar" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
    });

    it("should transform firstName and lastName", async () => {
      const fixture = getNewYoungFixture();
      res = await request(getAppHelper())
        .post("/young/signup")
        .send({ email: fixture.email, password: "barBAR123,;:", firstName: "foo", lastName: "bar" });
      expect(res.body.user.firstName).toBe("Foo");
      expect(res.body.user.lastName).toBe("BAR");
      expect(res.body.user.email).toBe(fixture.email.toLowerCase());
    });

    it("should return 409 when user already exists", async () => {
      const fixture = getNewYoungFixture();
      const email = fixture.email.toLowerCase();
      await createYoungHelper({ ...fixture, email });
      res = await request(getAppHelper()).post("/young/signup").send({ email, password: "barBAR123,;:", firstName: "foo", lastName: "bar" });
      expect(res.status).toBe(409);
    });
  });
});
