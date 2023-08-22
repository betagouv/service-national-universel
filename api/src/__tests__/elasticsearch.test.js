require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { createMissionHelper } = require("./helpers/mission");
const { createMissionApiHelper } = require("./helpers/missionapi");
const getNewMissionFixture = require("./fixtures/mission");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

jest.mock("node-fetch");

beforeAll(dbConnect);
afterAll(dbClose);

describe("Elasticsearch", () => {
  describe("POST /elasticsearch/missionapi/search", () => {
    it("Should return 200", async () => {
      const mission = await createMissionApiHelper(getNewMissionFixture({ domain: "education" }));
      const body = { filters: { domain: mission.domain, distance: 50, location: { lat: 48.856614, lon: 2.3522219 } }, page: 0, size: 20, sort: "geo" };
      const response = await request(getAppHelper()).post("/elasticsearch/missionapi/search").send(body);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
  describe("POST /elasticsearch/mission/young/search", () => {
    it("Should return 200", async () => {
      const mission = await createMissionHelper(getNewMissionFixture({ domains: ["CITIZENSHIP"] }));
      const body = { filters: { domains: mission.domains, distance: 50, location: { lat: 48.856614, lon: 2.3522219 } }, page: 0, size: 20, sort: "geo" };
      console.log("🚀 ~ file: elasticsearch.test.js:31 ~ it ~ mission:", mission)
      const response = await request(getAppHelper()).post("/elasticsearch/mission/young/search").send(body);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
