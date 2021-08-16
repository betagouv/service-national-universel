require("dotenv").config({ path: "./.env-testing" });

const { ObjectId } = require("mongoose").Types;
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const getNewContractFixture = require("./fixtures/contract");
const { getNewApplicationFixture } = require("./fixtures/application");
const getNewYoungFixture = require("./fixtures/young");
const { createApplication } = require("./helpers/application");
const { getYoungByIdHelper, createYoungHelper } = require("./helpers/young");
const { expectContractToEqual, getContractByIdHelper, createContractHelper } = require("./helpers/contract");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Structure", () => {
  describe("POST /contract", () => {
    it("should return 400 when contract ID is not a valid ID", async () => {
      const res = await request(getAppHelper()).post("/contract").send({ _id: "not-an-id" });
      expect(res.status).toBe(400);
    });
    it("should return 404 when application is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/contract")
        .send({ ...getNewContractFixture(), youngId: young._id });
      expect(res.status).toBe(404);
    });
    it("should return 404 when young is not found", async () => {
      const application = await createApplication(getNewApplicationFixture());
      const res = await request(getAppHelper())
        .post("/contract")
        .send({ ...getNewContractFixture(), applicationId: application._id });
      expect(res.status).toBe(404);
    });
    describe("when it works", () => {
      async function createContract(options, initialYoung) {
        const young = initialYoung || (await createYoungHelper(getNewYoungFixture()));
        const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
        const contractFixture = getNewContractFixture();
        contractFixture.youngId = young._id;
        contractFixture.applicationId = application._id;
        const res = await request(getAppHelper())
          .post("/contract")
          .send({ ...contractFixture, ...options });
        return { res, young, application, contractFixture };
      }
      it("should create contract and send it when setting sendMessage to true", async () => {
        const { res, young, contractFixture } = await createContract({ sendMessage: true });
        expect(res.status).toBe(200);
        expectContractToEqual(res.body.data, contractFixture);
        expect(res.body.data.invitationSent).toBe("true");
        const updatedYoung = await getYoungByIdHelper(young._id);
        expect(updatedYoung.statusPhase2Contract[0]).toBe("SENT");
      });
      it("should create contract and not send it when setting sendMessage to false", async () => {
        const { res, young, contractFixture } = await createContract({ sendMessage: false });
        expect(res.status).toBe(200);
        expectContractToEqual(res.body.data, contractFixture);
        expect(res.body.data.invitationSent).not.toBe("true");
        const updatedYoung = await getYoungByIdHelper(young._id);
        expect(updatedYoung.statusPhase2Contract[0]).toBe("DRAFT");
      });
      it("should create contract and draft it then send it", async () => {
        const { res, young, contractFixture } = await createContract({ sendMessage: false });
        expect(res.status).toBe(200);
        expect(res.body.data.invitationSent).not.toBe("true");
        const resAfter = await request(getAppHelper())
          .post("/contract")
          .send({ ...res.body.data, sendMessage: true });
        expect(resAfter.status).toBe(200);
        expectContractToEqual(resAfter.body.data, contractFixture);
        expect(resAfter.body.data.invitationSent).toBe("true");

        const updatedYoung = await getYoungByIdHelper(young._id);
        expect(updatedYoung.statusPhase2Contract[0]).toBe("SENT");
      });

      it("should create tokens for young (not adult)", async () => {
        const { res } = await createContract({ sendMessage: true });
        expect(res.status).toBe(200);
        expect(res.body.data.parent1Token).toBeTruthy();
        expect(res.body.data.projectManagerToken).toBeTruthy();
        expect(res.body.data.structureManagerToken).toBeTruthy();
        expect(res.body.data.parent2Token).toBeTruthy();
        expect(res.body.data.youngContractToken).toBeUndefined();
      });

      it("should create tokens for young (adult)", async () => {
        const { res } = await createContract({ sendMessage: true, isYoungAdult: "true" });
        expect(res.status).toBe(200);
        expect(res.body.data.parent1Token).toBeUndefined();
        expect(res.body.data.projectManagerToken).toBeTruthy();
        expect(res.body.data.structureManagerToken).toBeTruthy();
        expect(res.body.data.parent2Token).toBeUndefined();
        expect(res.body.data.youngContractToken).toBeTruthy();
      });
    });
  });
  describe("GET /contract/:id", () => {
    it("should return 404 not found", async () => {
      const res = await request(getAppHelper()).get(`/contract/${ObjectId()}`).send();
      expect(res.status).toBe(404);
    });
    it("should return 400 not an ID", async () => {
      const res = await request(getAppHelper()).get(`/contract/1`).send();
      expect(res.status).toBe(400);
    });
    it("should return 200 when it works", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({ ...getNewContractFixture(), youngId: young._id, applicationId: application._id });
      const res = await request(getAppHelper()).get(`/contract/${contract._id}`).send();
      expect(res.status).toBe(200);
    });
    it("should not return tokens for young", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({
        ...getNewContractFixture(),
        youngId: young._id,
        applicationId: application._id,
        projectManagerToken: "foo",
        parent1Token: "bar",
        parent2Token: "baz",
        structureManagerToken: "qux",
      });

      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper()).get(`/contract/${contract._id}`).send();
      expect(res.status).toBe(200);
      expect(res.body.data.projectManagerToken).toBeUndefined();
      expect(res.body.structureManagerToken).toBeUndefined();
      expect(res.body.data.parent1Token).toBeUndefined();
      expect(res.body.data.parent2Token).toBeUndefined();
      expect(res.body.data.youngContractToken).toBeUndefined();

      passport.user = previous;
    });
    it("should return 401 when young tries to see a contract from someone else", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const contract = await createContractHelper({ ...getNewContractFixture(), youngId: young._id, applicationId: application._id });

      const secondYoung = await createYoungHelper(getNewYoungFixture());

      const passport = require("passport");
      const previous = passport.user;
      passport.user = secondYoung;

      const res = await request(getAppHelper()).get(`/contract/${contract._id}`).send();
      expect(res.status).toBe(401);

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
