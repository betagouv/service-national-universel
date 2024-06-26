const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");

beforeAll(dbConnect);
afterAll(dbClose);

describe("Waiting List", () => {
  describe("POST /", () => {
    it("should post a new entry in waiting list", async () => {
      const res = await request(getAppHelper()).post("/waiting-list").send({ mail: "test@test.test", birthdateAt: "01/01/2000" });
      expect(res.statusCode).toEqual(200);
    });
  });
});
