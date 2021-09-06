require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, notExistingYoungId } = require("./helpers/young");
const { createMeetingPointHelper, notExistingMeetingPointId } = require("./helpers/meetingPoint");
const getNewMeetingPointFixture = require("./fixtures/meetingPoint");
const { createBusHelper } = require("./helpers/bus");
const getNewBusFixture = require("./fixtures/bus");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

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

describe("PUT /young/:id/meeting-point/cancel", () => {
  it("should return 404 if young not found", async () => {
    const res = await request(getAppHelper()).put(`/young/${notExistingYoungId}/meeting-point/cancel`).send({});
    expect(res.statusCode).toEqual(404);
  });
  it("should return 200 if young found", async () => {
    const young = await createYoungHelper(getNewYoungFixture());
    const res = await request(getAppHelper()).put(`/young/${young._id}/meeting-point/cancel`).send({});
    expect(res.statusCode).toEqual(200);
  });
  it("should be only accessible by referent", async () => {
    const passport = require("passport");
    await request(getAppHelper()).put(`/young/${notExistingYoungId}/meeting-point/cancel`).send();
    expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
  });
});

describe("GET /young/:id/meeting-point", () => {
  it("should return 404 when young is not found", async () => {
    const res = await request(getAppHelper()).get(`/young/${notExistingYoungId}/meeting-point`).send();
    expect(res.status).toBe(404);
  });
  it("should return null when young has no meeting point", async () => {
    const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: notExistingMeetingPointId });
    const res = await request(getAppHelper()).get(`/young/${young._id}/meeting-point`).send();
    expect(res.status).toBe(200);
    expect(res.body.data).toBeFalsy();
  });
  it("should return 200 when young has a meeting point", async () => {
    const meetingPoint = await createMeetingPointHelper(getNewMeetingPointFixture());
    const young = await createYoungHelper({ ...getNewYoungFixture(), meetingPointId: meetingPoint._id });
    const res = await request(getAppHelper()).get(`/young/${young._id}/meeting-point`).send();
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(meetingPoint._id.toString());
  });
  it("should be only accessible by referent", async () => {
    const passport = require("passport");
    await request(getAppHelper()).get(`/young/${notExistingYoungId}/meeting-point`);
    expect(passport.lastTypeCalledOnAuthenticate).toEqual(["referent"]);
  });
});
