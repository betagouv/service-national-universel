require("dotenv").config({ path: "./.env-testing" });

const { ObjectId } = require("mongoose").Types;
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewContractFixture = require("./fixtures/contract");
const { getNewApplicationFixture } = require("./fixtures/application");
const getNewYoungFixture = require("./fixtures/young");
const { createApplication, getApplicationsHelper, deleteApplicationHelper } = require("./helpers/application");
const {
  getYoungsHelper,
  getYoungByIdHelper,
  deleteYoungByIdHelper,
  createYoungHelper,
  expectYoungToEqual,
  deleteYoungByEmailHelper,
  notExistingYoungId,
} = require("./helpers/young");
const { expectContractToEqual, createContractHelper, getContractByIdHelper } = require("./helpers/contract");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Structure", () => {
  describe("POST /contract", () => {
    it("should return 500 when empty", async () => {
      const res = await request(getAppHelper()).post("/contract").send();
      expect(res.status).toBe(500);
    });
    it("should return 500 when application is not found", async () => {
      const youngFixture = getNewYoungFixture();
      const young = await createYoungHelper(youngFixture);
      const contract = getNewContractFixture();
      contract.youngId = young._id;
      const res = await request(getAppHelper()).post("/contract").send(contract);
      expect(res.status).toBe(500);
    });
    it("should return 500 when young is not found", async () => {
      const applicationFixture = getNewApplicationFixture();
      const application = await createApplication(applicationFixture);
      const contract = getNewContractFixture();
      contract.applicationId = application._id;
      const res = await request(getAppHelper()).post("/contract").send(contract);
      expect(res.status).toBe(500);
    });
    it("should create contract and sent it", async () => {
      const youngFixture = getNewYoungFixture();
      let young = await createYoungHelper(youngFixture);
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const res = await request(getAppHelper())
        .post("/contract")
        .send({ ...contractFixture, sendMessage: true });
      expect(res.status).toBe(200);
      expectContractToEqual(res.body.data, contractFixture);
      expect(res.body.data.invitationSent).toBe("true");
      young = await getYoungByIdHelper(young._id);
      expect(young.statusPhase2Contract[0]).toBe("SENT");
    });
    it("should create contract and draft it", async () => {
      const youngFixture = getNewYoungFixture();
      let young = await createYoungHelper(youngFixture);
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const res = await request(getAppHelper())
        .post("/contract")
        .send({ ...contractFixture, sendMessage: false });
      expect(res.status).toBe(200);
      expectContractToEqual(res.body.data, contractFixture);
      expect(res.body.data.invitationSent).not.toBe("true");
      young = await getYoungByIdHelper(young._id);
      expect(young.statusPhase2Contract[0]).toBe("DRAFT");
    });
    it("should create contract draft it and then send it", async () => {
      const youngFixture = getNewYoungFixture();
      let young = await createYoungHelper(youngFixture);
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const res = await request(getAppHelper())
        .post("/contract")
        .send({ ...contractFixture, sendMessage: false });
      expect(res.status).toBe(200);
      const resAfter = await request(getAppHelper())
        .post("/contract")
        .send({ ...res.body.data, sendMessage: true });
      expect(resAfter.status).toBe(200);
      expectContractToEqual(resAfter.body.data, contractFixture);
      expect(resAfter.body.data.invitationSent).toBe("true");
      young = await getYoungByIdHelper(young._id);
      expect(young.statusPhase2Contract[0]).toBe("SENT");
    });
  });
  describe("GET /contract/:id", () => {
    it("should return 404 not found", async () => {
      const res = await request(getAppHelper()).get(`/contract/${ObjectId()}`).send();
      expect(res.status).toBe(404);
    });
    it("should return 500 not found", async () => {
      const res = await request(getAppHelper()).get(`/contract/1`).send();
      expect(res.status).toBe(500);
    });
    it("should return 200 and tokens for not adult young", async () => {
      const youngFixture = getNewYoungFixture();
      let young = await createYoungHelper(youngFixture);
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const resContract = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resContract.status).toBe(200);
      const res = await request(getAppHelper()).get(`/contract/${resContract.body.data._id}`).send();
      expect(res.status).toBe(200);
      expect(res.body.data.parent1Token).not.toBe(undefined);
      expect(res.body.data.projectManagerToken).not.toBe(undefined);
      expect(res.body.data.structureManagerToken).not.toBe(undefined);
      expect(res.body.data.parent2Token).not.toBe(undefined);
      expect(res.body.data.youngContractToken).toBe(undefined);
    });
    it("should return 200 and tokens for not adult young", async () => {
      const youngFixture = getNewYoungFixture();
      let young = await createYoungHelper(youngFixture);
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      contractFixture.isYoungAdult = "true";
      const resContract = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resContract.status).toBe(200);
      const res = await request(getAppHelper()).get(`/contract/${resContract.body.data._id}`).send();
      expect(res.status).toBe(200);
      expect(res.body.data.parent1Token).toBe(undefined);
      expect(res.body.data.projectManagerToken).not.toBe(undefined);
      expect(res.body.data.structureManagerToken).not.toBe(undefined);
      expect(res.body.data.parent2Token).toBe(undefined);
      expect(res.body.data.youngContractToken).not.toBe(undefined);
    });
    it("should return 200 without token", async () => {
      const youngPassport = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = youngPassport;
      let young = await createYoungHelper(getNewYoungFixture());
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const resContract = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resContract.status).toBe(200);
      const res = await request(getAppHelper()).get(`/contract/${resContract.body.data._id}`).send();
      expect(res.status).toBe(200);
      expect(res.body.data.parent1Token).toBe(undefined);
      expect(res.body.data.projectManagerToken).toBe(undefined);
      expect(res.body.structureManagerToken).toBe(undefined);
      expect(res.body.data.parent2Token).toBe(undefined);
      expect(res.body.data.youngContractToken).toBe(undefined);
      passport.user = previous;
    });
  });
  describe("GET /contract/token/:token", () => {
    it("should return 404 not found", async () => {
      const resGet = await request(getAppHelper()).get(`/contract/token/${ObjectId()}`).send();
      expect(resGet.status).toBe(404);
    });
    it("should return 200 from parent", async () => {
      let young = await createYoungHelper(getNewYoungFixture());
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const resPost = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resPost.status).toBe(200);
      const resGet = await request(getAppHelper()).get(`/contract/token/${resPost.body.data.parent1Token}`).send();
      expect(resGet.status).toBe(200);
      expect(resGet.body.data.isParentToken).toBe(true);
      expectContractToEqual(resPost.body.data, resGet.body.data);
    });
    it("should return 200 from young", async () => {
      let young = await createYoungHelper(getNewYoungFixture());
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      contractFixture.isYoungAdult = "true";
      const resPost = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resPost.status).toBe(200);
      const resGet = await request(getAppHelper()).get(`/contract/token/${resPost.body.data.youngContractToken}`).send();
      expect(resGet.status).toBe(200);
      expect(resGet.body.data.isYoungContractToken).toBe(true);
      expectContractToEqual(resPost.body.data, resGet.body.data);
    });
    it("should return 200 from structure", async () => {
      let young = await createYoungHelper(getNewYoungFixture());
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const resPost = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resPost.status).toBe(200);
      const resGet = await request(getAppHelper()).get(`/contract/token/${resPost.body.data.structureManagerToken}`).send();
      expect(resGet.status).toBe(200);
      expect(resGet.body.data.isYoungContractToken).toBe(false);
      expect(resGet.body.data.isParentToken).toBe(false);
      expectContractToEqual(resPost.body.data, resGet.body.data);
    });
  });
  describe("POST /contract/token/:token", () => {
    it("should return 404 not found", async () => {
      const resGet = await request(getAppHelper()).post(`/contract/token/${ObjectId()}`).send();
      expect(resGet.status).toBe(404);
    });
    it("should return 200 and validate parent status", async () => {
      let young = await createYoungHelper(getNewYoungFixture());
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const resPost = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resPost.status).toBe(200);
      const resToken = await request(getAppHelper()).post(`/contract/token/${resPost.body.data.parent1Token}`).send();
      expect(resToken.status).toBe(200);
      const contrat = await getContractByIdHelper(resPost.body.data._id);
      expect(contrat.parent1Status).toBe("VALIDATED");
    });
    it("should return 200 and validate structure status", async () => {
      let young = await createYoungHelper(getNewYoungFixture());
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const resPost = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resPost.status).toBe(200);
      const resToken = await request(getAppHelper()).post(`/contract/token/${resPost.body.data.structureManagerToken}`).send();
      expect(resToken.status).toBe(200);
      const contrat = await getContractByIdHelper(resPost.body.data._id);
      expect(contrat.structureManagerStatus).toBe("VALIDATED");
    });
    it("should return 200 and validate young status", async () => {
      let young = await createYoungHelper(getNewYoungFixture());
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      contractFixture.isYoungAdult = "true";
      const resPost = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resPost.status).toBe(200);
      const resToken = await request(getAppHelper()).post(`/contract/token/${resPost.body.data.youngContractToken}`).send();
      expect(resToken.status).toBe(200);
      const contrat = await getContractByIdHelper(resPost.body.data._id);
      expect(contrat.youngContractStatus).toBe("VALIDATED");
    });
  });
  describe("POST /contract/:id/download", () => {
    it("should return 404 not found", async () => {
      const resDownload = await request(getAppHelper()).post(`/contract/${ObjectId()}/download`).send();
      expect(resDownload.status).toBe(404);
    });
    it("should return 500 not found", async () => {
      const resDownload = await request(getAppHelper()).post(`/contract/2/download`).send();
      expect(resDownload.status).toBe(500);
    });
    it("should return 200", async () => {
      let young = await createYoungHelper(getNewYoungFixture());
      const applicationFixture = getNewApplicationFixture();
      applicationFixture.youngId = young._id;
      const application = await createApplication(applicationFixture);
      const contractFixture = getNewContractFixture();
      contractFixture.youngId = young._id;
      contractFixture.applicationId = application._id;
      const resPost = await request(getAppHelper()).post("/contract").send(contractFixture);
      expect(resPost.status).toBe(200);
      const resDownload = await request(getAppHelper()).post(`/contract/${resPost.body.data._id}/download`).send();
      expect(resDownload.status).toBe(200);
    });
  });
});
