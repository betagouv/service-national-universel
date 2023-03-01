require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getNewBusFixture = require("./fixtures/bus");
const getAppHelper = require("./helpers/app");
const { createBusHelper, notExistingBusId } = require("./helpers/bus");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Bus", () => {
  describe("GET /bus/:id", () => {
    it("should return 404 when application is not found", async () => {
      const res = await request(getAppHelper()).get(`/bus/${notExistingBusId}`);
      expect(res.status).toBe(404);
    });
    it("should return application", async () => {
      const bus = await createBusHelper(getNewBusFixture());
      const res = await request(getAppHelper()).get("/bus/" + bus._id);
      expect(res.status).toBe(200);
    });
    it("should be only accessible by referent", async () => {
      const passport = require("passport");

      await request(getAppHelper()).put(`/bus/${notExistingBusId}`).send();
      expect(passport.lastTypeCalledOnAuthenticate).toEqual("referent");
    });
  });
});
