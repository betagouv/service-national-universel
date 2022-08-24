require("dotenv").config({ path: "./.env-testing" });
const fetch = require("node-fetch");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
//application
const { getNewApplicationFixture } = require("./fixtures/application");
const { createApplication } = require("./helpers/application");
//mission
const getNewMissionFixture = require("./fixtures/mission");
const { createMissionHelper } = require("./helpers/mission");
//young
const getNewYoungFixture = require("./fixtures/young");
const { getYoungsHelper, createYoungHelper, notExistingYoungId, deleteYoungByEmailHelper } = require("./helpers/young");
//cohesion center
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const { createCohesionCenter, getCohesionCenterById } = require("./helpers/cohesionCenter");
const { createSessionPhase1, getSessionPhase1ById } = require("./helpers/sessionPhase1");
const { getNewSessionPhase1Fixture } = require("./fixtures/sessionPhase1");

const { ROLES } = require("snu-lib/roles");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.mock("../geo", () => ({
  ...jest.requireActual("../geo"),
  getQPV: (a) => Promise.resolve(a === "geoShouldWork"),
}));

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getFile: () => Promise.resolve({ Body: "" }),
  uploadFile: (path, file) => Promise.resolve({ path, file }),
  deleteFile: (path, file) => Promise.resolve({ path, file }),
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
  describe("PUT /young/:id/soft-delete", () => {
    it("should soft-delete the young", async () => {
      const youngFixture = getNewYoungFixture();
      const young = await createYoungHelper(youngFixture);
      const res = await request(getAppHelper()).put(`/young/${young._id}/soft-delete`);
      expect(res.statusCode).toEqual(200);
      const updatedYoung = res.body.data;

      const fieldToKeep = [
        "_id",
        "__v",
        "email",
        "status",
        "birthdateAt",
        "cohort",
        "gender",
        "situation",
        "grade",
        "qpv",
        "populationDensity",
        "handicap",
        "ppsBeneficiary",
        "paiBeneficiary",
        "highSkilledActivity",
        "statusPhase1",
        "statusPhase2",
        "phase2ApplicationStatus",
        "statusPhase3",
        "department",
        "region",
        "zip",
        "city",
        "files",
      ];

      //Check that the fields deleted are deleted
      for (const key in updatedYoung) {
        if (!fieldToKeep.find((val) => val === key)) {
          if (key !== "updatedAt") expect(updatedYoung[key]).toEqual(undefined);
        }
      }

      //Check that the saved fields are equals to the old one
      for (const key in updatedYoung) {
        console.log("key -> ", key);
        if (fieldToKeep.find((val) => val === key)) {
          if (key === "status") {
            expect(updatedYoung[key]).toEqual("DELETED");
          } else if (key === "email") {
            expect(updatedYoung[key]).toEqual(`${young._doc["_id"]}@delete.com`);
          } else if (key === "_id") {
            expect(updatedYoung[key]).toEqual(young[key].toString());
          } else if (key === "phase2ApplicationStatus") {
            expect(updatedYoung[key]).toEqual(Array.from(young[key]));
          } else if (key === "birthdateAt") {
            expect(Date(updatedYoung[key])).toEqual(Date(young[key]));
          } else {
            expect(updatedYoung[key]).toEqual(young[key]);
          }
        }
      }
    });

    it("should return 404 with wrong id", async () => {
      const res = await request(getAppHelper()).delete("/young/" + notExistingYoungId);
      expect(res.statusCode).toEqual(404);
    });

    it("should be only accessible by referents", async () => {
      const passport = require("passport");
      await request(getAppHelper()).delete("/young/" + notExistingYoungId);
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });

  describe("GET /young/:id/patches", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).get(`/young/${notExistingYoungId}/patches`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 403 if not admin", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      young.firstName = "MY NEW NAME";
      await young.save();
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const res = await request(getAppHelper()).get(`/young/${young._id}/patches`).send();
      expect(res.status).toBe(403);
      passport.user.role = ROLES.ADMIN;
    });
    it("should return 200 if young found with patches", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      young.firstName = "MY NEW NAME";
      await young.save();
      const res = await request(getAppHelper()).get(`/young/${young._id}/patches`).send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/firstName", value: "MY NEW NAME" })]),
          }),
        ]),
      );
    });
    it("should be only accessible by referents", async () => {
      const passport = require("passport");
      await request(getAppHelper()).get(`/young/${notExistingYoungId}/patches`).send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });

  describe("PUT /young/:id/validate-mission-phase3", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).put(`/young/${notExistingYoungId}/validate-mission-phase3`).send({});
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper()).put(`/young/${young._id}/validate-mission-phase3`).send({});
      expect(res.statusCode).toEqual(200);
      passport.user = previous;
    });
    it("should be only accessible by young", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const res = await request(getAppHelper()).put(`/young/${young._id}/validate-mission-phase3`).send();
      expect(res.statusCode).toEqual(200);
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("young");
    });
    it("should be only accessible for yourself if you are a young", async () => {
      const me = await createYoungHelper(getNewYoungFixture());
      const they = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = me;
      const res = await request(getAppHelper()).put(`/young/${they._id}/validate-mission-phase3`).send();
      expect(res.statusCode).toEqual(403);
      passport.user = previous;
    });
  });

  describe("POST /young/france-connect/authorization-url", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).post("/young/france-connect/authorization-url").send({
        callback: "foo",
      });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("POST /young/france-connect/user-info", () => {
    it("should return 200", async () => {
      const jsonResponse = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve({
            access_token: "foo",
            id_token: "bar",
          }),
        )
        .mockReturnValue(Promise.resolve({}));
      fetch.mockReturnValue(
        Promise.resolve({
          status: 200,
          json: jsonResponse,
        }),
      );
      const res = await request(getAppHelper()).post("/young/france-connect/user-info").send({
        code: "foo",
        callback: "bar",
      });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("PUT /young", () => {
    async function selfUpdateYoung(body = {}, fields = {}) {
      const young = await createYoungHelper(getNewYoungFixture(fields));
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const response = await request(getAppHelper()).put("/young").send(body);
      updatedYoung = response.body.data;
      passport.user = previous;

      return { young, updatedYoung, response };
    }
    it("should return 200 if young found", async () => {
      const { response } = await selfUpdateYoung({});
      expect(response.statusCode).toEqual(200);
    });

    it("should update QPV to true", async () => {
      const { updatedYoung, response } = await selfUpdateYoung({
        zip: "geoShouldWork",
        city: "foo",
        address: "bar",
      });
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.qpv).toEqual("true");
    });

    it("should update QPV to false", async () => {
      const { updatedYoung, response } = await selfUpdateYoung({
        zip: "qpvNotShouldWork",
        city: "foo",
        address: "bar",
      });
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.qpv).toEqual("false");
    });

    it("should not update QPV", async () => {
      const { updatedYoung, response } = await selfUpdateYoung({ zip: "qpvShouldWork" });
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.qpv).toEqual("false");
    });

    it("should not cascade status to WITHDRAWN if not validated", async () => {
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        statusPhase1: "WAITING_AFFECTATION",
        statusPhase2: "WAITING_REALISATION",
        statusPhase3: "WAITING_REALISATION",
      });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const response = await request(getAppHelper()).put("/young").send({ status: "WITHDRAWN" });
      const updatedYoung = response.body.data;
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.status).toEqual("WITHDRAWN");
      expect(updatedYoung.statusPhase1).toEqual("WAITING_AFFECTATION");
      expect(updatedYoung.statusPhase2).toEqual("WAITING_REALISATION");
      expect(updatedYoung.statusPhase3).toEqual("WAITING_REALISATION");
      passport.user = previous;
    });
    it("should not cascade status to WITHDRAWN if validated", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), statusPhase1: "DONE", statusPhase2: "VALIDATED", statusPhase3: "VALIDATED" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const response = await request(getAppHelper()).put("/young").send({ status: "WITHDRAWN" });
      const updatedYoung = response.body.data;
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.status).toEqual("WITHDRAWN");
      expect(updatedYoung.statusPhase1).toEqual("DONE");
      expect(updatedYoung.statusPhase2).toEqual("VALIDATED");
      expect(updatedYoung.statusPhase3).toEqual("VALIDATED");
      passport.user = previous;
    });

    it("should update young birthCountry", async () => {
      const { updatedYoung, response } = await selfUpdateYoung({ birthCountry: "HOP" });
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.birthCountry).toEqual("HOP");
    });

    it("should remove places when sending to cohesion center", async () => {
      const sessionPhase1 = await createSessionPhase1(getNewSessionPhase1Fixture());
      const placesLeft = sessionPhase1.placesLeft;
      const { updatedYoung, response } = await selfUpdateYoung(
        {
          sessionPhase1Id: sessionPhase1._id,
        },
        {
          status: "VALIDATED",
          statusPhase1: "DONE",
        },
      );
      expect(response.statusCode).toEqual(200);
      const updatedSessionPhase1 = await getSessionPhase1ById(updatedYoung.sessionPhase1Id);
      expect(updatedSessionPhase1.placesLeft).toEqual(placesLeft - 1);
    });

    it("should be only accessible by young", async () => {
      const passport = require("passport");
      await request(getAppHelper()).put("/young").send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("young");
    });
  });

  describe("POST /young/signup_invite", () => {
    it("should return 400 when invitation token is not provided", async () => {
      await deleteYoungByEmailHelper("foo@example.org");
      const young = await createYoungHelper({ ...getNewYoungFixture(), email: "foo@example.org" });
      const res = await request(getAppHelper()).post("/young/signup_invite").send({
        email: young.email,
        password: "%%minMAJ1235",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 404 when invitation is expired", async () => {
      await deleteYoungByEmailHelper("foo@example.org");
      const invitationToken = Date.now().toString();
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        email: "foo@example.org",
        invitationToken,
        invitationExpires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      });
      const res = await request(getAppHelper()).post("/young/signup_invite").send({
        email: young.email,
        invitationToken,
        password: "aabb",
      });
      expect(res.statusCode).toEqual(404);
    });
    it("should return 400 when password is not valid", async () => {
      await deleteYoungByEmailHelper("foo@example.org");
      const invitationToken = Date.now().toString();
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        email: "foo@example.org",
        invitationToken,
        invitationExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      const res = await request(getAppHelper()).post("/young/signup_invite").send({
        email: young.email,
        invitationToken,
        password: "aabb",
      });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 200 when young found", async () => {
      await deleteYoungByEmailHelper("foo@example.org");
      const invitationToken = Date.now().toString();
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        email: "foo@example.org",
        invitationToken,
        invitationExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      const res = await request(getAppHelper()).post("/young/signup_invite").send({
        email: young.email,
        password: "%%minMAJ1235",
        invitationToken,
      });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("POST /young/signup_verify", () => {
    it("should return 400 when missing invitationToken", async () => {
      const res = await request(getAppHelper()).post("/young/signup_verify").send({});
      expect(res.statusCode).toEqual(400);
    });
    it("should return 404 when invitation is expired", async () => {
      await deleteYoungByEmailHelper("foo@example.org");
      const invitationToken = Date.now().toString();
      await createYoungHelper({
        ...getNewYoungFixture(),
        invitationToken,
        invitationExpires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70),
      });
      // expect(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)).toEqual([]);
      const res = await request(getAppHelper()).post("/young/signup_verify").send({ invitationToken });
      expect(res.statusCode).toEqual(404);
    });
    it("should return 404 when invitation token is wrong", async () => {
      await deleteYoungByEmailHelper("foo@example.org");
      const invitationToken = Date.now().toString();
      await createYoungHelper({
        ...getNewYoungFixture(),
        invitationToken,
        invitationExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      const res = await request(getAppHelper()).post("/young/signup_verify").send({ invitationToken: "bar" });
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 when invitation token is wrong", async () => {
      await deleteYoungByEmailHelper("foo@example.org");
      const invitationToken = Date.now().toString();
      await createYoungHelper({
        ...getNewYoungFixture(),
        invitationToken,
        invitationExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      const res = await request(getAppHelper()).post("/young/signup_verify").send({ invitationToken });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("POST /young/file/:key", () => {
    it("should send file for the young", async () => {
      // This test should be improved to check the file is sent (currently no file is sent)
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      let res = await request(getAppHelper())
        .post("/young/file/cniFiles")
        .send({ body: JSON.stringify({ names: ["e"] }) });
      expect(res.status).toEqual(200);
      expect(res.body.data).toEqual(["e"]);
      expect(res.body.ok).toEqual(true);

      // With military file.
      res = await request(getAppHelper())
        .post("/young/file/militaryPreparationFilesIdentity")
        .send({ body: JSON.stringify({ names: ["e"] }) });
      expect(res.status).toEqual(200);
      expect(res.body.data).toEqual(["e"]);
      expect(res.body.ok).toEqual(true);

      passport.user = previous;
    });

    it("should not accept invalid body", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper())
        .post("/young/file/cniFiles")
        .send({ body: JSON.stringify({ pop: ["e"] }) });
      expect(res.status).toEqual(400);
      passport.user = previous;
    });

    it("should not accept invalid file name", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper())
        .post("/young/file/thisPropertyDoesNotExists")
        .send({ body: JSON.stringify({ names: ["e"] }) });
      expect(res.status).toEqual(400);
      passport.user = previous;
    });
  });

  describe("GET /young/validate_phase3/:young/:token", () => {
    it("should return 404 when token or young is wrong", async () => {
      const res = await request(getAppHelper()).get(`/young/validate_phase3/${notExistingYoungId}/token`);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 when token is right", async () => {
      const token = Date.now().toString();
      const young = await createYoungHelper({ ...getNewYoungFixture(), phase3Token: token });
      const res = await request(getAppHelper()).get(`/young/validate_phase3/${young._id}/${token}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("PUT /young/validate_phase3/:young/:token", () => {
    it("should return 404 when token or young is wrong", async () => {
      const res = await request(getAppHelper()).put(`/young/validate_phase3/${notExistingYoungId}/token`);
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 when token is right with tutor note", async () => {
      const token = Date.now().toString();
      const young = await createYoungHelper({ ...getNewYoungFixture(), phase3Token: token });
      const res = await request(getAppHelper()).put(`/young/validate_phase3/${young._id}/${token}`).send({
        phase3TutorNote: "hello",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.phase3TutorNote).toEqual("hello");
    });
  });

  describe("POST /young/:id/:email/:template", () => {
    const validTemplate = "170";
    it("should return 400 if template not found ", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper()).post(`/young/${young._id}/email/test/`).send();
      expect(res.statusCode).toEqual(400);
    });
    it("should return 404 if young not found ", async () => {
      const res = await request(getAppHelper()).post(`/young/${notExistingYoungId}/email/${validTemplate}/`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/young/" + young._id + "/email/" + validTemplate)
        .send({ message: "hello" });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GET /young/:id/application", () => {
    it("should return 404 when young does not exist", async () => {
      const res = await request(getAppHelper()).get("/young/" + notExistingYoungId + "/application");
      expect(res.status).toBe(404);
    });
    it("should return empty array when young has no application", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper()).get("/young/" + young._id + "/application");
      expect(res.body.data).toStrictEqual([]);
      expect(res.status).toBe(200);
    });
    it("should return applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const res = await request(getAppHelper()).get("/young/" + young._id + "/application");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe("WAITING_VALIDATION");
    });
    it("should only allow young to see their own applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const secondYoung = await createYoungHelper(getNewYoungFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      await createApplication({ ...getNewApplicationFixture(), youngId: young._id, missionId: mission._id });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      // Successful request
      let res = await request(getAppHelper()).get("/young/" + young._id + "/application");
      expect(res.status).toBe(200);

      // Failed request (not allowed)
      res = await request(getAppHelper()).get("/young/" + secondYoung._id + "/application");
      expect(res.status).toBe(403);

      passport.user = previous;
    });
  });
});
