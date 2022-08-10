require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getNewBusFixture = require("./fixtures/bus");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const getNewMeetingPointFixture = require("./fixtures/meetingPoint");
const getNewReferentFixture = require("./fixtures/referent");
const getNewYoungFixture = require("./fixtures/young");
const getAppHelper = require("./helpers/app");
const { createBusHelper, getBusByIdHelper } = require("./helpers/bus");
const { notExistingCohesionCenterId, createCohesionCenter, getCohesionCenterById } = require("./helpers/cohesionCenter");
const { dbConnect, dbClose } = require("./helpers/db");
const { createMeetingPointHelper, getMeetingPointByIdHelper } = require("./helpers/meetingPoint");
const { createReferentHelper, getReferentByIdHelper } = require("./helpers/referent");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { ROLES } = require("snu-lib/roles");

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getSignedUrl: () => "",
}));

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Cohesion Center", () => {
  describe("POST /cohesion-center", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).post("/cohesion-center").send(getNewCohesionCenterFixture());
      expect(res.status).toBe(200);
    });
    it("should only not be accessible by responsible", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;

      const res = await request(getAppHelper()).post("/cohesion-center").send(getNewCohesionCenterFixture());
      expect(res.status).toBe(403);

      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("POST cohesion-center/:centerId/assign-young/:youngId", () => {
    it("should return 404 when center is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/cohesion-center/" + notExistingCohesionCenterId + "/assign-young/" + young._id)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 404 when young is not found", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const res = await request(getAppHelper())
        .post("/cohesion-center/" + cohesionCenter._id + "/assign-young/" + notExistingCohesionCenterId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when young and cohesion center is found", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/cohesion-center/" + cohesionCenter._id + "/assign-young/" + young._id)
        .send();
      expect(res.status).toBe(200);

      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung.cohesionCenterId).toBe(cohesionCenter._id.toString());
      expect(updatedYoung.status).toBe("VALIDATED");
      expect(updatedYoung.statusPhase1).toBe("AFFECTED");
    });
    it("should update places in bus", async () => {
      const bus = await createBusHelper(getNewBusFixture());
      const meetingPoint = await createMeetingPointHelper({ ...getNewMeetingPointFixture(), busId: bus._id });
      const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: meetingPoint._id });
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());

      const res = await request(getAppHelper())
        .post("/cohesion-center/" + cohesionCenter._id + "/assign-young/" + young._id)
        .send();
      expect(res.status).toBe(200);

      const updatedBus = await getBusByIdHelper(bus._id);
      expect(updatedBus.placesLeft).toBe(updatedBus.capacity);

      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung.meetingPointId).toBeFalsy();

      const updatedCohesionCenter = await getCohesionCenterById(cohesionCenter._id);
    });
    it("should remove from center's waiting list", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const cohesionCenter = await createCohesionCenter({ ...getNewCohesionCenterFixture(), waitingList: [young._id] });

      const res = await request(getAppHelper())
        .post("/cohesion-center/" + cohesionCenter._id + "/assign-young/" + young._id)
        .send();
      expect(res.status).toBe(200);

      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung.meetingPointId).toBeFalsy();

      const updatedCohesionCenter = await getCohesionCenterById(cohesionCenter._id);
      expect(updatedCohesionCenter.waitingList).not.toEqual(expect.arrayContaining([young._id.toString()]));
    });
    it("should remove from old center's waiting list", async () => {
      const oldCohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: oldCohesionCenter._id });
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());

      const res = await request(getAppHelper())
        .post("/cohesion-center/" + cohesionCenter._id + "/assign-young/" + young._id)
        .send();
      expect(res.status).toBe(200);

      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung.meetingPointId).toBeFalsy();
      expect(updatedYoung.cohesionCenterId).toEqual(cohesionCenter._id.toString());

      const updatedOldCohesionCenter = await getCohesionCenterById(cohesionCenter._id);
      expect(updatedOldCohesionCenter.waitingList).not.toEqual(expect.arrayContaining([young._id.toString()]));
    });
  });

  describe("POST cohesion-center/:centerId/assign-young-waiting-list/:youngId", () => {
    it("should return 404 when center is not found", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/cohesion-center/" + notExistingCohesionCenterId + "/assign-young-waiting-list/" + young._id)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 404 when young is not found", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const res = await request(getAppHelper())
        .post("/cohesion-center/" + cohesionCenter._id + "/assign-young-waiting-list/" + notExistingCohesionCenterId)
        .send();
      expect(res.status).toBe(404);
    });

    it("should return 200 when young and cohesion center is found", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper())
        .post("/cohesion-center/" + cohesionCenter._id + "/assign-young-waiting-list/" + young._id)
        .send();
      expect(res.status).toBe(200);
      expect(res.body.data.waitingList).toEqual(expect.arrayContaining([young._id.toString()]));

      const updatedYoung = await getYoungByIdHelper(young._id);
      expect(updatedYoung.cohesionCenterId).toBe(cohesionCenter._id.toString());
      expect(updatedYoung.statusPhase1).toBe("WAITING_LIST");
    });
  });

  describe("GET /cohesion-center/:id", () => {
    it("should return 404 when cohesion center is not found", async () => {
      const res = await request(getAppHelper())
        .get("/cohesion-center/" + notExistingCohesionCenterId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when cohesion center is found", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const res = await request(getAppHelper())
        .get("/cohesion-center/" + cohesionCenter._id)
        .send();
      expect(res.status).toBe(200);
    });
  });

  describe("GET /cohesion-center", () => {
    it("should return 200", async () => {
      const res = await request(getAppHelper()).get("/cohesion-center/").send();
      expect(res.status).toBe(200);
    });
  });

  describe("GET /cohesion-center/young/:id", () => {
    it("should return 403 when young is not the current young found", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: notExistingCohesionCenterId });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper())
        .get("/cohesion-center/young/" + notExistingCohesionCenterId)
        .send();
      expect(res.status).toBe(404);
      passport.user = previous;
    });
    it("should return 404 when young has no center", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: notExistingCohesionCenterId });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper())
        .get("/cohesion-center/young/" + young._id)
        .send();
      expect(res.status).toBe(404);
      passport.user = previous;
    });
    it("should return 200 when young has a center", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: cohesionCenter._id });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper())
        .get("/cohesion-center/young/" + young._id)
        .send();
      expect(res.status).toBe(200);
      passport.user = previous;
    });
    it("should only allow young to see their own cohesion center", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: cohesionCenter._id });
      const secondYoung = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: cohesionCenter._id });

      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      // Successful request
      let res = await request(getAppHelper())
        .get("/cohesion-center/young/" + young._id)
        .send();
      expect(res.status).toBe(200);

      // Failed request (not allowed)
      res = await request(getAppHelper())
        .get("/cohesion-center/young/" + secondYoung._id)
        .send();
      expect(res.status).toBe(403);

      passport.user = previous;
    });
  });

  describe("PUT /cohesion-center/:id", () => {
    it("should return 404 when cohesion center is not found", async () => {
      const res = await request(getAppHelper())
        .put("/cohesion-center/" + notExistingCohesionCenterId)
        .send({
          name: "newname",
        });
      expect(res.status).toBe(404);
    });
    it("should return 200 when cohesion center is found", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const res = await request(getAppHelper())
        .put("/cohesion-center/" + cohesionCenter._id)
        .send({
          name: "new name",
        });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("new name");
    });
    it("should updateCenterDependencies", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const referent = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.HEAD_CENTER, cohesionCenterId: cohesionCenter._id });
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: cohesionCenter._id });
      const meetingPoint = await createMeetingPointHelper({ ...getNewMeetingPointFixture(), centerId: cohesionCenter._id });

      const res = await request(getAppHelper())
        .put("/cohesion-center/" + cohesionCenter._id)
        .send({
          name: "new name",
          code2022: "new code",
        });
      expect(res.status).toBe(200);

      const updatedReferent = await getReferentByIdHelper(referent._id);
      const updatedYoung = await getYoungByIdHelper(young._id);
      const updatedMeetingPoint = await getMeetingPointByIdHelper(meetingPoint._id);
      expect(updatedReferent.cohesionCenterName).toBe("new name");
      expect(updatedYoung.cohesionCenterName).toBe("new name");
      expect(updatedMeetingPoint.centerCode).toBe("new code");
    });
    it("should be only allowed to admin", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.RESPONSIBLE;
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const res = await request(getAppHelper())
        .put("/cohesion-center/" + cohesionCenter._id)
        .send({
          name: "nonono",
        });
      expect(res.status).toBe(403);
      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("DELETE /cohesion-center/:id", () => {
    it("should return 404 when cohesion center is not found", async () => {
      const res = await request(getAppHelper())
        .delete("/cohesion-center/" + notExistingCohesionCenterId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when cohesion center is found", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const res = await request(getAppHelper())
        .delete("/cohesion-center/" + cohesionCenter._id)
        .send();
      expect(res.status).toBe(200);
    });
  });
  it("should deleteCenterDependencies", async () => {
    const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
    const referent = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.HEAD_CENTER, cohesionCenterId: cohesionCenter._id });
    const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: cohesionCenter._id });
    const meetingPoint = await createMeetingPointHelper({ ...getNewMeetingPointFixture(), centerId: cohesionCenter._id });

    await request(getAppHelper())
      .delete("/cohesion-center/" + cohesionCenter._id)
      .send();

    const updatedReferent = await getReferentByIdHelper(referent._id);
    const updatedYoung = await getYoungByIdHelper(young._id);
    const updatedMeetingPoint = await getMeetingPointByIdHelper(meetingPoint._id);
    expect(updatedReferent.cohesionCenterName).toBeUndefined();
    expect(updatedYoung.cohesionCenterName).toBeUndefined();
    expect(updatedMeetingPoint.centerCode).toBeUndefined();
  });
  it("should be only allowed to admin", async () => {
    const passport = require("passport");
    passport.user.role = ROLES.RESPONSIBLE;
    const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
    const res = await request(getAppHelper())
      .delete("/cohesion-center/" + cohesionCenter._id)
      .send();
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });
});
