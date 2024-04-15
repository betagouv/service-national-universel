import fetch from "node-fetch";

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
const { createYoungHelper, notExistingYoungId, deleteYoungByEmailHelper } = require("./helpers/young");

const { ROLES } = require("snu-lib");

const jwt = require("jsonwebtoken");
const { createReferentHelper } = require("./helpers/referent");
const getNewReferentFixture = require("./fixtures/referent");
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

jest.setTimeout(30_000);

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
        "inscriptionStep2023",
        "inscriptionDoneDate",
        "reinscriptionStep2023",
        "department",
        "region",
        "zip",
        "city",
        "createdAt",
      ];

      //Check that the fields deleted are deleted
      for (const key in updatedYoung) {
        if (!fieldToKeep.find((val) => val === key)) {
          if (!["updatedAt", "status", "email", "_id", "phase2ApplicationStatus", "birthdateAt"].includes(key)) expect(updatedYoung[key]).toEqual(undefined);
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
          } else if (["birthdateAt", "createdAt"].includes(key)) {
            expect(new Date(updatedYoung[key])).toEqual(new Date(young[key]));
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

    it("should be accessible by referents or young", async () => {
      const passport = require("passport");
      await request(getAppHelper()).delete("/young/" + notExistingYoungId);
      expect(passport.lastTypeCalledOnAuthenticate).toEqual(["referent", "young"]);
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

  let storedState;
  let storedNonce;

  describe("POST /young/france-connect/authorization-url", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).post("/young/france-connect/authorization-url").send({
        callback: "foo",
      });
      const url = res.body.data.url;
      storedState = url.split("state=")[1].split("&")[0];
      storedNonce = url.split("nonce=")[1].split("&")[0];
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("POST /young/france-connect/user-info", () => {
    it("should return 200", async () => {
      const secretKey = "mysecretkey";
      const jwtPayload = {
        nonce: storedNonce,
      };
      const jwtOptions = {
        expiresIn: "1h",
      };
      const jwtToken = jwt.sign(jwtPayload, secretKey, jwtOptions);

      const jsonResponse = jest
        .fn()
        .mockReturnValueOnce(
          Promise.resolve({
            access_token: "foo",
            id_token: jwtToken,
          }),
        )
        .mockReturnValue(Promise.resolve({}));
      // @ts-expect-error mockReturnValue type
      fetch.mockReturnValue(
        Promise.resolve({
          status: 200,
          json: jsonResponse,
        }),
      );
      const res = await request(getAppHelper()).post("/young/france-connect/user-info").send({
        code: "foo",
        callback: "bar",
        state: storedState,
      });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("PUT /young/account/profile", () => {
    it("should return 200 if young is updated", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper()).put("/young/account/profile").send({
        gender: "male",
        phone: "0600000000",
        phoneZone: "FRANCE",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.gender).toEqual("male");
      expect(res.body.data.phone).toEqual("0600000000");
      expect(res.body.data.phoneZone).toEqual("FRANCE");
      passport.user = previous;
    });
    it("should return 400 if parameters are wrong", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper()).put("/young/account/profile").send({
        firstName: "foo",
        lastName: "bar",
      });
      expect(res.statusCode).toEqual(400);
      passport.user = previous;
    });

    it.skip("should not cascade status to WITHDRAWN if not validated", async () => {
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

    it.skip("should not cascade status to WITHDRAWN if validated", async () => {
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

    it("should be only accessible by young", async () => {
      const passport = require("passport");
      await request(getAppHelper()).put("/young").send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("young");
    });
  });

  describe("PUT /young/account/parents", () => {
    it("should return 200 if parents are updated", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = young;
      const response = await request(getAppHelper()).put("/young/account/parents").send({
        parent1Status: "mother",
        parent1FirstName: "foo",
        parent1LastName: "bar",
        parent1Email: "foo@bar.com",
        parent1Phone: "0600000000",
        parent1PhoneZone: "FRANCE",
        parent2: true,
        parent2Status: "father",
        parent2FirstName: "foo",
        parent2LastName: "bar",
        parent2Email: "foo@bar.com",
        parent2Phone: "0600000000",
        parent2PhoneZone: "FRANCE",
      });
      const updatedYoung = response.body.data;
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.parent1Status).toEqual("mother");
      expect(updatedYoung.parent1FirstName.toLowerCase()).toEqual("foo");
      expect(updatedYoung.parent1LastName.toLowerCase()).toEqual("bar");
      expect(updatedYoung.parent1Email).toEqual("foo@bar.com");
      expect(updatedYoung.parent1Phone).toEqual("0600000000");
      expect(updatedYoung.parent1PhoneZone).toEqual("FRANCE");
      expect(updatedYoung.parent2Status).toEqual("father");
      expect(updatedYoung.parent2FirstName.toLowerCase()).toEqual("foo");
      expect(updatedYoung.parent2LastName.toLowerCase()).toEqual("bar");
      expect(updatedYoung.parent2Email).toEqual("foo@bar.com");
      expect(updatedYoung.parent2Phone).toEqual("0600000000");
      expect(updatedYoung.parent2PhoneZone).toEqual("FRANCE");
    });

    it("should return 400 if parent 1 status is not given", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = young;
      const response = await request(getAppHelper()).put("/young/account/parents").send({ parent1Status: "" });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe("PUT young/account/mission-preferences", () => {
    it("should return 200 if mission preferences are updated", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), domains: ["foo"] });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const response = await request(getAppHelper())
        .put("/young/account/mission-preferences")
        .send({
          domains: ["bar"],
          missionFormat: "DISCONTINUOUS",
          period: "DURING_HOLIDAYS",
          periodRanking: ["foo"],
          mobilityTransport: ["foo"],
          mobilityTransportOther: "foo",
          professionnalProject: "OTHER",
          professionnalProjectPrecision: "foo",
          desiredLocation: "foo",
          engaged: "true",
          engagedDescription: "foo",
          mobilityNearHome: "true",
          mobilityNearSchool: "true",
          mobilityNearRelative: "true",
          mobilityNearRelativeName: "foo",
          mobilityNearRelativeAddress: "foo",
          mobilityNearRelativeZip: "foo",
          mobilityNearRelativeCity: "foo",
        });
      const updatedYoung = response.body.data;
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.domains).toEqual(["bar"]);
      expect(updatedYoung.missionFormat).toEqual("DISCONTINUOUS");
      expect(updatedYoung.period).toEqual("DURING_HOLIDAYS");
      expect(updatedYoung.periodRanking).toEqual(["foo"]);
      expect(updatedYoung.mobilityTransport).toEqual(["foo"]);
      expect(updatedYoung.mobilityTransportOther).toEqual("foo");
      expect(updatedYoung.professionnalProject).toEqual("OTHER");
      expect(updatedYoung.professionnalProjectPrecision).toEqual("foo");
      expect(updatedYoung.desiredLocation).toEqual("foo");
      expect(updatedYoung.engaged).toEqual("true");
      expect(updatedYoung.engagedDescription).toEqual("foo");
      expect(updatedYoung.mobilityNearHome).toEqual("true");
      expect(updatedYoung.mobilityNearSchool).toEqual("true");
      expect(updatedYoung.mobilityNearRelative).toEqual("true");
      expect(updatedYoung.mobilityNearRelativeName).toEqual("foo");
      expect(updatedYoung.mobilityNearRelativeAddress).toEqual("foo");
      expect(updatedYoung.mobilityNearRelativeZip).toEqual("foo");
      expect(updatedYoung.mobilityNearRelativeCity).toEqual("foo");
      passport.user = previous;
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

  describe("POST /young/:youngId/documents/:key", () => {
    it("should send file for the young", async () => {
      // This test should be improved to check the file is sent (currently no file is sent)
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      let res = await request(getAppHelper())
        .post(`/young/${young._id}/documents/cniFiles`)
        .send({ body: JSON.stringify({ names: ["e"] }) });
      expect(res.status).toEqual(200);
      // expect(res.body.data[0].name).toEqual("e");
      expect(res.body.ok).toEqual(true);

      // With military file.
      res = await request(getAppHelper())
        .post(`/young/${young._id}/documents/militaryPreparationFilesIdentity`)
        .send({ body: JSON.stringify({ names: ["e"] }) });
      expect(res.status).toEqual(200);
      // expect(res.body.data).toEqual(["e"]);
      expect(res.body.ok).toEqual(true);

      passport.user = previous;
    });

    it.skip("should not accept invalid body", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper())
        .post(`/young/${young._id}/documents/cniFiles`)
        .send({ body: JSON.stringify({ blablabla: ["e"] }) });
      expect(res.status).toEqual(400);
      passport.user = previous;
    });

    it("should not accept invalid file name", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper())
        .post(`/young/${young._id}/documents/thisPropertyDoesNotExists`)
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
    const validTemplate = "1229";
    it("should return 400 if template not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper()).post(`/young/${young._id}/email/test/`).send();
      expect(res.statusCode).toEqual(400);
    });
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).post(`/young/${notExistingYoungId}/email/${validTemplate}/`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = young;
      const res = await request(getAppHelper())
        .post("/young/" + young._id + "/email/" + validTemplate)
        .send({ message: "hello" });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GET /young/:id/application", () => {
    it("should return 404 when young does not exist", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const passport = require("passport");
      passport.user = referent;
      const res = await request(getAppHelper()).get("/young/" + notExistingYoungId + "/application");
      expect(res.status).toBe(404);
    });
    it("should return empty array when young has no application", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = young;
      const res = await request(getAppHelper()).get("/young/" + young._id + "/application");
      expect(res.body.data).toStrictEqual([]);
      expect(res.status).toBe(200);
    });
    it("should return applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = young;
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
