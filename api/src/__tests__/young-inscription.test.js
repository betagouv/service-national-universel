require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const { YOUNG_STATUS } = require("snu-lib");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

describe("Young", () => {
  describe("PUT /young/inscription2023/noneligible", () => {
    it("Should return 404 when young is not found", async () => {
      const passport = require("passport");
      passport.user = {};

      let res = await request(getAppHelper()).put("/young/inscription2023/noneligible");
      expect(res.status).toBe(404);

      passport.user._id = null;
      res = await request(getAppHelper()).put("/young/inscription2023/noneligible");
      expect(res.status).toBe(404);
    });
    it("Should return 200 otherwise", async () => {
      const user = await createYoungHelper(getNewYoungFixture());
      const passport = require("passport");
      passport.user = user;
      let res = await request(getAppHelper()).put("/young/inscription2023/noneligible");
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(updatedYoung.status).toBe(YOUNG_STATUS.NOT_ELIGIBLE);
      expect(responseData.status).toBe(YOUNG_STATUS.NOT_ELIGIBLE);
    });
  });
});
