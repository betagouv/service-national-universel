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
  describe("DELETE /young/:id", () => {
    it("should delete the young", async () => {
      const youngFixture = getNewYoungFixture();
      const young = await createYoungHelper(youngFixture);
      const youngsBefore = await getYoungsHelper();
      const res = await request(getAppHelper()).delete(`/young/${young._id}`);
      expect(res.statusCode).toEqual(200);
      const youngsAfter = await getYoungsHelper();
      expect(youngsAfter.length).toEqual(youngsBefore.length - 1);
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

  describe("GET /young/department-service/", () => {
    it("should return the department based on young deparment", async () => {
      const youngFixture = getNewYoungFixture();
      const young = await createYoungHelper({ ...youngFixture, department: "Ain" });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      await deleteAllDepartmentServicesHelper();
      const departmentFixture = getNewDepartmentServiceFixture();
      const department = await createDepartmentServiceHelper({ ...departmentFixture, department: "Ain" });
      const res = await request(getAppHelper()).get(`/young/department-service`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.department).toEqual(young.department);
      expect(res.body.data._id).toEqual(department._id.toString());
      passport.user = previous;
    });

    it("should return 404 if no department found", async () => {
      const res = await request(getAppHelper()).get("/young/department-service");
      expect(res.statusCode).toEqual(404);
    });
    it("should be only accessible by young", async () => {
      const passport = require("passport");
      await request(getAppHelper()).get("/young/department-service");
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("young");
    });
  });

  describe("GET /young/:id/patches", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).get(`/young/${notExistingYoungId}/patches`).send();
      expect(res.statusCode).toEqual(404);
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
        ])
      );
    });
    it("should be only accessible by referents", async () => {
      const passport = require("passport");
      await request(getAppHelper()).get(`/young/${notExistingYoungId}/patches`).send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });

  describe("PUT /young/validate_mission", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).put("/young/validate_mission").send({});
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper()).put("/young/validate_mission").send({});
      expect(res.statusCode).toEqual(200);
      passport.user = previous;
    });
    it("should be only accessible by young", async () => {
      const passport = require("passport");
      await request(getAppHelper()).put("/young/validate_mission").send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("young");
    });
  });

  describe("PUT /young/:id/meeting-point", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).put(`/young/${notExistingYoungId}/meeting-point`).send({});
      expect(res.statusCode).toEqual(404);
    });
    it("should return 404 if meeting point not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper()).put(`/young/${young._id}/meeting-point`).send({
        meetingPointId: notExistingYoungId,
      });
      expect(res.statusCode).toEqual(404);
    });
    it("should return 404 if bus is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const meetingPoint = await createMeetingPointHelper({ ...getNewMeetingPointFixture(), busId: notExistingYoungId });
      const res = await request(getAppHelper()).put(`/young/${young._id}/meeting-point`).send({
        meetingPointId: meetingPoint._id,
      });
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young, bus and meeting point are found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const bus = await createBusHelper(getNewBusFixture());
      const meetingPoint = await createMeetingPointHelper({ ...getNewMeetingPointFixture(), busId: bus._id.toString() });
      const res = await request(getAppHelper()).put(`/young/${young._id}/meeting-point`).send({
        meetingPointId: meetingPoint._id,
        deplacementPhase1Autonomous: "true",
      });
      expect(res.statusCode).toEqual(200);
    });
    it("should be only accessible by young and referent", async () => {
      const passport = require("passport");
      await request(getAppHelper()).put(`/young/${notExistingYoungId}/meeting-point`).send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual(["young", "referent"]);
    });
  });

  describe("PUT /young/:id/cancel-meeting-point", () => {
    it("should return 404 if young not found", async () => {
      const res = await request(getAppHelper()).put(`/young/${notExistingYoungId}/cancel-meeting-point`).send({});
      expect(res.statusCode).toEqual(404);
    });
    it("should return 200 if young found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper()).put(`/young/${young._id}/cancel-meeting-point`).send({});
      expect(res.statusCode).toEqual(200);
    });
    it("should be only accessible by referent", async () => {
      const passport = require("passport");
      await request(getAppHelper()).put(`/young/${notExistingYoungId}/cancel-meeting-point`).send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
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
          })
        )
        .mockReturnValue(Promise.resolve({}));
      fetch.mockReturnValue(
        Promise.resolve({
          status: 200,
          json: jsonResponse,
        })
      );
      const res = await request(getAppHelper()).post("/young/france-connect/user-info").send({
        code: "foo",
        callback: "bar",
      });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("PUT /young", () => {
    async function selfUpdateYoung(body = {}) {
      const young = await createYoungHelper(getNewYoungFixture());
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
        zip: "qpvShouldWork",
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

    it("should cascade status to WITHDRAWN", async () => {
      const { updatedYoung, response } = await selfUpdateYoung({ status: "WITHDRAWN" });
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.status).toEqual("WITHDRAWN");
      expect(updatedYoung.statusPhase1).toEqual("WITHDRAWN");
      expect(updatedYoung.statusPhase2).toEqual("WITHDRAWN");
      expect(updatedYoung.statusPhase3).toEqual("WITHDRAWN");
    });

    it("should update young name", async () => {
      const { updatedYoung, response } = await selfUpdateYoung({ lastName: "HOP" });
      expect(response.statusCode).toEqual(200);
      expect(updatedYoung.lastName).toEqual("HOP");
    });

    it("should remove places when sending to cohesion center", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const placesLeft = cohesionCenter.placesLeft;
      const { updatedYoung, response } = await selfUpdateYoung({
        cohesionCenterId: cohesionCenter._id,
        status: "VALIDATED",
        statusPhase1: "DONE",
      });
      expect(response.statusCode).toEqual(200);
      const updatedCohesionCenter = await getCohesionCenterById(updatedYoung.cohesionCenterId);
      expect(updatedCohesionCenter.placesLeft).toEqual(placesLeft - 1);
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
        password: "%%minMAJ123",
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
      passport.user.set = jest.fn();

      const res = await request(getAppHelper())
        .post("/young/file/CniFile")
        .send({ body: JSON.stringify({ names: ["e"] }) });
      expect(res.body).toEqual({ data: ["e"], ok: true });
      expect(passport.user.set).toHaveBeenCalledWith({ CniFile: ["e"] });
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
});
