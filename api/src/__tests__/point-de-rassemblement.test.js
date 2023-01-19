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
  describe("GET /point-de-rassemblement/available", () => {
    it("should return 404 when young has no sessionPhase1Id", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;
      const res = await request(getAppHelper())
        .get("/meeting-point/" + notExistingMeetingPointId)
        .send();
      expect(res.status).toBe(404);
      passport.user = previous;
    });
  });
});
