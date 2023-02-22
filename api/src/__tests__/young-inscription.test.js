require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { createYoungHelper, getYoungByIdHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");
const { STEPS2023, YOUNG_STATUS } = require("../utils");
const { START_DATE_SESSION_PHASE1 } = require("snu-lib");

beforeAll(dbConnect);
afterAll(dbClose);

jest.mock("../sendinblue", () => ({
  ...jest.requireActual("../sendinblue"),
  sendEmail: () => Promise.resolve(),
}));

jest.setTimeout(10_000);

describe("Young", () => {
  describe("PUT /young/inscription2023/done", () => {
    it("Should return 404 when young is not found", async () => {
      let res = await request(getAppHelper()).put("/young/inscription2023/done");
      expect(res.status).toBe(404);
    });

    it("Should return 200 otherwiser", async () => {
      const passport = require("passport");
      const user = await createYoungHelper(getNewYoungFixture());
      passport.user = user;
      let res = await request(getAppHelper()).put("/young/inscription2023/done");
      const responseData = res.body.data;
      const updatedYoung = await getYoungByIdHelper(passport.user._id);
      expect(res.status).toBe(200);
      expect(responseData).toMatchObject({ inscriptionStep2023: STEPS2023.DONE });
      expect(updatedYoung).toMatchObject({ inscriptionStep2023: STEPS2023.DONE });
    });
  });
});
