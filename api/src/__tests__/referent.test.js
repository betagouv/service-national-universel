require("dotenv").config({ path: "./.env-testing" });
const faker = require("faker");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const getNewReferentFixture = require("./fixtures/referent");
const {
  getYoungsHelper,
  getYoungByIdHelper,
  deleteYoungByIdHelper,
  createYoungHelper,
  expectYoungToEqual,
  notExistingYoungId,
} = require("./helpers/young");
const { getReferentsHelper, deleteReferentByIdHelper, notExistingReferentId, createReferentHelper } = require("./helpers/referent");
const { dbConnect, dbClose } = require("./helpers/db");
const { createCohesionCenter, getCohesionCenterById } = require("./helpers/cohesionCenter");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");

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

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Referent", () => {
  it("POST /referent/signup_invite/admin", async () => {
    const referentFixture = getNewReferentFixture();
    const referentsBefore = await getReferentsHelper();
    const res = await request(getAppHelper()).post("/referent/signup_invite/admin").send(referentFixture);
    expect(res.statusCode).toEqual(200);
    const referentsAfter = await getReferentsHelper();
    expect(referentsAfter.length).toEqual(referentsBefore.length + 1);
    await deleteReferentByIdHelper(res.body.data._id);
  });

  it("GET /referent", async () => {
    const res = await request(getAppHelper()).get("/referent").send();
    expect(res.statusCode).toEqual(200);
  });

  it("POST /referent/young", async () => {
    const youngFixture = getNewYoungFixture();
    const youngsBefore = await getYoungsHelper();
    const res = await request(getAppHelper()).post("/referent/young/").send(youngFixture);
    expect(res.statusCode).toEqual(200);
    expectYoungToEqual(youngFixture, res.body.young);
    const youngsAfter = await getYoungsHelper();
    expect(youngsAfter.length).toEqual(youngsBefore.length + 1);
    await deleteYoungByIdHelper(res.body.young._id);
  });

  describe("PUT /referent/young/:id", () => {
    async function createYoungThenUpdate(params) {
      const youngFixture = getNewYoungFixture();
      const originalYoung = await createYoungHelper(youngFixture);
      const modifiedYoung = { ...youngFixture, ...params };
      const response = await request(getAppHelper()).put(`/referent/young/${originalYoung._id}`).send(modifiedYoung);
      const young = await getYoungByIdHelper(originalYoung._id);
      await deleteYoungByIdHelper(originalYoung._id);
      return { young, modifiedYoung, response };
    }
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).put(`/referent/young/${notExistingYoungId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should update young name", async () => {
      const { young, modifiedYoung, response } = await createYoungThenUpdate({ name: faker.name.findName() });
      expect(response.statusCode).toEqual(200);
      expectYoungToEqual(young, modifiedYoung);
    });
    it("should update young statuses when sending status WITHDRAWN", async () => {
      const { young, response } = await createYoungThenUpdate({ status: "WITHDRAWN", cohesionStayPresence: "" });
      expect(response.statusCode).toEqual(200);
      expect(young.status).toEqual("WITHDRAWN");
      expect(young.statusPhase1).toEqual("WITHDRAWN");
      expect(young.statusPhase2).toEqual("WITHDRAWN");
      expect(young.statusPhase3).toEqual("WITHDRAWN");
    });
    it("should update young statuses when sending cohection stay presence true", async () => {
      const { young, response } = await createYoungThenUpdate({ cohesionStayPresence: "true" });
      expect(response.statusCode).toEqual(200);
      expect(young.statusPhase1).toEqual("DONE");
      expect(young.cohesionStayPresence).toEqual("true");
    });
    it("should update young statuses when sending cohection stay presence false", async () => {
      const { young, response } = await createYoungThenUpdate({ cohesionStayPresence: "false" });
      expect(response.statusCode).toEqual(200);
      expect(young.statusPhase1).toEqual("NOT_DONE");
      expect(young.cohesionStayPresence).toEqual("false");
    });
    it("should remove places when sending to cohesion center", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const placesLeft = cohesionCenter.placesLeft;
      const { young, response } = await createYoungThenUpdate({
        cohesionCenterId: cohesionCenter._id,
        status: "VALIDATED",
        statusPhase1: "AFFECTED",
      });
      expect(response.statusCode).toEqual(200);
      const updatedCohesionCenter = await getCohesionCenterById(young.cohesionCenterId);
      expect(updatedCohesionCenter.placesLeft).toEqual(placesLeft - 1);
    });
  });

  describe("POST /referent/email-tutor/:template/:tutorId", () => {
    it("should return 200 if tutor not found but it's weird", async () => {
      const res = await request(getAppHelper())
        .post("/referent/email-tutor/test/" + notExistingReferentId)
        .send();
      expect(res.statusCode).toEqual(200);
    });
    it("should return 200 if tutor found", async () => {
      const tutor = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper())
        .post("/referent/email-tutor/correction/" + tutor._id)
        .send({ message: "hello" });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("POST /referent/email/:template/:youngId", () => {
    it("should return 200 if young not found but it's weird", async () => {
      const res = await request(getAppHelper())
        .post("/referent/email/test/" + notExistingYoungId)
        .send();
      expect(res.statusCode).toEqual(200);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      for (const email of ["correction", "validate", "refuse", "waiting_list", "apply"]) {
        const res = await request(getAppHelper())
          .post("/referent/email/" + email + "/" + young._id)
          .send({ message: "hello" });
        expect(res.statusCode).toEqual(200);
      }
    });
  });
  describe("GET /referent/youngFile/:youngId/:key/:fileName", () => {
    it("should return 200 if file is found", async () => {
      const res = await request(getAppHelper()).get("/referent/youngFile/1/key/test.pdf").send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.fileName).toEqual("test.pdf");
      expect(res.body.mimeType).toEqual("application/pdf");
    });
  });
  describe("POST /referent/file/:key", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper())
        .get("/referent/file/CniFile")
        .send({ body: JSON.stringify({ youngId: notExistingYoungId, names: ["e"] }) });
      expect(res.statusCode).toEqual(404);
    });
    it("should send file for the young", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/referent/file/CniFile")
        .send({ body: JSON.stringify({ youngId: young._id, names: ["e"] }) });
      expect(res.body).toEqual({ data: ["e"], ok: true });
    });
  });
});
