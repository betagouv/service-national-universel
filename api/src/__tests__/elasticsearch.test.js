require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

jest.mock("node-fetch");

beforeAll(dbConnect);
afterAll(dbClose);

describe("Elasticsearch", () => {
  describe("POST /elasticsearch/missionapi/search", () => {
    it("Should return 200", async () => {
      const body = { filters: { distance: 10, location: { lat: 48.856614, lon: 2.3522219 } }, page: 0, size: 20, sort: "geo" };
      const response = await request(getAppHelper()).post("/elasticsearch/missionapi/search").send(body);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
