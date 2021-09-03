require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getNewBusFixture = require("./fixtures/bus");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const getNewMeetingPointFixture = require("./fixtures/meetingPoint");

const getNewYoungFixture = require("./fixtures/young");
const getAppHelper = require("./helpers/app");
const { createBusHelper } = require("./helpers/bus");
const { createCohesionCenter, notExistingCohesionCenterId } = require("./helpers/cohesionCenter");
const { dbConnect, dbClose } = require("./helpers/db");
const { createMeetingPointHelper, notExistingMeetingPointId } = require("./helpers/meetingPoint");
const { createYoungHelper } = require("./helpers/young");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Meeting point", () => {
  describe("GET /meeting-point/:id", () => {
    it("should return 404 when meeting point is not found", async () => {
      const res = await request(getAppHelper())
        .get("/meeting-point/" + notExistingMeetingPointId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when meeting point is found", async () => {
      const meetingPoint = await createMeetingPointHelper(getNewMeetingPointFixture());
      const res = await request(getAppHelper())
        .get("/meeting-point/" + meetingPoint._id)
        .send();
      expect(res.status).toBe(200);
    });
    it("should be only accessible by young and referent", async () => {
      const passport = require("passport");
      await request(getAppHelper()).get("/meeting-point/" + notExistingMeetingPointId);
      expect(passport.lastTypeCalledOnAuthenticate).toStrictEqual(["young", "referent"]);
    });
    it("should return 200 when meeting point is found for a young", async () => {
      const meetingPoint = await createMeetingPointHelper(getNewMeetingPointFixture());
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: meetingPoint._id });
      const passport = require("passport");
      passport.user = young;
      const res = await request(getAppHelper())
        .get("/meeting-point/" + meetingPoint._id)
        .send();
      expect(res.status).toBe(200);
    });
    it("should return 401 if young try to access other meetingPoint", async () => {
      const meetingPoint = await createMeetingPointHelper(getNewMeetingPointFixture());
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: notExistingMeetingPointId });
      const passport = require("passport");
      passport.user = young;
      const res = await request(getAppHelper()).get("/meeting-point/" + meetingPoint._id);
      expect(res.status).toBe(401);
    });
  });

  describe("GET /meeting-point/all", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).get("/meeting-point/all").send();
      expect(res.status).toBe(200);
    });
    it("should be only accessible by referent", async () => {
      const passport = require("passport");
      await request(getAppHelper()).get("/meeting-point/all");
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });

  describe("GET /meeting-point", () => {
    it("should return 404 when meeting-point is not found", async () => {
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        cohesionCenterId: notExistingCohesionCenterId,
      });
      const passport = require("passport");
      passport.user = young;
      const res = await request(getAppHelper()).get("/meeting-point").send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when young has a meeting point", async () => {
      const code = Date.now().toString();
      const department = Date.now().toString();
      const cohesionCenter = await createCohesionCenter({ ...getNewCohesionCenterFixture(), code });
      const bus = await createBusHelper(getNewBusFixture());
      const young = await createYoungHelper({
        ...getNewYoungFixture(),
        cohesionCenterId: cohesionCenter._id,
        department: department,
      });
      const meetingPoint = await createMeetingPointHelper({
        ...getNewMeetingPointFixture(),
        centerCode: code,
        departureDepartment: department,
        busId: bus._id,
      });

      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await request(getAppHelper()).get("/meeting-point").send();
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].bus._id).toBe(bus._id.toString());
      expect(res.body.data[0]._id).toBe(meetingPoint._id.toString());

      passport.user = previous;
    });
    it("should be only accessible by young", async () => {
      const passport = require("passport");
      await request(getAppHelper()).get("/meeting-point");
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("young");
    });
  });
});
