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
const {
  getReferentsHelper,
  deleteReferentByIdHelper,
  notExistingReferentId,
  createReferentHelper,
  expectReferentToEqual,
  deleteAllReferentBySubrole,
  getReferentByIdHelper,
} = require("./helpers/referent");
const { dbConnect, dbClose } = require("./helpers/db");
const { createCohesionCenter, getCohesionCenterById } = require("./helpers/cohesionCenter");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const { getNewApplicationFixture } = require("./fixtures/application");
const { createApplication, getApplicationsHelper } = require("./helpers/application");
const { createMissionHelper, getMissionsHelper } = require("./helpers/mission");
const getNewMissionFixture = require("./fixtures/mission");
const { SUB_ROLES, ROLES } = require("snu-lib/roles");

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

  //todo 404 if tutor not found
  describe("POST /referent/:tutorId/email/:template", () => {
    it("should return 200 if tutor not found but it's weird", async () => {
      const res = await request(getAppHelper()).post(`/referent/${notExistingReferentId}/email/test`).send({ message: "hello", subject: "hi" });
      expect(res.statusCode).toEqual(200);
    });
    it("should return 200 if tutor found", async () => {
      const tutor = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).post(`/referent/${tutor._id}/email/correction`).send({ message: "hello", subject: "hi" });
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
        .get("/referent/file/cniFiles")
        .send({ body: JSON.stringify({ youngId: notExistingYoungId, names: ["e"] }) });
      expect(res.statusCode).toEqual(404);
    });
    it("should send file for the young", async () => {
      // This test should be improved to check the file is sent (currently no file is sent)
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/referent/file/cniFiles")
        .send({ body: JSON.stringify({ youngId: young._id, names: ["e"] }) });
      expect(res.body).toEqual({ data: ["e"], ok: true });
    });
  });

  describe("GET /referent/young/:youngId", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper())
        .get("/referent/young/" + notExistingYoungId)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .get("/referent/young/" + young._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expectYoungToEqual(young, res.body.data);
    });
    it("should contain applications", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const application = await createApplication({ ...getNewApplicationFixture(), youngId: young._id });
      const res = await request(getAppHelper())
        .get("/referent/young/" + young._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.applications).toEqual([
        {
          ...application.toObject(),
          _id: application._id.toString(),
          createdAt: application.createdAt.toISOString(),
          updatedAt: application.updatedAt.toISOString(),
        },
      ]);
    });
  });

  describe("GET /referent/:id/patches", () => {
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper()).get(`/referent/${notExistingReferentId}/patches`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found with patches", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      referent.firstName = "MY NEW NAME";
      await referent.save();
      const res = await request(getAppHelper()).get(`/referent/${referent._id}/patches`).send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ops: expect.arrayContaining([expect.objectContaining({ op: "replace", path: "/firstName", value: "MY NEW NAME" })]),
          }),
        ])
      );
    });
  });

  describe("GET /referent/:id", () => {
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper()).get(`/referent/${notExistingReferentId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).get(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(200);
      expectReferentToEqual(referent, res.body.data);
    });
    it("should return 401 if role is not admin", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).get(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(401);
      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("GET /referent/manager_department/:department", () => {
    it("should return 404 if manager not found", async () => {
      const res = await request(getAppHelper()).get(`/referent/manager_department/foo`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if manager found", async () => {
      await deleteAllReferentBySubrole("manager_department");
      const referent = await createReferentHelper({
        ...getNewReferentFixture(),
        department: "bar",
        subRole: SUB_ROLES.manager_department,
        role: ROLES.REFERENT_DEPARTMENT,
      });
      const res = await request(getAppHelper()).get(`/referent/manager_department/bar`).send();
      expect(res.statusCode).toEqual(200);
      expectReferentToEqual(referent, res.body.data);
    });
  });

  describe("PUT /referent", () => {
    it("should return 400 when a role is given", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send({ role: "referent" });
      expect(res.statusCode).toEqual(400);
    });
    it("should return 200 when firstName is given", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send({ firstName: "MY NEW NAME" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data?.firstName).toEqual("My New Name");
    });
  });

  describe("PUT /referent/:id", () => {
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper()).put(`/referent/${notExistingReferentId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send({ firstName: "MY NEW NAME", lastName: "my neW last Name" });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          firstName: "My New Name",
          lastName: "MY NEW LAST NAME",
        })
      );
    });
    it("should return 401 if role is not admin", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(401);
      passport.user.role = ROLES.ADMIN;
    });

    it("should update tutor name in missions and applications", async () => {
      const firstName = "MY NEW NAME";
      const lastName = "MY NEW LAST NAME";
      const fullName = `My New Name MY NEW LAST NAME`;
      const referent = await createReferentHelper(getNewReferentFixture());
      const mission = await createMissionHelper(getNewMissionFixture());
      const application = await createApplication(getNewApplicationFixture());
      mission.tutorId = referent._id;
      application.tutorId = referent._id;
      application.missionId = mission._id;
      await mission.save();
      await application.save();
      const res = await request(getAppHelper()).put(`/referent/${referent._id}`).send({ firstName, lastName });
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(expect.objectContaining({ lastName: lastName }));
      const missions = await getMissionsHelper({ tutorId: referent._id.toString() });
      const applications = await getApplicationsHelper({ tutorId: referent._id });
      expect(missions).toHaveLength(1);
      expect(applications).toHaveLength(1);
      expect(missions.map((mission) => mission.tutorName)).toEqual([fullName]);
      expect(applications.map((application) => application.tutorName)).toEqual([fullName]);
    });
  });

  describe("DELETE /referent/:id", () => {
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper()).delete(`/referent/${notExistingReferentId}`).send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).delete(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(200);
      expect(await getReferentByIdHelper(referent._id)).toBeNull();
    });
    it("should return 401 if role is not admin", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper()).delete(`/referent/${referent._id}`).send();
      expect(res.statusCode).toEqual(401);
      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("POST /referent/signin_as/:type/:id", () => {
    it("should return 401 if role is not admin", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(401);
      passport.user.role = ROLES.ADMIN;
    });
    it("should return 404 if referent not found", async () => {
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + notExistingReferentId)
        .send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 404 if type param is not found", async () => {
      const res = await request(getAppHelper()).post("/referent/signin_as/foo/bar").send();
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if referent found", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: referent._id.toString(),
          firstName: referent.firstName,
          lastName: referent.lastName,
        })
      );
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/referent/signin_as/young/" + young._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          _id: young._id.toString(),
          firstName: young.firstName,
          lastName: young.lastName,
        })
      );
    });
    it("should return a jwt token", async () => {
      const referent = await createReferentHelper(getNewReferentFixture());
      const res = await request(getAppHelper())
        .post("/referent/signin_as/referent/" + referent._id)
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.headers["set-cookie"][0]).toContain("jwt=");
    });
  });
});
