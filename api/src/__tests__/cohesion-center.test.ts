import request from "supertest";
import { getNewCohesionCenterFixture } from "./fixtures/cohesionCenter";
import getNewYoungFixture from "./fixtures/young";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { notExistingCohesionCenterId, createCohesionCenter } from "./helpers/cohesionCenter";
import { dbConnect, dbClose } from "./helpers/db";
import { createYoungHelper } from "./helpers/young";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
}));

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getSignedUrl: () => "",
}));

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
afterEach(resetAppAuth);

describe("Cohesion Center", () => {
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
      const res = await request(getAppHelper(young))
        .get("/cohesion-center/young/" + notExistingCohesionCenterId)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 404 when young has no center", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: notExistingCohesionCenterId });
      const res = await request(getAppHelper(young))
        .get("/cohesion-center/young/" + young._id)
        .send();
      expect(res.status).toBe(404);
    });
    it("should return 200 when young has a center", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: cohesionCenter._id });

      const res = await request(getAppHelper(young))
        .get("/cohesion-center/young/" + young._id)
        .send();
      expect(res.status).toBe(200);
    });
    it("should only allow young to see their own cohesion center", async () => {
      const cohesionCenter = await createCohesionCenter(getNewCohesionCenterFixture());
      const young = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: cohesionCenter._id });
      const secondYoung = await createYoungHelper({ ...getNewYoungFixture(), cohesionCenterId: cohesionCenter._id });

      // Successful request
      let res = await request(getAppHelper(young))
        .get("/cohesion-center/young/" + young._id)
        .send();
      expect(res.status).toBe(200);

      // Failed request (not allowed)
      res = await request(getAppHelper(young))
        .get("/cohesion-center/young/" + secondYoung._id)
        .send();
      expect(res.status).toBe(403);
    });
  });
});
